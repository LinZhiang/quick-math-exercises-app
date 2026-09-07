/**
 * 只改 Node 已入库讲义的 content，不碰 catalog / 增删改路由。
 * 用法：node scripts/repair-w3c-handout-content.mjs [--dry]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { repairW3cHandoutMarkdown } from './_lib/repair-w3c-handout-md.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dry = process.argv.includes('--dry')

const JOBS = [
  {
    itemsDir: path.join(root, 'server', 'data', 'frontend-learning', 'items'),
    publicDir: path.join(root, 'public', 'fl-data', 'items'),
    seedFile: path.join(root, 'server', 'seeds', 'frontend-learning-seed.json'),
    catalogFile: path.join(root, 'server', 'data', 'frontend-learning', 'catalog.json'),
    match: (id) => /^(fl-html-|fl-css-|fl-vue-|fl-engineering-|fl-perf-|fl-interview-)/.test(id),
  },
  {
    itemsDir: path.join(root, 'server', 'data', 'computer-basics', 'items'),
    publicDir: path.join(root, 'public', 'cb-data', 'items'),
    seedFile: null,
    catalogFile: null,
    match: (id) => /^(cb-network-|cb-browser-)/.test(id),
  },
]

function writeItem(itemsDir, publicDir, item) {
  const rec = { ...item, updatedAt: new Date().toISOString() }
  const text = `${JSON.stringify(rec, null, 2)}\n`
  const file = path.join(itemsDir, `${item.id}.json`)
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, text, 'utf8')
  fs.renameSync(tmp, file)
  if (publicDir && fs.existsSync(path.dirname(publicDir))) {
    fs.mkdirSync(publicDir, { recursive: true })
    fs.copyFileSync(file, path.join(publicDir, `${item.id}.json`))
  }
}

function syncFrontendSeed(job) {
  if (!job.seedFile || !job.catalogFile) return
  if (!fs.existsSync(job.catalogFile) || !fs.existsSync(job.itemsDir)) return
  const catalog = JSON.parse(fs.readFileSync(job.catalogFile, 'utf8'))
  const items = {}
  for (const name of fs.readdirSync(job.itemsDir)) {
    if (!name.endsWith('.json')) continue
    const item = JSON.parse(fs.readFileSync(path.join(job.itemsDir, name), 'utf8'))
    if (item?.id) items[item.id] = item
  }
  fs.writeFileSync(job.seedFile, `${JSON.stringify({ tree: catalog.tree, items }, null, 2)}\n`, 'utf8')
}

const summary = []

for (const job of JOBS) {
  if (!fs.existsSync(job.itemsDir)) continue
  for (const name of fs.readdirSync(job.itemsDir)) {
    if (!name.endsWith('.json')) continue
    const id = name.slice(0, -5)
    if (!job.match(id)) continue
    const file = path.join(job.itemsDir, name)
    const item = JSON.parse(fs.readFileSync(file, 'utf8'))
    const content = String(item.content ?? '')
    if (!content.trim()) continue
    const next = repairW3cHandoutMarkdown(content)
    if (next === content) continue
    summary.push({
      id,
      before: content.length,
      after: next.length,
      fencesBefore: (content.match(/```/g) || []).length / 2,
      fencesAfter: (next.match(/```/g) || []).length / 2,
    })
    if (dry) continue
    writeItem(job.itemsDir, job.publicDir, { ...item, content: next })
  }
  if (!dry) syncFrontendSeed(job)
}

const previewIds = ['fl-vue-v3-1', 'fl-vue-base-2', 'fl-vue-comms-1', 'fl-vue-router-1', 'fl-perf-debounce-1']
const previews = {}
for (const id of previewIds) {
  const hit = summary.find((s) => s.id === id)
  if (!hit) continue
  const live = path.join(root, 'server', 'data', 'frontend-learning', 'items', `${id}.json`)
  if (!fs.existsSync(live)) continue
  const item = JSON.parse(fs.readFileSync(live, 'utf8'))
  const src = dry ? repairW3cHandoutMarkdown(String(item.content ?? '')) : String(item.content ?? '')
  const m = src.match(/```[\s\S]*?```/)
  previews[id] = m ? m[0].slice(0, 900) : src.slice(0, 400)
}

console.log(
  JSON.stringify(
    {
      dry,
      changed: summary.length,
      ids: summary.map((s) => s.id),
      summary,
      previews,
    },
    null,
    2,
  ),
)
