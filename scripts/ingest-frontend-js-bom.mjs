import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  stripFrontendLearningChapterPrefixes,
  upsertFrontendLearningFolder,
} from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, '.tmp-js-bom')
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')

const CHAPTERS = [
  { id: 'fl-js-bom-engine', title: '浏览器模型概述', file: 'engine.md', tags: ['讲义', 'JavaScript', 'BOM'] },
  { id: 'fl-js-bom-window', title: 'window 对象', file: 'window.md', tags: ['讲义', 'JavaScript', 'window'] },
  { id: 'fl-js-bom-navigator', title: 'Navigator 对象，Screen 对象', file: 'navigator.md', tags: ['讲义', 'JavaScript', 'Navigator'] },
  { id: 'fl-js-bom-cookie', title: 'Cookie', file: 'cookie.md', tags: ['讲义', 'JavaScript', 'Cookie'] },
  { id: 'fl-js-bom-xmlhttprequest', title: 'XMLHttpRequest 对象', file: 'xmlhttprequest.md', tags: ['讲义', 'JavaScript', 'XMLHttpRequest'] },
  { id: 'fl-js-bom-same-origin', title: '同源限制', file: 'same-origin.md', tags: ['讲义', 'JavaScript', '同源'] },
  { id: 'fl-js-bom-cors', title: 'CORS 通信', file: 'cors.md', tags: ['讲义', 'JavaScript', 'CORS'] },
  { id: 'fl-js-bom-storage', title: 'Storage 接口', file: 'storage.md', tags: ['讲义', 'JavaScript', 'Storage'] },
  { id: 'fl-js-bom-history', title: 'History 对象', file: 'history.md', tags: ['讲义', 'JavaScript', 'History'] },
  { id: 'fl-js-bom-location', title: 'Location 对象，URL 对象，URLSearchParams 对象', file: 'location.md', tags: ['讲义', 'JavaScript', 'Location'] },
  { id: 'fl-js-bom-arraybuffer', title: 'ArrayBuffer 对象，Blob 对象', file: 'arraybuffer.md', tags: ['讲义', 'JavaScript', 'ArrayBuffer'] },
  { id: 'fl-js-bom-file', title: 'File 对象，FileList 对象，FileReader 对象', file: 'file.md', tags: ['讲义', 'JavaScript', 'File'] },
  { id: 'fl-js-bom-form', title: '表单，FormData 对象', file: 'form.md', tags: ['讲义', 'JavaScript', 'FormData'] },
  { id: 'fl-js-bom-indexeddb', title: 'IndexedDB API', file: 'indexeddb.md', tags: ['讲义', 'JavaScript', 'IndexedDB'] },
  { id: 'fl-js-bom-webworker', title: 'Web Worker', file: 'webworker.md', tags: ['讲义', 'JavaScript', 'Web Worker'] },
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
    learningPath: ['前端基础', '浏览器模型'],
    tags: ch.tags,
    content: md,
  }
})

stripFrontendLearningChapterPrefixes()
const result = upsertFrontendLearningFolder({
  parentId: 'fl-frontend-basics',
  folder: { id: 'fl-js-bom', name: '浏览器模型', children: [] },
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
