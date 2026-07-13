import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'

/** 生产构建，或 HTTPS 局域网访问时注册 SW（HTTP 局域网无法安装 PWA） */
function shouldRegisterServiceWorker(): boolean {
  if (!('serviceWorker' in navigator)) return false
  if (import.meta.env.PROD) return true
  return window.isSecureContext && location.protocol === 'https:'
}

if (shouldRegisterServiceWorker()) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      /* 忽略 SW 注册失败 */
    })
  })
}

createApp(App).use(router).use(ElementPlus).mount('#app')
