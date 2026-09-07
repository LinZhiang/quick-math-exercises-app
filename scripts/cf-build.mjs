/**
 * Cloudflare Pages / 本地统一构建入口
 * CF 上跳过 vue-tsc，关掉体积统计，并提高 Node 内存上限，避免构建被杀掉。
 */
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const isCf = Boolean(process.env.CF_PAGES || process.env.CLOUDFLARE_PAGES)
const HANDOUT_PUBLIC_DIRS = ['fl-data', 'cb-data']

/** vite 会把 public/ 打进 dist；讲义快照只给本机预览，不能进 Pages 静态资源。 */
function parkHandoutSnapshots() {
  const parked = []
  const tmpRoot = path.join(root, '.tmp-handout-public')
  for (const name of HANDOUT_PUBLIC_DIRS) {
    const from = path.join(root, 'public', name)
    if (!fs.existsSync(from)) continue
    fs.mkdirSync(tmpRoot, { recursive: true })
    const to = path.join(tmpRoot, name)
    if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true })
    fs.renameSync(from, to)
    parked.push({ from, to })
  }
  return parked
}

function restoreHandoutSnapshots(parked) {
  for (const { from, to } of parked) {
    if (!fs.existsSync(to)) continue
    fs.mkdirSync(path.dirname(from), { recursive: true })
    if (fs.existsSync(from)) fs.rmSync(from, { recursive: true, force: true })
    fs.renameSync(to, from)
  }
}

function mergeNodeOptions(current, extra) {
  const parts = String(current || '')
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!parts.some((p) => p.startsWith('--max-old-space-size'))) parts.push(extra)
  return parts.join(' ')
}

function run(cmd, args) {
  const env = {
    ...process.env,
    NODE_OPTIONS: mergeNodeOptions(process.env.NODE_OPTIONS, '--max-old-space-size=4096'),
    FORCE_COLOR: '0',
    NO_COLOR: '1',
  }
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true, env })
  if (r.error) {
    console.error('[cf-build]', r.error)
    return 1
  }
  if (r.signal) {
    console.error(`[cf-build] 构建进程被终止：${r.signal}`)
    return 1
  }
  return r.status || 0
}

if (!isCf) {
  const tsc = run('npx', ['vue-tsc', '-b'])
  if (tsc) process.exit(tsc)
}

const parked = parkHandoutSnapshots()
let code = 0
try {
  code = run('npx', isCf ? ['vite', 'build', '--logLevel', 'warn'] : ['vite', 'build'])
} finally {
  restoreHandoutSnapshots(parked)
}
if (code) process.exit(code)
