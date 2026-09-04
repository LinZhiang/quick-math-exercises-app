/**
 * 给 Cloudflare Pages 配好 WENGU_KV，让手机/其他设备也能增删改讲义。
 * 需要本机已执行过：npx wrangler login
 *
 * 会：创建（或复用）KV → 写入 wrangler.toml → 尽量绑到 Pages 项目 → 提示同步讲义。
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const tomlPath = path.join(root, 'wrangler.toml')
const PROJECT = process.env.CF_PAGES_PROJECT || 'quick-math-exercises-app'
const BINDING = 'WENGU_KV'

function wrangler(args, opts = {}) {
  const r = spawnSync('npx', ['wrangler', ...args], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    ...opts,
  })
  return r
}

function mustWrangler(args) {
  const r = wrangler(args)
  const out = `${r.stdout || ''}${r.stderr || ''}`
  if (r.status !== 0) {
    const err = new Error(out.trim() || `wrangler ${args.join(' ')} 失败`)
    err.output = out
    throw err
  }
  return out
}

function upsertTomlKv(id, previewId) {
  let toml = fs.existsSync(tomlPath) ? fs.readFileSync(tomlPath, 'utf8') : ''
  const block = [
    '[[kv_namespaces]]',
    `binding = "${BINDING}"`,
    `id = "${id}"`,
    `preview_id = "${previewId || id}"`,
    '',
  ].join('\n')
  if (/\[\[kv_namespaces\]\]/.test(toml)) {
    toml = toml.replace(/\[\[kv_namespaces\]\][\s\S]*?(?=\n\[\[|\n*$)/, block)
  } else {
    toml = `${toml.replace(/\s+$/, '')}\n\n${block}`
  }
  fs.writeFileSync(tomlPath, toml.endsWith('\n') ? toml : `${toml}\n`, 'utf8')
}

function parseNamespaceId(text) {
  const m =
    text.match(/id\s*=\s*"([0-9a-f]{32})"/i) ||
    text.match(/\bid\b[^0-9a-f]{0,16}([0-9a-f]{32})/i) ||
    text.match(/\b([0-9a-f]{32})\b/i)
  return m?.[1] || ''
}

function listNamespaces() {
  const out = mustWrangler(['kv', 'namespace', 'list'])
  try {
    const data = JSON.parse(out.replace(/^[\s\S]*?(\[[\s\S]*\])\s*$/, '$1'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function findExisting(list) {
  const want = [BINDING, `${PROJECT}-${BINDING}`, `${PROJECT}_WENGU_KV`]
  return (
    list.find((n) => want.includes(String(n.title || n.name || ''))) ||
    list.find((n) => String(n.title || '').includes('WENGU')) ||
    null
  )
}

function createNamespace(title) {
  const out = mustWrangler(['kv', 'namespace', 'create', title])
  const id = parseNamespaceId(out)
  if (!id) throw new Error(`创建 KV 后未能解析 id。输出：\n${out.slice(0, 800)}`)
  return id
}

const who = wrangler(['whoami'])
if (who.status !== 0 || /not authenticated/i.test(`${who.stdout}${who.stderr}`)) {
  console.error('[setup:cf-storage] 还没登录 Cloudflare。正在打开登录页…')
  const login = wrangler(['login'], { stdio: 'inherit' })
  if (login.status !== 0) {
    console.error('登录失败。请在本机终端执行：npx wrangler login')
    process.exit(1)
  }
}

console.log('[setup:cf-storage] 已登录，正在准备 KV…')
const listed = listNamespaces()
let ns = findExisting(listed)
let preview = listed.find((n) => String(n.title || '').includes(`${BINDING}_preview`))
if (!ns) {
  console.log(`[setup:cf-storage] 创建命名空间 ${BINDING}`)
  const id = createNamespace(BINDING)
  ns = { id, title: BINDING }
}
if (!preview) {
  try {
    console.log(`[setup:cf-storage] 创建预览命名空间 ${BINDING}_preview`)
    const id = createNamespace(`${BINDING}_preview`)
    preview = { id, title: `${BINDING}_preview` }
  } catch (e) {
    console.warn('[setup:cf-storage] 预览 KV 创建失败，生产/预览将共用一个：', e instanceof Error ? e.message : e)
  }
}

upsertTomlKv(ns.id, preview?.id || ns.id)
console.log(`[setup:cf-storage] 已写入 wrangler.toml`)
console.log(`  production  ${ns.id}`)
console.log(`  preview     ${preview?.id || ns.id}`)

const deployHint = wrangler(['pages', 'project', 'list'])
if (deployHint.status === 0) {
  console.log('[setup:cf-storage] Pages 项目列表：')
  console.log((deployHint.stdout || '').trim().slice(0, 1200))
}

console.log(`
[setup:cf-storage] KV 已写入 wrangler.toml。正在尝试部署 Pages（让其他设备能改）…
`)

const dist = path.join(root, 'dist')
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.log('[setup:cf-storage] 还没有 dist，先构建…')
  const build = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true })
  if (build.status !== 0) {
    console.error('[setup:cf-storage] 构建失败。修好后执行：npx wrangler pages deploy dist --project-name=' + PROJECT)
    process.exit(build.status || 1)
  }
}

const deploy = spawnSync(
  'npx',
  ['wrangler', 'pages', 'deploy', 'dist', `--project-name=${PROJECT}`],
  { cwd: root, stdio: 'inherit', shell: true },
)
if (deploy.status !== 0) {
  console.error('[setup:cf-storage] 自动部署没成功。请把本次 wrangler.toml 推到连着 Pages 的仓库，或在控制台 Retry deployment。')
  process.exit(deploy.status || 1)
}

console.log(`
[setup:cf-storage] 部署完成。正在把本机讲义灌进云端…
`)
const syncFl = spawnSync('npm', ['run', 'sync:cf-frontend'], { cwd: root, stdio: 'inherit', shell: true })
const syncCb = spawnSync('npm', ['run', 'sync:cf-computer'], { cwd: root, stdio: 'inherit', shell: true })
if (syncFl.status !== 0 || syncCb.status !== 0) {
  console.error('[setup:cf-storage] 灌库有失败。确认 Pages 新部署已带上 WENGU_KV 后重试：')
  console.error('  npm run sync:cf-frontend')
  console.error('  npm run sync:cf-computer')
  process.exit(1)
}
console.log(`手机打开 https://${PROJECT}.pages.dev 用管理员登录即可改讲义。`)

