import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  stripFrontendLearningChapterPrefixes,
  upsertFrontendLearningFolder,
} from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, '.tmp-js-dom')
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')

const CHAPTERS = [
  { id: 'fl-js-dom-general', title: '概述', file: 'general.md', tags: ['讲义', 'JavaScript', 'DOM'] },
  { id: 'fl-js-dom-node', title: 'Node 接口', file: 'node.md', tags: ['讲义', 'JavaScript', 'Node'] },
  { id: 'fl-js-dom-nodelist', title: 'NodeList 接口，HTMLCollection 接口', file: 'nodelist.md', tags: ['讲义', 'JavaScript', 'NodeList'] },
  { id: 'fl-js-dom-parentnode', title: 'ParentNode 接口，ChildNode 接口', file: 'parentnode.md', tags: ['讲义', 'JavaScript', 'ParentNode'] },
  { id: 'fl-js-dom-document', title: 'Document 节点', file: 'document.md', tags: ['讲义', 'JavaScript', 'Document'] },
  { id: 'fl-js-dom-element', title: 'Element 节点', file: 'element.md', tags: ['讲义', 'JavaScript', 'Element'] },
  { id: 'fl-js-dom-attributes', title: '属性的操作', file: 'attributes.md', tags: ['讲义', 'JavaScript', '属性'] },
  { id: 'fl-js-dom-text', title: 'Text 节点和 DocumentFragment 节点', file: 'text.md', tags: ['讲义', 'JavaScript', 'Text'] },
  { id: 'fl-js-dom-css', title: 'CSS 操作', file: 'css.md', tags: ['讲义', 'JavaScript', 'CSS'] },
  { id: 'fl-js-dom-mutationobserver', title: 'Mutation Observer API', file: 'mutationobserver.md', tags: ['讲义', 'JavaScript', 'MutationObserver'] },
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
    learningPath: ['前端基础', 'DOM'],
    tags: ch.tags,
    content: md,
  }
})

stripFrontendLearningChapterPrefixes()
const result = upsertFrontendLearningFolder({
  parentId: 'fl-frontend-basics',
  folder: { id: 'fl-js-dom', name: 'DOM', children: [] },
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
