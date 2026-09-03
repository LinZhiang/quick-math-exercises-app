import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  stripFrontendLearningChapterPrefixes,
  upsertFrontendLearningFolder,
} from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, '.tmp-js-stdlib')
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')

const CHAPTERS = [
  { id: 'fl-js-stdlib-object', title: 'Object 对象', file: 'object.md', tags: ['讲义', 'JavaScript', 'Object'] },
  { id: 'fl-js-stdlib-attributes', title: '属性描述对象', file: 'attributes.md', tags: ['讲义', 'JavaScript', '属性描述'] },
  { id: 'fl-js-stdlib-array', title: 'Array 对象', file: 'array.md', tags: ['讲义', 'JavaScript', 'Array'] },
  { id: 'fl-js-stdlib-wrapper', title: '包装对象', file: 'wrapper.md', tags: ['讲义', 'JavaScript', '包装对象'] },
  { id: 'fl-js-stdlib-boolean', title: 'Boolean 对象', file: 'boolean.md', tags: ['讲义', 'JavaScript', 'Boolean'] },
  { id: 'fl-js-stdlib-number', title: 'Number 对象', file: 'number.md', tags: ['讲义', 'JavaScript', 'Number'] },
  { id: 'fl-js-stdlib-string', title: 'String 对象', file: 'string.md', tags: ['讲义', 'JavaScript', 'String'] },
  { id: 'fl-js-stdlib-math', title: 'Math 对象', file: 'math.md', tags: ['讲义', 'JavaScript', 'Math'] },
  { id: 'fl-js-stdlib-date', title: 'Date 对象', file: 'date.md', tags: ['讲义', 'JavaScript', 'Date'] },
  { id: 'fl-js-stdlib-regexp', title: 'RegExp 对象', file: 'regexp.md', tags: ['讲义', 'JavaScript', 'RegExp'] },
  { id: 'fl-js-stdlib-json', title: 'JSON 对象', file: 'json.md', tags: ['讲义', 'JavaScript', 'JSON'] },
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
  fs.writeFileSync(
    seedFile,
    `${JSON.stringify({ tree: catalog.tree, items }, null, 2)}\n`,
    'utf8',
  )
}

const items = CHAPTERS.map((ch) => {
  const md = tidyMarkdown(fs.readFileSync(path.join(srcDir, ch.file), 'utf8'), ch.title)
  if (!md.startsWith(`# ${ch.title}`)) throw new Error(`${ch.file} 标题整理失败`)
  if (/## 参考[链连]/.test(md)) throw new Error(`${ch.file} 参考链接未剔除`)
  if (/^\d+(?:\.\d+)*\s+/.test(ch.title)) throw new Error(`${ch.file} 标题带了序号`)
  return {
    id: ch.id,
    title: ch.title,
    type: 'handout',
    learningPath: ['前端基础', '标准库'],
    tags: ch.tags,
    content: md,
  }
})

const stripped = stripFrontendLearningChapterPrefixes()
const result = upsertFrontendLearningFolder({
  parentId: 'fl-frontend-basics',
  folder: { id: 'fl-js-stdlib', name: '标准库', children: [] },
  items,
})
syncSeedFromLive()

const basics = stripped.tree.find((n) => n.id === 'fl-frontend-basics')
console.log(
  JSON.stringify(
    {
      folders: (basics?.children || []).map((n) => n.name),
      stdlib: result.folder.entries.map((e) => ({ title: e.title, ready: e.ready })),
    },
    null,
    2,
  ),
)
