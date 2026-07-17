/**
 * 温故口算 — 服务端登录会话（仅语文 AI 需要）
 * - 管理员：localStorage + 服务端 Token 默认 7 天
 * - 成员：sessionStorage + 服务端 Token 默认 2 小时
 */
import { ref } from 'vue'

const MEMBER_STORAGE_KEY = 'wengu-session-v1'
const ADMIN_STORAGE_KEY = 'wengu-admin-session-v1'
const LEGACY_MEMBER_LOCAL_KEY = 'wengu-session-v1'

export type WenguRole = 'admin' | 'member'

export type WenguUser = {
  username: string
  role: WenguRole
}

type StoredSession = {
  token: string
  user: WenguUser
}

export const wenguAuthTick = ref(0)

let memorySession: StoredSession | null = null
let hydratePromise: Promise<void> | null = null
let unloadHookInstalled = false

export const WENGU_LOGIN_REQUIRED_HINT =
  '未登录：请到「导览 → 安装」登录后，再使用语文 AI 功能'

export const WENGU_ACCOUNT_DISABLED_HINT = '账号已被禁用，请联系管理员'

function notify() {
  wenguAuthTick.value += 1
}

function isAdminSession(session: StoredSession | null | undefined): boolean {
  return session?.user?.role === 'admin'
}

function storageForRole(role: WenguRole): Storage | null {
  if (typeof window === 'undefined') return null
  if (role === 'admin') {
    return typeof localStorage !== 'undefined' ? localStorage : null
  }
  return typeof sessionStorage !== 'undefined' ? sessionStorage : null
}

function storageKeyForRole(role: WenguRole): string {
  return role === 'admin' ? ADMIN_STORAGE_KEY : MEMBER_STORAGE_KEY
}

function purgeLegacyLocalStorage() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LEGACY_MEMBER_LOCAL_KEY)
      localStorage.removeItem('wengu-deepseek-auth-v1')
    }
  } catch {
    /* ignore */
  }
}

function readFromStore(store: Storage, key: string): StoredSession | null {
  try {
    const raw = store.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (
      typeof parsed?.token !== 'string' ||
      !parsed.user ||
      typeof parsed.user.username !== 'string' ||
      (parsed.user.role !== 'admin' && parsed.user.role !== 'member')
    ) {
      return null
    }
    return { token: parsed.token, user: parsed.user }
  } catch {
    return null
  }
}

function readStored(): StoredSession | null {
  const adminStore = storageForRole('admin')
  if (adminStore) {
    const admin = readFromStore(adminStore, ADMIN_STORAGE_KEY)
    if (admin) return admin
  }
  const memberStore = storageForRole('member')
  if (memberStore) {
    return readFromStore(memberStore, MEMBER_STORAGE_KEY)
  }
  return null
}

function writeStored(session: StoredSession | null) {
  const memberStore = storageForRole('member')
  const adminStore = storageForRole('admin')
  memberStore?.removeItem(MEMBER_STORAGE_KEY)
  adminStore?.removeItem(ADMIN_STORAGE_KEY)
  if (!session) return
  const store = storageForRole(session.user.role)
  const key = storageKeyForRole(session.user.role)
  store?.setItem(key, JSON.stringify(session))
}

function clearMemoryAndStorage() {
  memorySession = null
  writeStored(null)
  notify()
}

export function getWenguAuthToken(): string | null {
  void wenguAuthTick.value
  return memorySession?.token ?? readStored()?.token ?? null
}

export function getWenguUser(): WenguUser | null {
  void wenguAuthTick.value
  return memorySession?.user ?? readStored()?.user ?? null
}

export function isWenguLoggedIn(): boolean {
  return Boolean(getWenguAuthToken())
}

export function isWenguAdmin(): boolean {
  return getWenguUser()?.role === 'admin'
}

export async function hydrateWenguAuthStore(): Promise<void> {
  if (hydratePromise) return hydratePromise
  hydratePromise = (async () => {
    purgeLegacyLocalStorage()
    const stored = readStored()
    if (!stored) {
      memorySession = null
      notify()
      return
    }
    try {
      const res = await fetch('/auth/me', {
        headers: { Authorization: `Bearer ${stored.token}` },
      })
      if (res.status === 403) {
        clearMemoryAndStorage()
        return
      }
      if (!res.ok) {
        clearMemoryAndStorage()
        return
      }
      const data = (await res.json()) as { ok?: boolean; user?: WenguUser }
      if (!data.ok || !data.user) {
        clearMemoryAndStorage()
        return
      }
      memorySession = { token: stored.token, user: data.user }
      writeStored(memorySession)
    } catch {
      memorySession = stored
    }
    notify()
  })()
  return hydratePromise
}

export async function loginWengu(username: string, password: string): Promise<WenguUser> {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  })
  const data = (await res.json()) as {
    ok?: boolean
    message?: string
    token?: string
    user?: WenguUser
  }
  if (!res.ok || !data.ok || !data.token || !data.user) {
    throw new Error(data.message || '登录失败')
  }
  memorySession = { token: data.token, user: data.user }
  writeStored(memorySession)
  notify()
  return data.user
}

/** 登出：服务端拉黑当前 Token，并清空本地缓存 */
export async function logoutWengu(): Promise<void> {
  const token = getWenguAuthToken()
  if (token) {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      /* 网络失败也清本地 */
    }
  }
  clearMemoryAndStorage()
}

/** 离开语文 AI 区域时清空成员登录态；管理员保持一周 localStorage 缓存 */
export function clearWenguSessionOnAiLeave(): void {
  const current = memorySession ?? readStored()
  if (isAdminSession(current)) return
  clearMemoryAndStorage()
}

export function installWenguSessionUnloadGuard(): void {
  if (unloadHookInstalled || typeof window === 'undefined') return
  unloadHookInstalled = true
  purgeLegacyLocalStorage()
  const onUnload = () => {
    try {
      sessionStorage?.removeItem(MEMBER_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    if (!isAdminSession(memorySession ?? readStored())) {
      memorySession = null
    }
  }
  window.addEventListener('pagehide', onUnload)
  window.addEventListener('beforeunload', onUnload)
}

export type WenguMemberUser = {
  username: string
  role: WenguRole
  enabled: boolean
  createdAt: string | null
}

async function adminFetch(path: string, init?: RequestInit) {
  const token = getWenguAuthToken()
  if (!token) throw new Error('未登录')
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const data = (await res.json()) as { ok?: boolean; message?: string }
  if (res.status === 401 || res.status === 403) {
    clearMemoryAndStorage()
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || `请求失败（${res.status}）`)
  }
  return data
}

export async function fetchWenguMembers(): Promise<WenguMemberUser[]> {
  const data = (await adminFetch('/admin/users')) as { users?: WenguMemberUser[] }
  return data.users ?? []
}

export async function createWenguMember(username: string, password: string): Promise<void> {
  await adminFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function setWenguMemberEnabled(username: string, enabled: boolean): Promise<void> {
  await adminFetch(`/admin/users/${encodeURIComponent(username)}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  })
}

export async function resetWenguMemberPassword(username: string, password: string): Promise<void> {
  await adminFetch(`/admin/users/${encodeURIComponent(username)}`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  })
}

export async function deleteWenguMember(username: string): Promise<void> {
  await adminFetch(`/admin/users/${encodeURIComponent(username)}`, { method: 'DELETE' })
}

if (typeof window !== 'undefined') {
  installWenguSessionUnloadGuard()
  void hydrateWenguAuthStore()
}
