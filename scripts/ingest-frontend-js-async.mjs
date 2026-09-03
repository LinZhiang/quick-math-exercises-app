import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  stripFrontendLearningChapterPrefixes,
  upsertFrontendLearningFolder,
} from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, '.tmp-js-async')
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')

const CHAPTERS = [
  { id: 'fl-js-async-general', title: '概述', file: 'general.md', tags: ['讲义', 'JavaScript', '异步'] },
  { id: 'fl-js-async-timer', title: '定时器', file: 'timer.md', tags: ['讲义', 'JavaScript', '定时器'] },
  { id: 'fl-js-async-promise', title: 'Promise 对象', file: 'promise.md', tags: ['讲义', 'JavaScript', 'Promise'] },
]

function tidyMarkdown(raw, title) {
  let s = String(raw ?? '').replace(/\r\n/g, '\n').trim()
  s = s.replace(/\n## 参考[链连][\s\S]*$/u, '').trim()
  s = s.replace(/^# .+$/m, `# ${title}`)
  s = s.replace(/```javascript/g, '```js')
  s = s.replace(/[ \t]+\n/g, '\n')
  s = s.replace(/\n{3,}/g, '\n\n')
  return `${s.trim()}\n`
}

function syncSeedFromLive() {
  const catalog = JSON.parse(fs.readFileSync(path.join(dataRoot, 'catalog.json'), 'utf8'))
  const itemsDir = path.join(dataRoot, 'items')
  const items = {}
  for (const name of fs.readdirSync(itemsDir)) {
    if (!name.endsWith('.json')) continue
    const item = JSON.parse(fs.readFileSync(path.join(itemsDir, name), 'utf8'))
    if (item?.id) items[item.id] = item
  }
  fs.writeFileSync(seedFile, `${JSON.stringify({ tree: catalog.tree, items }, null, 2)}\n`, 'utf8')
}

const items = CHAPTERS.map((ch) => {
  const md = tidyMarkdown(fs.readFileSync(path.join(srcDir, ch.file), 'utf8'), ch.title)
  if (!md.startsWith(`# ${ch.title}`)) throw new Error(`${ch.file} 标题整理失败`)
  if (/## 参考[链连]/.test(md)) throw new Error(`${ch.file} 参考链接未剔除`)
  if (/^\d+(?:\.\d+)*\.?\s+/.test(ch.title)) throw new Error(`${ch.file} 标题带了序号`)
  return {
    id: ch.id,
    title: ch.title,
    type: 'handout',
    learningPath: ['前端基础', '异步操作'],
    tags: ch.tags,
    content: md,
  }
})

stripFrontendLearningChapterPrefixes()
const result = upsertFrontendLearningFolder({
  parentId: 'fl-frontend-basics',
  folder: { id: 'fl-js-async', name: '异步操作', children: [] },
  items,
})
syncSeedFromLive()

console.log(
  JSON.stringify(
    {
      folder: result.folder.name,
      entries: result.folder.entries.map((e) => ({ title: e.title, ready: e.ready })),
    },
    null,
    2,
  ),
)
