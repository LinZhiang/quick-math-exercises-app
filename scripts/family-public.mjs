/**
 * 出门可用：家庭 HTTPS 服务 + Cloudflare 快速隧道（公网 HTTPS）
 * 手机可打开隧道 URL；pages.dev 也可在「安装」页填入该 URL 作为 API 地址。
 *
 * 注意：电脑必须保持开机并运行本命令；快速隧道每次重启 URL 会变。
 */
import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const serverDir = path.join(root, 'server')
const envPath = path.join(serverDir, '.env')

function run(cmd, label) {
  console.log(`\n[public] ${label}…`)
  execSync(cmd, { cwd: root, stdio: 'inherit', shell: true })
}

function findCloudflared() {
  try {
    const out = execSync('where cloudflared', { encoding: 'utf8', shell: true })
    const first = out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s && !s.toLowerCase().includes('信息:') && fs.existsSync(s))
    if (first) return first
  } catch {
    /* fall through */
  }

  const candidates = [
    path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'cloudflared', 'cloudflared.exe'),
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'cloudflared', 'cloudflared.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'cloudflared.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'cloudflared', 'cloudflared.exe'),
  ]
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p
  }
  return null
}

function upsertEnvLine(file, key, value) {
  let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
  const line = `${key}=${value}`
  const re = new RegExp(`^${key}=.*$`, 'm')
  if (re.test(text)) text = text.replace(re, line)
  else text = `${text.trimEnd()}\n\n${line}\n`
  fs.writeFileSync(file, text, 'utf8')
}

function ensureCorsForPages() {
  if (!fs.existsSync(envPath)) return
  const text = fs.readFileSync(envPath, 'utf8')
  if (/^CORS_ORIGIN=/m.test(text)) return
  upsertEnvLine(
    envPath,
    'CORS_ORIGIN',
    'https://quick-math-exercises-app.pages.dev,http://localhost:5174,https://localhost:8790',
  )
  console.log('[public] 已写入默认 CORS_ORIGIN（含 pages.dev）')
}

function stripPlaceholderPublicUrl() {
  if (!fs.existsSync(envPath)) return
  const text = fs.readFileSync(envPath, 'utf8')
  if (/WENGU_PUBLIC_API_URL=https?:\/\/xxxx\.trycloudflare\.com/i.test(text)) {
    const next = text.replace(/^WENGU_PUBLIC_API_URL=.*$/m, '# WENGU_PUBLIC_API_URL=（由 serve:public 自动写入真实隧道地址）')
    fs.writeFileSync(envPath, next, 'utf8')
    console.log('[public] 已清除示例占位地址 xxxx.trycloudflare.com')
  }
}

try {
  run('node scripts/sync-server-env.mjs', '同步环境')
} catch {
  console.error('\n[public] 请先配置 server/.env：DEEPSEEK_API_KEY 与 WENGU_ADMIN_PASSWORD')
  process.exit(1)
}

stripPlaceholderPublicUrl()
ensureCorsForPages()

if (!fs.existsSync(path.join(serverDir, 'certs', 'cert.pem'))) {
  run('node scripts/gen-https-certs.mjs', '生成 HTTPS 证书')
}

if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  run('npm run build', '构建网页')
}

const cloudflared = findCloudflared()
if (!cloudflared) {
  console.error(`
[public] 未找到 cloudflared。请先安装：
  winget install Cloudflare.cloudflared
然后【关闭并重新打开】终端，再运行：npm run serve:public

若已安装仍提示找不到，可手动确认是否存在：
  "C:\\Program Files (x86)\\cloudflared\\cloudflared.exe"

若不需要出门用，可改用局域网：npm run serve:install
`)
  process.exit(1)
}

console.log(`[public] 使用 cloudflared：${cloudflared}`)

const serve = spawn(process.execPath, ['serve.mjs'], {
  cwd: serverDir,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
})

function pipePrefix(stream, prefix) {
  let buf = ''
  stream.on('data', (chunk) => {
    buf += chunk.toString()
    const parts = buf.split(/\r?\n/)
    buf = parts.pop() ?? ''
    for (const line of parts) {
      if (line.trim()) console.log(`${prefix}${line}`)
    }
  })
}

pipePrefix(serve.stdout, '[serve] ')
pipePrefix(serve.stderr, '[serve] ')

serve.on('exit', (code) => {
  console.error(`[public] 本地服务退出（${code}），隧道将关闭`)
  process.exit(code ?? 1)
})

// 等本地服务起来再开隧道（路径含空格时禁止 shell:true，否则会截成 C:\Program）
setTimeout(() => {
  console.log('\n[public] 正在启动 Cloudflare 快速隧道…')
  const tunnel = spawn(
    cloudflared,
    ['tunnel', '--url', 'https://localhost:8790', '--no-tls-verify'],
    {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      shell: false,
    },
  )

  let announced = false
  const onChunk = (chunk) => {
    const text = chunk.toString()
    process.stderr.write(text)
    const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i)
    if (m && !announced) {
      announced = true
      const url = m[0].replace(/\/$/, '')
      upsertEnvLine(envPath, 'WENGU_PUBLIC_API_URL', url)
      console.log('\n========================================')
      console.log('  出门可用地址（电脑须保持本命令运行）：')
      console.log(`  ${url}`)
      console.log('')
      console.log('  用法 A：手机浏览器直接打开上面地址 → 登录/安装')
      console.log('  用法 B：仍用 pages.dev →「安装」页把上面地址填进「API 服务地址」')
      console.log('  按 Ctrl+C 停止（停止后出门将无法登录 AI）')
      console.log('========================================\n')
    }
  }
  tunnel.stdout.on('data', onChunk)
  tunnel.stderr.on('data', onChunk)

  tunnel.on('exit', (code) => {
    console.error(`[public] 隧道退出（${code}）`)
    serve.kill()
    process.exit(code ?? 1)
  })

  const shutdown = () => {
    tunnel.kill()
    serve.kill()
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}, 1500)
