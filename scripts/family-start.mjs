/**
 * 仅首次装手机 App 时用：同步密钥 → 证书 → 构建 → 开 HTTPS 静态服务（装完可关）
 */
import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function run(cmd, label) {
  console.log(`\n[start] ${label}…`)
  execSync(cmd, { cwd: root, stdio: 'inherit', shell: true })
}

function lanIp() {
  const nets = os.networkInterfaces()
  for (const [name, list] of Object.entries(nets)) {
    if (!list || /virtual|vmware|vbox|hyper-v|docker|vethernet/i.test(name)) continue
    for (const n of list) {
      if (n.family === 'IPv4' && !n.internal && !n.address.startsWith('192.168.137.')) {
        return n.address
      }
    }
  }
  return null
}

try {
  run('node scripts/sync-server-env.mjs', '同步 DeepSeek 密钥')
} catch {
  console.error('\n[start] 请先配置 server/.env 里的 DEEPSEEK_API_KEY')
  process.exit(1)
}

if (!fs.existsSync(path.join(root, 'server', 'certs', 'cert.pem'))) {
  run('node scripts/gen-https-certs.mjs', '生成 HTTPS 证书')
}

const needBuild =
  !fs.existsSync(path.join(root, 'dist', 'index.html')) ||
  !fs.existsSync(path.join(root, '.env.local'))
if (needBuild) {
  run('npm run build', '构建网页（含 AI 密钥）')
}

const ip = lanIp()
console.log('\n========================================')
console.log('  口算练习已启动')
console.log('  电脑： https://localhost:8790')
if (ip) console.log(`  手机： https://${ip}:8790`)
console.log('  装 App：手机 Chrome 打开上面地址 → 菜单 → 安装应用')
console.log('  按 Ctrl+C 停止')
console.log('========================================\n')

const child = spawn('node', ['serve.mjs'], {
  cwd: path.join(root, 'server'),
  stdio: 'inherit',
  shell: true,
})

child.on('exit', (code) => process.exit(code ?? 0))
