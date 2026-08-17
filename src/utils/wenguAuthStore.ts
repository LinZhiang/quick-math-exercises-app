/**
 * 温故口算 — 服务端登录会话（仅语文 AI 需要）
 * - 管理员：localStorage + 服务端 Token 默认 7 天
 * - 成员：localStorage + 服务端 Token 默认 2 小时（手机/电脑可同时登录，互不挤下）
 * - 真正失效：Token 过期、主动登出、管理员禁用/改密（sessionEpoch）
 */
import { ref } from 'vue'
import {
  probeWenguAuthServer,
  readWenguJsonResponse,
  wenguApiFetch,
} from '@/utils/wenguApiFetch'
import { isMemberCustomApiOriginValid } from '@/utils/wenguApiOrigin'

const MEMBER_STORAGE_KEY = 'wengu-member-session-v1'
const ADMIN_STORAGE_KEY = 'wengu-admin-session-v1'

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

export const WENGU_LOGIN_REQUIRED_HINT =
  '未登录：请到右上角「设置」登录后，再使用语文 AI 功能'

export { probeWenguAuthServer, usesRemoteWenguApi, type WenguServerProbe } from '@/utils/wenguApiFetch'

function notify() {
  wenguAuthTick.value += 1
}

function isAdminSession(session: StoredSession | null | undefined): boolean {
  return session?.user?.role === 'admin'
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return typeof localStorage !== 'undefined' ? localStorage : null
}

function storageKeyForRole(role: WenguRole): string {
  return role === 'admin' ? ADMIN_STORAGE_KEY : MEMBER_STORAGE_KEY
}

function purgeLegacyJunk() {
  try {
    const ls = getLocalStorage()
    if (!ls) return
    // 旧 DeepSeek Key 缓存；旧混用键若仍是成员会话则迁移后再删
    ls.removeItem('wengu-deepseek-auth-v1')
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

/** 从旧 sessionStorage / 旧 localStorage 键迁移成员会话 */
function migrateLegacyMemberSession(): StoredSession | null {
  const ls = getLocalStorage()
  const ss = typeof sessionStorage !== 'undefined' ? sessionStorage : null

  const candidates: { store: Storage; key: string }[] = []
  if (ss) candidates.push({ store: ss, key: 'wengu-session-v1' }, { store: ss, key: MEMBER_STORAGE_KEY })
  if (ls) candidates.push({ store: ls, key: 'wengu-session-v1' })

  for (const { store, key } of candidates) {
    const hit = readFromStore(store, key)
    if (!hit || hit.user.role === 'admin') continue
    try {
      store.removeItem(key)
    } catch {
      /* ignore */
    }
    return hit
  }
  return null
}

function readStored(): StoredSession | null {
  const ls = getLocalStorage()
  if (!ls) return null

  const admin = readFromStore(ls, ADMIN_STORAGE_KEY)
  if (admin) return admin

  const member = readFromStore(ls, MEMBER_STORAGE_KEY)
  if (member) return member

  const migrated = migrateLegacyMemberSession()
  if (migrated) {
    ls.setItem(MEMBER_STORAGE_KEY, JSON.stringify(migrated))
    return migrated
  }
  return null
}

function writeStored(session: StoredSession | null) {
  const ls = getLocalStorage()
  if (!ls) return
  ls.removeItem(MEMBER_STORAGE_KEY)
  ls.removeItem(ADMIN_STORAGE_KEY)
  // 顺带清掉旧 sessionStorage，避免双份状态
  try {
    sessionStorage?.removeItem('wengu-session-v1')
    sessionStorage?.removeItem(MEMBER_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  if (!session) return
  ls.setItem(storageKeyForRole(session.user.role), JSON.stringify(session))
}

function clearMemoryAndStorage() {
  memorySession = null
  writeStored(null)
  notify()
}

export const WENGU_ACCOUNT_DISABLED_HINT = '账号已被禁用，请联系管理员'

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

/** 成员是否已具备可用的自定义 API（管理员始终 true） */
export function isWenguApiReadyForCurrentUser(): boolean {
  void wenguAuthTick.value
  const user = getWenguUser()
  if (!user) return false
  if (user.role === 'admin') return true
  return isMemberCustomApiOriginValid()
}

export async function hydrateWenguAuthStore(): Promise<void> {
  if (hydratePromise) return hydratePromise
  hydratePromise = (async () => {
    purgeLegacyJunk()
    const stored = readStored()
    if (!stored) {
      // 勿清空 memorySession：登录可能与首次 hydrate 并发，避免把刚登录的会话冲掉
      if (!memorySession) notify()
      return
    }
    try {
      const res = await wenguApiFetch('/auth/me', {
        headers: { Authorization: `Bearer ${stored.token}` },
      })
      // 仅当校验的仍是「当前会话」时才因失败清会话（避免冲掉并发新登录）
      const stillSameSession = () =>
        (memorySession?.token ?? readStored()?.token) === stored.token

      // 只有明确鉴权失败才清本地；网络/5xx/连错地址时保留，方便多端与弱网
      if (res.status === 401 || res.status === 403) {
        if (stillSameSession()) clearMemoryAndStorage()
        return
      }
      if (!res.ok) {
        if (!memorySession) memorySession = stored
        notify()
        return
      }
      const data = await readWenguJsonResponse<{ ok?: boolean; user?: WenguUser }>(res)
      if (!data.ok || !data.user) {
        if (!memorySession) memorySession = stored
        notify()
        return
      }
      // 若用户已在校验期间重新登录，保留新会话
      if (!stillSameSession()) {
        notify()
        return
      }
      memorySession = { token: stored.token, user: data.user }
      writeStored(memorySession)
    } catch {
      if (!memorySession) memorySession = stored
    }
    notify()
  })()
  return hydratePromise
}

export async function loginWengu(username: string, password: string): Promise<WenguUser> {
  const res = await wenguApiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  })
  const data = await readWenguJsonResponse<{
    ok?: boolean
    message?: string
    token?: string
    user?: WenguUser
  }>(res)
  if (!res.ok || !data.ok || !data.token || !data.user) {
    throw new Error(data.message || `登录失败（HTTP ${res.status}）`)
  }
  memorySession = { token: data.token, user: data.user }
  writeStored(memorySession)
  // 允许下次按需重新校验；避免沿用「启动时无会话」的旧 hydrate 结果
  hydratePromise = null
  notify()
  return data.user
}

/** 登出：服务端拉黑当前 Token，并清空本地缓存 */
export async function logoutWengu(): Promise<void> {
  const token = getWenguAuthToken()
  if (token) {
    try {
      await wenguApiFetch('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      /* 网络失败也清本地 */
    }
  }
  clearMemoryAndStorage()
}

/**
 * @deprecated 不再因离开语文区清登录；保留空实现以免旧调用报错。
 * 手机/电脑可同时保持登录，互不影响。
 */
export function clearWenguSessionOnAiLeave(): void {
  /* no-op：多端同时使用时不应因切栏目掉登录 */
}

/** @deprecated 刷新/切后台不再清会话 */
export function installWenguSessionUnloadGuard(): void {
  /* no-op */
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
  const res = await wenguApiFetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const data = await readWenguJsonResponse<{ ok?: boolean; message?: string }>(res)
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
  void hydrateWenguAuthStore()
}
