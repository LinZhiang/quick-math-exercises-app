/**
 * 把本机计算机单词题库拷到 public/cs-vocab/bank.json，构建/预览直接带上，手机不必再单独 sync KV。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC_FILES = [
  path.join(root, 'src', 'utils', 'cs-vocab', 'bank.generated.json'),
  path.join(root, 'server', 'data', 'cs-vocab', 'bank.json'),
]
const DEST = path.join(root, 'public', 'cs-vocab', 'bank.json')

function loadItems() {
  for (const file of SRC_FILES) {
    if (!fs.existsSync(file)) continue
    try {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
      const items = Array.isArray(raw) ? raw : raw.items
      if (Array.isArray(items) && items.length) return { items, file }
    } catch {
      /* skip */
    }
  }
  return null
}

export function syncCsVocabPublicBank() {
  const pack = loadItems()
  if (!pack) {
    console.warn('[sync:cs-vocab] 本机没有题库文件，跳过拷贝 public/cs-vocab/bank.json')
    return 0
  }
  fs.mkdirSync(path.dirname(DEST), { recursive: true })
  fs.writeFileSync(DEST, `${JSON.stringify({ items: pack.items })}\n`, 'utf8')
  console.log(`[sync:cs-vocab] ${pack.items.length} 题 → public/cs-vocab/bank.json（来自 ${path.relative(root, pack.file)}）`)
  return pack.items.length
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirect) syncCsVocabPublicBank()
