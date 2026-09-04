import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rewriteFrontendLearningJsCodeFences } from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')

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

const result = rewriteFrontendLearningJsCodeFences()
syncSeedFromLive()

const sample = JSON.parse(
  fs.readFileSync(path.join(dataRoot, 'items', 'fl-js-types-function.json'), 'utf8'),
)
const i = sample.content.indexOf('function fib')
console.log(
  JSON.stringify(
    {
      ...result,
      fib: sample.content.slice(i, i + 220),
    },
    null,
    2,
  ),
)
