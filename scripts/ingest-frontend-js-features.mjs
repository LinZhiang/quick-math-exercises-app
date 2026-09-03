import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { upsertFrontendLearningFolder } from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, '.tmp-js-features')
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')

const CHAPTERS = [
  {
    id: 'fl-js-features-conversion',
    title: '4.1 数据类型的转换',
    file: 'conversion.md',
    tags: ['讲义', 'JavaScript', '类型转换'],
  },
  {
    id: 'fl-js-features-error',
    title: '4.2 错误处理机制',
    file: 'error.md',
    tags: ['讲义', 'JavaScript', '错误处理'],
  },
  {
    id: 'fl-js-features-style',
    title: '4.3 编程风格',
    file: 'style.md',
    tags: ['讲义', 'JavaScript', '编程风格'],
  },
  {
    id: 'fl-js-features-console',
    title: '4.4 console 对象与控制台',
    file: 'console.md',
    tags: ['讲义', 'JavaScript', 'console'],
  },
]

const FOLDER = {
  id: 'fl-js-features',
  name: '4. 语法专题',
  children: [],
}

function tidyMarkdown(raw, title) {
  let s = String(raw ?? '').replace(/\r\n/g, '\n').trim()
  s = s.replace(/\n## 参考[链连][\s\S]*$/u, '').trim()
  s = s.replace(/^# .+$/m, `# ${title}`)
  s = s.replace(/```javascript/g, '```js')
  s = s.replace(/[ \t]+\n/g, '\n')
  s = s.replace(/\n{3,}/g, '\n\n')
  return `${s.trim()}\n`
}

function upsertSeedFolder(tree, parentId, folder, entries) {
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.id === parentId) {
        if (!Array.isArray(node.children)) node.children = []
        const next = { ...folder, entries }
        const idx = node.children.findIndex((n) => n.id === folder.id)
        if (idx >= 0) node.children[idx] = next
        else node.children.push(next)
        return true
      }
      if (walk(node.children || [])) return true
    }
    return false
  }
  if (!walk(tree)) throw new Error(`种子目录找不到父分类 ${parentId}`)
}

const items = CHAPTERS.map((ch) => {
  const md = tidyMarkdown(fs.readFileSync(path.join(srcDir, ch.file), 'utf8'), ch.title)
  if (!md.startsWith(`# ${ch.title}`)) throw new Error(`${ch.file} 标题整理失败`)
  if (/## 参考[链连]/.test(md)) throw new Error(`${ch.file} 参考链接未剔除`)
  return {
    id: ch.id,
    title: ch.title,
    type: 'handout',
    learningPath: ['前端基础', '4. 语法专题'],
    tags: ch.tags,
    content: md,
  }
})

const result = upsertFrontendLearningFolder({
  parentId: 'fl-frontend-basics',
  folder: FOLDER,
  items,
})

const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'))
if (!Array.isArray(seed.tree)) throw new Error('seed.tree 无效')
if (!seed.items || typeof seed.items !== 'object') seed.items = {}
for (const item of items) seed.items[item.id] = item
upsertSeedFolder(
  seed.tree,
  'fl-frontend-basics',
  FOLDER,
  items.map((it) => ({ id: it.id, title: it.title, type: 'handout', ready: true })),
)
fs.writeFileSync(seedFile, `${JSON.stringify(seed, null, 2)}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      nodeFolder: result.folder.name,
      itemCount: result.itemCount,
      ready: result.folder.entries.map((e) => ({ id: e.id, title: e.title, ready: e.ready })),
    },
    null,
    2,
  ),
)
