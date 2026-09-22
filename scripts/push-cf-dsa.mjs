/**
 * 把本机编程题（src/utils/dsa/problems/*.ts，不进 Git）同步到 Cloudflare KV。
 * 用法：npm run sync:cf-dsa
 * 也会在 npm run sync:cf-computer 成功后自动尝试一次。
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, 'server', '.env')
const PROJECT = process.env.CF_PAGES_PROJECT || 'quick-math-exercises-app'
const HOST =
  (process.env.CF_PAGES_URL || '').trim().replace(/\/$/, '') ||
  `https://${PROJECT}.pages.dev`

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

export async function loadLocalDsaPack() {
  const iter = path.join(root, 'src', 'utils', 'dsa', 'problems', 'iteration.ts')
  const rec = path.join(root, 'src', 'utils', 'dsa', 'problems', 'recursion.ts')
  if (!fs.existsSync(iter) || !fs.existsSync(rec)) return { iteration: [], recursion: [] }
  const esbuild = require('esbuild')
  const outfile = path.join(os.tmpdir(), `dsa-pack-${process.pid}.mjs`)
  await esbuild.build({
    stdin: {
      contents: `import { ITERATION_PROBLEMS } from ${JSON.stringify('./src/utils/dsa/problems/iteration.ts')}
import { RECURSION_PROBLEMS } from ${JSON.stringify('./src/utils/dsa/problems/recursion.ts')}
export { ITERATION_PROBLEMS, RECURSION_PROBLEMS }
`,
      resolveDir: root,
      sourcefile: 'dsa-pack-entry.ts',
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    absWorkingDir: root,
    alias: { '@': path.join(root, 'src') },
    logLevel: 'silent',
  })
  try {
    const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`)
    return {
      iteration: Array.isArray(mod.ITERATION_PROBLEMS) ? mod.ITERATION_PROBLEMS : [],
      recursion: Array.isArray(mod.RECURSION_PROBLEMS) ? mod.RECURSION_PROBLEMS : [],
    }
  } finally {
    try {
      fs.unlinkSync(outfile)
    } catch {
      /* ignore */
    }
  }
}

export async function publishDsaBank(host, token) {
  const pack = await loadLocalDsaPack()
  const count = pack.iteration.length + pack.recursion.length
  if (!count) {
    console.log('[sync:cf-dsa] 本机没有编程题文件，已跳过')
    return { skipped: true }
  }
  const res = await fetch(`${host}/api/dsa/bank`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'X-Wengu-Client': 'app',
    },
    body: JSON.stringify(pack),
  })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`接口不是 JSON（HTTP ${res.status}）：${text.slice(0, 240)}`)
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.message || text.slice(0, 240))
  }
  console.log(`[sync:cf-dsa] 已上传 ${data.count} 题（迭代 ${data.iteration}，递归 ${data.recursion}）`)
  return data
}

async function main() {
  const env = readEnvFile(envPath)
  const username = (env.WENGU_ADMIN_USERNAME || 'admin').trim()
  const password = (env.WENGU_ADMIN_PASSWORD || '').trim()
  if (!password) {
    console.error('[sync:cf-dsa] 请先在 server/.env 填写 WENGU_ADMIN_PASSWORD')
    process.exit(1)
  }
  const pack = await loadLocalDsaPack()
  const count = pack.iteration.length + pack.recursion.length
  if (!count) {
    console.error('[sync:cf-dsa] 找不到题目。请确认 src/utils/dsa/problems/iteration.ts 与 recursion.ts 在本机。')
    process.exit(1)
  }
  console.log(`[sync:cf-dsa] 目标：${HOST}，${count} 题`)
  const loginRes = await fetch(`${HOST}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Wengu-Client': 'app' },
    body: JSON.stringify({ username, password }),
  })
  const loginText = await loginRes.text()
  let login
  try {
    login = JSON.parse(loginText)
  } catch {
    console.error('[sync:cf-dsa] 登录接口不是 JSON。请先部署带 Functions 的版本。')
    console.error(loginText.slice(0, 240))
    process.exit(1)
  }
  if (!loginRes.ok || !login.ok || !login.token) {
    console.error('[sync:cf-dsa] 登录失败：', login.message || loginText.slice(0, 240))
    process.exit(1)
  }
  await publishDsaBank(HOST, login.token)
  console.log(`打开 ${HOST}/dsa 即可练。若仍是旧页，请强刷或去掉主屏幕旧图标后重开。`)
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirect) {
  main().catch((e) => {
    console.error('[sync:cf-dsa]', e instanceof Error ? e.message : e)
    process.exit(1)
  })
}
