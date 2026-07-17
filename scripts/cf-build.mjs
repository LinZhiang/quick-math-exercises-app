/**
 * Cloudflare Pages / 本地统一构建入口
 * CF 上跳过 vue-tsc，避免内存不足；并确保同步 .env.local 成功
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const isCf = Boolean(process.env.CF_PAGES || process.env.CLOUDFLARE_PAGES)

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true, env: process.env })
  if (r.status) process.exit(r.status)
}

if (!isCf) {
  run('npx', ['vue-tsc', '-b'])
}
run('npx', ['vite', 'build'])
