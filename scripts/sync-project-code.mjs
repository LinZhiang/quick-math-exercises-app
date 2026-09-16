/**
 * 把项目管理源码（vue/js/ts 等）拷到 server/data/project-code，不进 Git。
 * 用法：node scripts/sync-project-code.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = process.env.PROJECT_CODE_SOURCE || 'G:\\chenggongruanjian\\project-3\\0521'
const DEST = path.join(root, 'server', 'data', 'project-code', '0521')

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'public',
  'qtCesium',
  'coverage',
  '.vite',
  '.wrangler',
  '.idea',
  '.vscode',
])

const SKIP_FILES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'components.d.ts',
  'auto-imports.d.ts',
])

const KEEP_EXT = new Set([
  '.vue',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.less',
  '.html',
  '.json',
])

const MAX_BYTES = 1_500_000

function shouldKeepFile(name) {
  if (SKIP_FILES.has(name) || name.startsWith('.')) return false
  return KEEP_EXT.has(path.extname(name).toLowerCase())
}

function copyTree(fromDir, toDir) {
  let files = 0
  fs.mkdirSync(toDir, { recursive: true })
  for (const ent of fs.readdirSync(fromDir, { withFileTypes: true })) {
    if (ent.name === '.' || ent.name === '..') continue
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name) || ent.name.startsWith('.')) continue
      files += copyTree(path.join(fromDir, ent.name), path.join(toDir, ent.name))
      continue
    }
    if (!ent.isFile() || !shouldKeepFile(ent.name)) continue
    const src = path.join(fromDir, ent.name)
    const st = fs.statSync(src)
    if (st.size > MAX_BYTES) continue
    fs.copyFileSync(src, path.join(toDir, ent.name))
    files += 1
  }
  return files
}

function pruneEmpty(dir) {
  if (!fs.existsSync(dir)) return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue
    const child = path.join(dir, ent.name)
    pruneEmpty(child)
    if (fs.readdirSync(child).length === 0) fs.rmdirSync(child)
  }
}

export function syncProjectCode() {
  if (!fs.existsSync(SOURCE)) {
    console.warn(`[sync:project-code] 找不到源目录：${SOURCE}`)
    return 0
  }
  fs.rmSync(DEST, { recursive: true, force: true })
  const count = copyTree(SOURCE, DEST)
  pruneEmpty(DEST)
  console.log(`[sync:project-code] ${count} 个文件 → ${path.relative(root, DEST)}`)
  return count
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirect) syncProjectCode()
