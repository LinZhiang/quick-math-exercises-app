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
    process.exit(1)
  }
  if (r.signal) {
    console.error(`[cf-build] 构建进程被终止：${r.signal}`)
    process.exit(1)
  }
  if (r.status) process.exit(r.status)
}

if (!isCf) {
  run('npx', ['vue-tsc', '-b'])
}

const srcData = path.join(root, 'server', 'data', 'computer-basics')
const publicData = path.join(root, 'public', 'cb-data')
if (fs.existsSync(path.join(srcData, 'catalog.json'))) {
  fs.cpSync(srcData, publicData, { recursive: true })
  console.log('[cf-build] 已同步计算机基础快照到 public/cb-data')
}

const srcFl = path.join(root, 'server', 'data', 'frontend-learning')
const publicFl = path.join(root, 'public', 'fl-data')
if (fs.existsSync(path.join(srcFl, 'catalog.json'))) {
  fs.cpSync(srcFl, publicFl, { recursive: true })
  console.log('[cf-build] 已同步前端学习快照到 public/fl-data')
}

run('npx', isCf ? ['vite', 'build', '--logLevel', 'warn'] : ['vite', 'build'])
