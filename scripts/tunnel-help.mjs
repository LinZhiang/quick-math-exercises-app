/**
 * 公网一步到位说明（Cloudflare Pages Functions）
 */
console.log(`
[ one-step ] 出门 / 家人使用：只打开一个 pages.dev 地址

1. Cloudflare Pages → Settings → Variables and secrets 添加 Secrets：
   DEEPSEEK_API_KEY
   WENGU_ADMIN_PASSWORD
   WENGU_ADMIN_USERNAME   （可选，默认 admin）
   WENGU_SESSION_SECRET   （可选，推荐）

2. （可选，要加成员账号时）Settings → Functions → KV namespace bindings：
   Variable name = WENGU_KV
   新建或选择一个 KV 命名空间

3. 重新部署（Deployments → Retry deployment）

4. 手机打开：https://你的项目.pages.dev
   → 导览 → 安装 → 用管理员账号登录
   不需要开家里电脑，不需要填隧道地址。

本地开发仍用：
  npm run serve:install
  或 npm run dev:full
`)
