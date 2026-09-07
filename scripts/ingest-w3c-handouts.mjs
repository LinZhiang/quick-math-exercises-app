import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { upsertFrontendLearningBranch } from '../server/frontend-learning-store.mjs'
import { upsertComputerBasicsBranch } from '../server/computer-basics-store.mjs'
import { tidyJsFencesInMarkdown } from '../server/tidy-js-code.mjs'
import {
  appendSource,
  clipTitle,
  convertDocxToChapters,
  fixHandoutText,
  splitChapterBySize,
  stripChapterPrefix,
  tidyMarkdown,
} from './_lib/w3c-docx-to-md.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const unpacked = path.join(root, '.tmp-w3c-docx')
const flData = path.join(root, 'server', 'data', 'frontend-learning')
const flSeed = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const statsOnly = process.argv.includes('--stats')

const JOBS = [
  {
    dir: 'HTML基础知识',
    catalog: 'frontend',
    branchId: 'fl-html',
    branchName: 'HTML基础知识',
    afterId: 'fl-dsa',
    langHint: 'html',
    maxQuestions: 10,
    singleFolderName: '常见问题',
  },
  {
    dir: 'CSS知识',
    catalog: 'frontend',
    branchId: 'fl-css',
    branchName: 'CSS知识',
    afterId: 'fl-html',
    langHint: 'css',
    maxQuestions: 10,
  },
  {
    dir: 'Vue篇',
    catalog: 'frontend',
    branchId: 'fl-vue',
    branchName: 'Vue篇',
    afterId: 'fl-css',
    langHint: 'js',
    maxQuestions: 12,
  },
  {
    dir: 'Vue项目的性能优化',
    catalog: 'frontend',
    branchId: 'fl-vue-perf',
    branchName: 'Vue项目的性能优化',
    afterId: 'fl-vue',
    langHint: 'js',
    maxQuestions: 20,
  },
  {
    dir: '前端工程化篇',
    catalog: 'frontend',
    branchId: 'fl-engineering',
    branchName: '前端工程化篇',
    afterId: 'fl-vue-perf',
    langHint: 'js',
    maxQuestions: 16,
  },
  {
    dir: '性能优化篇',
    catalog: 'frontend',
    branchId: 'fl-perf',
    branchName: '性能优化篇',
    afterId: 'fl-engineering',
    langHint: 'js',
    maxQuestions: 16,
  },
  {
    dir: '前端面试部分',
    catalog: 'frontend',
    branchId: 'fl-interview',
    branchName: '前端面试部分',
    afterId: 'fl-perf',
    langHint: 'js',
    maxQuestions: 20,
  },
  {
    dir: '计算机网络篇',
    catalog: 'computer',
    branchId: 'cb-network',
    branchName: '计算机网络',
    afterId: 'part-2',
    langHint: 'js',
    maxQuestions: 12,
  },
  {
    dir: '浏览器原理篇',
    catalog: 'computer',
    branchId: 'cb-browser',
    branchName: '浏览器原理',
    afterId: 'cb-network',
    langHint: 'js',
    maxQuestions: 12,
  },
]

function slugPart(s, fallback) {
  const map = {
    HTML基础知识: 'html',
    常见问题: 'qa',
    CSS基础: 'base',
    页面布局: 'layout',
    定位与浮动: 'position',
    场景应用: 'scene',
    'Vue 基础': 'base',
    Vue基础: 'base',
    生命周期: 'lifecycle',
    组件通信: 'comms',
    路由: 'router',
    Vuex: 'vuex',
    'Vue 3.0': 'v3',
    虚拟DOM: 'vnode',
    前言: 'intro',
    代码层面的优化: 'code',
    'Webpack 层面的优化': 'webpack',
    基础的Web技术优化: 'web',
    '基础的 Web 技术优化': 'web',
    Git: 'git',
    Webpack: 'webpack',
    其他: 'other',
    CDN: 'cdn',
    懒加载: 'lazy',
    回流与重绘: 'reflow',
    节流与防抖: 'debounce',
    图片优化: 'image',
    Webpack优化: 'wp',
    前端面试准备: 'prep',
    前端面试程序员面试软技能: 'soft',
    '前端面试 程序员面试软技能': 'soft',
    程序员面试软技能: 'soft',
    HTTP协议: 'http',
    HTTPS协议: 'https',
    HTTP状态码: 'status',
    DNS协议介绍: 'dns',
    网络模型: 'model',
    TCP与UDP: 'tcp-udp',
    WebSocket: 'ws',
    浏览器安全: 'security',
    进程与线程: 'process',
    浏览器缓存: 'cache',
    浏览器组成: 'parts',
    浏览器渲染原理: 'render',
    浏览器本地存储: 'storage',
    浏览器同源策略: 'origin',
    浏览器事件机制: 'event',
    浏览器垃圾回收机制: 'gc',
  }
  if (map[s]) return map[s]
  const ascii = String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return ascii || fallback
}

