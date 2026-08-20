# 学习 App

公务员 / 事业编练习站：口算与数量关系、资料分析、逻辑判断、语文、个人题库、计算机基础讲义。

**接手代码请先读 [`项目结构.md`](./项目结构.md)**（目录分层、AI 入口、如何加新题型）。

## 功能概览

- **知识训练**：四则口算、快判（舒尔特等）、数量关系、资料分析、逻辑判断、语文练习
- **题库整理**：分类、拍照录入、测验、导出
- **计算机基础**：讲义树、问 AI、AI 测验、错题/收藏
- 安装为 PWA；安装与设置入口仅首页可见

## 开发

```bash
npm install
npm run dev:full
```

`dev:full` 会同时起 Vite 前端和本地 AI/登录代理。只起页面可用 `npm run dev`（默认端口 **5174**）。

生产构建：

```bash
npm run build
```

类型检查：`npm run type-check`。

## 部署

静态前端 + Cloudflare Pages Functions（`functions/`）。计算机基础讲义在 pages.dev 上登录管理员即可改；环境变量与密钥用仓库内 `scripts/sync-*.mjs` / `push-cf-*.mjs`，不要把 API Key 写进前端代码。
