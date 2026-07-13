/**
 * 打印当前局域网访问地址，并尝试放行 Windows 防火墙端口（需管理员权限）。
 */
import { execSync } from 'node:child_process'
import os from 'node:os'

const PORTS = [5174, 8790]

function lanIPv4() {
  const nets = os.networkInterfaces()
  const out = []
  for (const [name, list] of Object.entries(nets)) {
    if (!list) continue
    for (const n of list) {
      if (n.family !== 'IPv4' || n.internal) continue
      // 跳过常见虚拟网卡 / 热点网关，优先真实 Wi‑Fi
      const skip =
        /virtual|vmware|vbox|hyper-v|docker|vethernet|loopback/i.test(name) ||
        n.address.startsWith('192.168.137.') ||
        n.address.startsWith('172.17.')
      out.push({ name, address: n.address, skip })
    }
  }
  return out
}

const ifaces = lanIPv4()
const preferred = ifaces.filter((x) => !x.skip)
const show = preferred.length ? preferred : ifaces

console.log('\n=== 口算练习 · 手机访问地址 ===\n')
if (!show.length) {
  console.log('未检测到局域网 IPv4，请确认电脑已连 Wi‑Fi。')
} else {
  for (const x of show) {
    console.log(`网卡 ${x.name}`)
    console.log(`  开发页：http://${x.address}:5174/   （有证书则为 https）`)
    console.log(`  安装用：https://${x.address}:8790/  （先 npm run certs && npm run build && npm run serve）`)
    console.log('')
  }
  console.log('注意：')
  console.log('1. 手机和电脑必须连同一个 Wi‑Fi（不要开「访客网络」）。')
  console.log('2. 不要用 192.168.137.x（那是电脑热点网关，手机通常打不开）。')
  console.log('3. 「安装应用」必须用 https://…:8790；纯 http 局域网只能加网页快捷方式。')
  console.log('4. 电脑上用 localhost 能开，不代表手机能开——常被 Windows 防火墙拦住。')
  console.log('')
}

try {
  for (const p of PORTS) {
    const name = `QuickMath-LAN-${p}`
    try {
      execSync(
        `netsh advfirewall firewall add rule name="${name}" dir=in action=allow protocol=TCP localport=${p} profile=private`,
        { stdio: 'pipe' },
      )
      console.log(`已放行防火墙入站：TCP ${p}`)
    } catch (e) {
      const msg = String(e?.stderr || e?.message || e)
      if (/already exists|已存在/i.test(msg)) {
        console.log(`防火墙规则已存在：TCP ${p}`)
      } else {
        console.log(`未能自动放行 TCP ${p}（需要管理员权限）。`)
        console.log('  请右键「以管理员身份运行」PowerShell，再执行：')
        console.log(
          `  netsh advfirewall firewall add rule name="${name}" dir=in action=allow protocol=TCP localport=${p} profile=private`,
        )
      }
    }
  }
} catch {
  /* ignore */
}

console.log('')