function finalizeMarkdown(title, md) {
  let s = tidyMarkdown(fixHandoutText(md))
  if (!/^# /m.test(s)) s = `# ${title}\n\n${s}`
  else s = s.replace(/^# .+$/m, `# ${title}`)
  s = tidyJsFencesInMarkdown(s)
  return appendSource(s)
}

function buildGroups(job, chapters) {
  const used = new Set()
  const groups = []
  chapters.forEach((ch, ci) => {
    let folderName = clipTitle(stripChapterPrefix(ch.title) || job.branchName)
    folderName = folderName.replace(/^前端面试\s+/, '')
    if (folderName === job.branchName && job.singleFolderName) folderName = job.singleFolderName
    let folderKey = slugPart(folderName, `g${ci + 1}`)
    let folderId = `${job.branchId}-${folderKey}`
    let n = 2
    while (used.has(folderId)) {
      folderId = `${job.branchId}-${folderKey}-${n}`
      n += 1
    }
    used.add(folderId)
    const pieces = splitChapterBySize(ch, {
      maxQuestions: job.maxQuestions || 12,
    })
    const items = pieces.map((piece, pi) => {
      const title = clipTitle(String(piece.title || '').replace(/^前端面试\s+/, ''))
      const id = pieces.length === 1 ? `${folderId}-1` : `${folderId}-${pi + 1}`
      return {
        id,
        title,
        type: 'handout',
        learningPath: [job.branchName, folderName],
        tags: ['讲义', job.branchName, folderName, title],
        content: finalizeMarkdown(title, piece.markdown),
      }
    })
    groups.push({ id: folderId, name: folderName, items })
  })
  return groups
}

function splitFoldersAndDirect(job, groups) {
  const children = []
  const entries = []
  for (const group of groups) {
    if (group.items.length > 1) {
      children.push(group)
      continue
    }
    const item = group.items[0]
    entries.push({
      ...item,
      learningPath: [job.branchName],
      tags: ['讲义', job.branchName, item.title],
    })
  }
  return { children, entries }
}

function syncFrontendSeed() {
  const catalog = JSON.parse(fs.readFileSync(path.join(flData, 'catalog.json'), 'utf8'))
  const itemsDir = path.join(flData, 'items')
  const items = {}
  for (const name of fs.readdirSync(itemsDir)) {
    if (!name.endsWith('.json')) continue
    const item = JSON.parse(fs.readFileSync(path.join(itemsDir, name), 'utf8'))
    if (item?.id) items[item.id] = item
  }
  fs.writeFileSync(flSeed, `${JSON.stringify({ tree: catalog.tree, items }, null, 2)}\n`, 'utf8')
}

const summary = []

for (const job of JOBS) {
  const dir = path.join(unpacked, job.dir)
  if (!fs.existsSync(path.join(dir, 'word', 'document.xml'))) {
    throw new Error(`找不到解压目录：${dir}`)
  }
  const chapters = convertDocxToChapters(dir, { langHint: job.langHint })
  const groups = buildGroups(job, chapters)
  const preview = {
    branch: job.branchName,
    catalog: job.catalog,
    groups: groups.map((g) => ({
      name: g.name,
      items: g.items.map((it) => ({
        id: it.id,
        title: it.title,
        chars: it.content.length,
      })),
    })),
  }
  summary.push(preview)
  console.log(JSON.stringify(preview, null, 2))
  if (statsOnly) continue

  for (const g of groups) {
    for (const it of g.items) {
      if (!it.content.trim() || it.content.length < 80) {
        throw new Error(`讲义过短：${it.id}`)
      }
      if (!it.content.includes('来源：https://www.w3cschool.cn/')) {
        throw new Error(`缺少来源：${it.id}`)
      }
    }
  }

  const { children, entries } = splitFoldersAndDirect(job, groups)
  const upsert = job.catalog === 'computer' ? upsertComputerBasicsBranch : upsertFrontendLearningBranch
  const result = upsert({
    id: job.branchId,
    name: job.branchName,
    afterId: job.afterId,
    children,
    entries,
  })
  console.log(
    `写入 ${result.branch.name}：${result.itemCount} 篇（小类 ${children.length}，直挂 ${entries.length}）`,
  )
}

if (!statsOnly) {
  syncFrontendSeed()
}

console.log(
  JSON.stringify(
    {
      statsOnly,
      branches: summary.map((s) => ({
        name: s.branch,
        folders: s.groups.length,
        items: s.groups.reduce((n, g) => n + g.items.length, 0),
      })),
    },
    null,
    2,
  ),
)
