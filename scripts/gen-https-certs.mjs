/**
 * 生成局域网自签证书（仅供家人内网用，手机首次需点「继续访问」）。
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(__dirname, '..', 'server', 'package.json'))
const selfsigned = require('selfsigned')
const outDir = path.join(__dirname, '..', 'server', 'certs')

function lanIPv4() {
  const nets = os.networkInterfaces()
  const ips = new Set(['127.0.0.1'])
  for (const list of Object.values(nets)) {
    if (!list) continue
    for (const n of list) {
      if (n.family === 'IPv4' && !n.internal) ips.add(n.address)
    }
  }
  return [...ips]
}

const ips = lanIPv4()
const altNames = [
  { type: 2, value: 'localhost' },
  ...ips.map((ip) => ({ type: 7, ip })),
]

const attrs = [{ name: 'commonName', value: 'kou-suan-lan' }]
const pems = await selfsigned.generate(attrs, {
  days: 825,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [
    { name: 'basicConstraints', cA: true },
    {
      name: 'subjectAltName',
      altNames,
    },
  ],
})

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'key.pem'), pems.private)
fs.writeFileSync(path.join(outDir, 'cert.pem'), pems.cert)
fs.writeFileSync(
  path.join(outDir, 'meta.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), ips, note: '家庭内网自签证书' }, null, 2),
)

console.log('[certs] 已生成 HTTPS 证书：server/certs/')
console.log('[certs] 覆盖 IP：' + ips.join(', '))
console.log('[certs] 手机请用 https://电脑WiFiIP:8790 打开，首次点「高级 → 继续前往」')
