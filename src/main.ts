/** 入口：密钥守卫、注册 SW、挂载 Vue。开发请用 npm run dev:full（前端+本地 AI 代理）。 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'
import { applyPullToRefreshPreference } from '@/utils/app/appUiSettings'
import { hideAppUpdatingMask } from '@/utils/app/appUpdateMask'

/** 防止调试日志意外输出 sk- 密钥 */
function installSecretLogGuard() {
  if (!import.meta.env.PROD) return
  const mask = (v: unknown): unknown => {
    if (typeof v === 'string' && /sk-[A-Za-z0-9_\-]{6,}/.test(v)) {
      return v.replace(/sk-[A-Za-z0-9_\-]+/g, 'sk-****')
    }
    return v
  }
  for (const level of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    const orig = console[level].bind(console)
    console[level] = (...args: unknown[]) => orig(...args.map(mask))
  }
}
installSecretLogGuard()

// 默认关闭手势刷新，避免练习时误触丢进度
applyPullToRefreshPreference()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createApp(App).use(router).use(ElementPlus).mount('#app')
hideAppUpdatingMask()
