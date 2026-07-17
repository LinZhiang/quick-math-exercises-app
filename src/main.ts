import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createApp(App).use(router).use(ElementPlus).mount('#app')
