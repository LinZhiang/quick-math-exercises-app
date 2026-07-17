/**
 * DeepSeek API Key 本机授权存储。
 * - 明文仅驻留内存；落盘为 AES-GCM 密文
 * - UI 只展示脱敏 hint，禁止把完整密钥打进日志/界面
 */
import { ref } from 'vue'

const STORAGE_KEY = 'wengu-deepseek-auth-v1'
const PBKDF2_SALT = 'wengu-deepseek-salt-v1'
const DERIVE_INFO = 'wengu-deepseek-wrap-v1'

export type DeepSeekAuthSnapshot = {
  configured: boolean
  hint: string | null
}

type StoredBlob = {
  v: 1
  iv: string
  data: string
  hint: string
}

/** 变更时递增，供界面响应式刷新 */
export const deepseekAuthTick = ref(0)

let memoryKey: string | null = null
let hydratePromise: Promise<void> | null = null

function notify() {
  deepseekAuthTick.value += 1
}

function bytesToB64(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let s = ''
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]!)
  return btoa(s)
}

function b64ToBytes(b64: string): Uint8Array {
  const s = atob(b64)
  const u8 = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i)
  return u8
}

function maskApiKey(raw: string): string {
  const t = raw.trim()
  if (t.length <= 8) return 'sk-****'
  return `${t.slice(0, 3)}****${t.slice(-4)}`
}

function readBlob(): StoredBlob | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredBlob>
    if (
      parsed?.v !== 1 ||
      typeof parsed.iv !== 'string' ||
      typeof parsed.data !== 'string' ||
      typeof parsed.hint !== 'string'
    ) {
      return null
    }
    return { v: 1, iv: parsed.iv, data: parsed.data, hint: parsed.hint }
  } catch {
    return null
  }
}

function writeBlob(blob: StoredBlob | null) {
  if (typeof localStorage === 'undefined') return
  if (!blob) localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(blob))
}

async function deriveAesKey(): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('当前环境不支持安全存储，请换用较新的浏览器')
  }
  const enc = new TextEncoder()
  const origin = typeof location !== 'undefined' ? location.origin : 'local'
  const material = await crypto.subtle.importKey(
    'raw',
    enc.encode(`${origin}|${DERIVE_INFO}`),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(PBKDF2_SALT),
      iterations: 120_000,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

async function encryptKey(plain: string): Promise<StoredBlob> {
  const key = await deriveAesKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plain),
  )
  return {
    v: 1,
    iv: bytesToB64(iv),
    data: bytesToB64(cipher),
    hint: maskApiKey(plain),
  }
}

async function decryptKey(blob: StoredBlob): Promise<string> {
  const key = await deriveAesKey()
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(blob.iv) as BufferSource },
    key,
    b64ToBytes(blob.data) as BufferSource,
  )
  return new TextDecoder().decode(plainBuf).trim()
}

/** 规范化用户输入的 Key */
export function normalizeDeepSeekApiKeyInput(raw: string): string {
  return raw.replace(/\s+/g, '').trim()
}

export function looksLikeDeepSeekApiKey(raw: string): boolean {
  const t = normalizeDeepSeekApiKeyInput(raw)
  return /^sk-[A-Za-z0-9_\-]{10,}$/.test(t)
}

export const DEEPSEEK_NOT_CONFIGURED_HINT =
  '未授权 DeepSeek：请到「导览 → 安装」填写并保存 API Key 后，再使用语文 AI 功能'

export function getDeepSeekAuthSnapshot(): DeepSeekAuthSnapshot {
  void deepseekAuthTick.value
  const blob = readBlob()
  return {
    configured: Boolean(memoryKey) || Boolean(blob),
    hint: blob?.hint ?? (memoryKey ? maskApiKey(memoryKey) : null),
  }
}

export function hasStoredDeepSeekApiKey(): boolean {
  void deepseekAuthTick.value
  return Boolean(memoryKey) || Boolean(readBlob())
}

/** 启动时尝试解密到内存（失败则清掉损坏数据） */
export function hydrateDeepSeekApiKeyStore(): Promise<void> {
  if (hydratePromise) return hydratePromise
  hydratePromise = (async () => {
    const blob = readBlob()
    if (!blob) {
      memoryKey = null
      notify()
      return
    }
    try {
      memoryKey = await decryptKey(blob)
    } catch {
      memoryKey = null
      writeBlob(null)
    }
    notify()
  })()
  return hydratePromise
}

/**
 * 取出可用 Key（仅供请求层调用，勿暴露到 UI）。
 * 优先用户授权；开发环境可回退构建时 VITE_DEEPSEEK_API_KEY。
 */
export async function resolveDeepSeekApiKey(): Promise<string> {
  await hydrateDeepSeekApiKeyStore()
  if (memoryKey) return memoryKey
  const blob = readBlob()
  if (blob) {
    try {
      memoryKey = await decryptKey(blob)
      notify()
      return memoryKey
    } catch {
      writeBlob(null)
      memoryKey = null
      notify()
    }
  }
  if (import.meta.env.DEV) {
    const vite = import.meta.env.VITE_DEEPSEEK_API_KEY?.trim() ?? ''
    if (vite) return vite
  }
  return ''
}

/** 调用 DeepSeek 轻量接口校验 Key 是否可用 */
export async function verifyDeepSeekApiKey(raw: string): Promise<{ ok: boolean; message: string }> {
  const key = normalizeDeepSeekApiKeyInput(raw)
  if (!looksLikeDeepSeekApiKey(key)) {
    return { ok: false, message: 'Key 格式不正确，一般以 sk- 开头' }
  }
  try {
    const res = await fetch('https://api.deepseek.com/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })
    if (res.ok) return { ok: true, message: '校验通过' }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: 'Key 无效或无权限，请到 DeepSeek 开放平台核对' }
    }
    const text = await res.text()
    return { ok: false, message: `校验失败（${res.status}）：${text.slice(0, 120)}` }
  } catch {
    return { ok: false, message: '网络异常，请检查网络后重试' }
  }
}

/** 保存并写入加密缓存；成功后内存持有明文供本会话请求 */
export async function saveDeepSeekApiKey(raw: string): Promise<{ hint: string }> {
  const key = normalizeDeepSeekApiKeyInput(raw)
  if (!looksLikeDeepSeekApiKey(key)) {
    throw new Error('Key 格式不正确，一般以 sk- 开头')
  }
  const blob = await encryptKey(key)
  writeBlob(blob)
  memoryKey = key
  notify()
  return { hint: blob.hint }
}

export async function clearDeepSeekApiKey(): Promise<void> {
  memoryKey = null
  writeBlob(null)
  notify()
}

/** 应用启动时调用一次 */
if (typeof window !== 'undefined') {
  void hydrateDeepSeekApiKeyStore()
}
