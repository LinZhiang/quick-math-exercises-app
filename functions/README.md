# Cloudflare Pages Functions

生产环境 API（登录、AI 代理、计算机基础云端树）。

| 路径 | 作用 |
| --- | --- |
| `_lib/wenguCloudAuth.js` | 会话、成员、KV；`json()` 只导出一次，不要再 `export function json` |
| `_lib/aiUpstream.js` | DeepSeek / 豆包上游 |
| `_lib/computerBasicsCloud.js` | 讲义树读写（优先 KV，未绑定则用边缘缓存，并从 `/cb-data` 自动灌库） |
| `_lib/cbStore.js` | KV / Cache 存储适配 |
| `auth/*` | 登录 / 当前用户 |
| `api/ai/chat/completions.js` | 浏览器 AI 请求走这里，不把 Key 暴露给前端 |
| `api/computer-basics/` | 讲义 CRUD |

本地开发对应 `server/`（`npm run dev:full`）。改鉴权时两边行为要对齐。
