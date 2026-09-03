import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  stripFrontendLearningChapterPrefixes,
  upsertFrontendLearningFolder,
} from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, '.tmp-js-elements')
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')

const CHAPTERS = [
  { id: 'fl-js-elements-a', title: '<a>', file: 'a.md', tags: ['讲义', 'JavaScript', 'a'] },
  { id: 'fl-js-elements-img', title: '<img>', file: 'image.md', tags: ['讲义', 'JavaScript', 'img'] },
  { id: 'fl-js-elements-form', title: '<form>', file: 'form.md', tags: ['讲义', 'JavaScript', 'form'] },
  { id: 'fl-js-elements-input', title: '<input>', file: 'input.md', tags: ['讲义', 'JavaScript', 'input'] },
  { id: 'fl-js-elements-button', title: '<button>', file: 'button.md', tags: ['讲义', 'JavaScript', 'button'] },
  { id: 'fl-js-elements-option', title: '<option>', file: 'option.md', tags: ['讲义', 'JavaScript', 'option'] },
  { id: 'fl-js-elements-video', title: '<video>，<audio>', file: 'video.md', tags: ['讲义', 'JavaScript', 'video'] },
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
    learningPath: ['前端基础', '附录：网页元素接口'],
    tags: ch.tags,
    content: md,
  }
})

stripFrontendLearningChapterPrefixes()
const result = upsertFrontendLearningFolder({
  parentId: 'fl-frontend-basics',
  folder: { id: 'fl-js-elements', name: '附录：网页元素接口', children: [] },
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
