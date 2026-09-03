import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  stripFrontendLearningChapterPrefixes,
  upsertFrontendLearningFolder,
} from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, '.tmp-js-events')
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')

const CHAPTERS = [
  { id: 'fl-js-events-eventtarget', title: 'EventTarget 接口', file: 'eventtarget.md', tags: ['讲义', 'JavaScript', 'EventTarget'] },
  { id: 'fl-js-events-model', title: '事件模型', file: 'model.md', tags: ['讲义', 'JavaScript', '事件模型'] },
  { id: 'fl-js-events-event', title: 'Event 对象', file: 'event.md', tags: ['讲义', 'JavaScript', 'Event'] },
  { id: 'fl-js-events-mouse', title: '鼠标事件', file: 'mouse.md', tags: ['讲义', 'JavaScript', '鼠标事件'] },
  { id: 'fl-js-events-keyboard', title: '键盘事件', file: 'keyboard.md', tags: ['讲义', 'JavaScript', '键盘事件'] },
  { id: 'fl-js-events-progress', title: '进度事件', file: 'progress.md', tags: ['讲义', 'JavaScript', '进度事件'] },
  { id: 'fl-js-events-form', title: '表单事件', file: 'form.md', tags: ['讲义', 'JavaScript', '表单事件'] },
  { id: 'fl-js-events-touch', title: '触摸事件', file: 'touch.md', tags: ['讲义', 'JavaScript', '触摸事件'] },
  { id: 'fl-js-events-drag', title: '拖拉事件', file: 'drag.md', tags: ['讲义', 'JavaScript', '拖拉事件'] },
  { id: 'fl-js-events-common', title: '其他常见事件', file: 'common.md', tags: ['讲义', 'JavaScript', '常见事件'] },
  { id: 'fl-js-events-globaleventhandlers', title: 'GlobalEventHandlers 接口', file: 'globaleventhandlers.md', tags: ['讲义', 'JavaScript', 'GlobalEventHandlers'] },
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
    learningPath: ['前端基础', '事件'],
    tags: ch.tags,
    content: md,
  }
})

stripFrontendLearningChapterPrefixes()
const result = upsertFrontendLearningFolder({
  parentId: 'fl-frontend-basics',
  folder: { id: 'fl-js-events', name: '事件', children: [] },
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
