/**
 * Cloudflare 快速隧道：把本机 8790 暴露为公网 HTTPS，供 pages.dev 调用
 */
console.log(`
[ tunnel ] Cloudflare Pages 静态站 + 家庭 API 配置步骤：

1. 电脑先运行：npm run serve:install

2. 另开终端，安装并运行 cloudflared（一次性）：
   winget install Cloudflare.cloudflared
   cloudflared tunnel --url https://localhost:8790

3. 复制终端里给出的 https://xxxx.trycloudflare.com 地址

4. 编辑 server/.env 增加：
   WENGU_PUBLIC_API_URL=https://xxxx.trycloudflare.com
   CORS_ORIGIN=https://quick-math-exercises-app.pages.dev

5. Cloudflare Pages → Settings → Environment variables 增加：
   VITE_WENGU_API_ORIGIN = https://xxxx.trycloudflare.com

6. 重启 serve:install，重新部署 Pages（Retry deployment）

完成后，手机打开 pages.dev 即可登录，无需同一 WiFi。
`)
