/** 计算机单词和语法 · 目录类型（讲义考点分类，顺序固定） */

export type CsVocabTopicId =
  | 'cpu-perf'
  | 'number-base'
  | 'storage'
  | 'os-basics'
  | 'net-model'
  | 'http-status'
  | 'tls-https'
  | 'dns-cdn'
  | 'tcp-udp'
  | 'browser'
  | 'security'
  | 'cloud-ai'
  | 'js-types'
  | 'js-ops'
  | 'js-object'
  | 'js-fn'
  | 'es6'
  | 'dom-event'
  | 'bom-web'
  | 'html-css'
  | 'vue-life'
  | 'vue-eco'
  | 'fe-eng'
  | 'fe-perf'

export const CS_VOCAB_TOPICS: { id: CsVocabTopicId; label: string }[] = [
  { id: 'cpu-perf', label: 'CPU 与性能指标' },
  { id: 'number-base', label: '数制与编码' },
  { id: 'storage', label: '存储与计算机组成' },
  { id: 'os-basics', label: '操作系统要点' },
  { id: 'net-model', label: '网络模型' },
  { id: 'http-status', label: 'HTTP 与状态码' },
  { id: 'tls-https', label: 'HTTPS / TLS / 加密' },
  { id: 'dns-cdn', label: 'DNS / CDN / 缓存' },
  { id: 'tcp-udp', label: 'TCP / UDP / HTTP3 / WebSocket' },
  { id: 'browser', label: '浏览器原理' },
  { id: 'security', label: '信息安全' },
  { id: 'cloud-ai', label: '云、大数据、物联网、AI' },
  { id: 'js-types', label: 'JS 类型与假值' },
  { id: 'js-ops', label: 'JS 运算符与转换' },
  { id: 'js-object', label: '对象与原型链' },
  { id: 'js-fn', label: '函数、闭包与 this' },
  { id: 'es6', label: 'ES6 核心语法' },
  { id: 'dom-event', label: 'DOM 与事件' },
  { id: 'bom-web', label: 'BOM 与 Web API' },
  { id: 'html-css', label: 'HTML / CSS 要点' },
  { id: 'vue-life', label: 'Vue 生命周期与通信' },
  { id: 'vue-eco', label: 'Vue 路由与状态' },
  { id: 'fe-eng', label: '前端工程化' },
  { id: 'fe-perf', label: '前端性能优化' },
]

const LABEL = new Map(CS_VOCAB_TOPICS.map((t) => [t.id, t.label]))
const ORDER = new Map(CS_VOCAB_TOPICS.map((t, i) => [t.id, i]))

export function csVocabTopicLabel(id: string): string {
  return LABEL.get(id as CsVocabTopicId) || id
}

export function csVocabTopicOrder(id: string): number {
  const n = ORDER.get(id as CsVocabTopicId)
  return n == null ? 999 : n
}
