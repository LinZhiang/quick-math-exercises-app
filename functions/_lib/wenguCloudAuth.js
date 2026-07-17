/**
 * Cloudflare Pages Functions 共用鉴权 / 存储（Web Crypto，不依赖 Node）
 * 环境变量：DEEPSEEK_API_KEY, WENGU_ADMIN_USERNAME, WENGU_ADMIN_PASSWORD, WENGU_SESSION_SECRET
 * 可选 KV：WENGU_KV（存成员与黑名单；无 KV 时仅管理员可登录）
 */

const USERS_KEY = 'users-v1'
const BLACKLIST_KEY = 'blacklist-v1'
const MEMBER_TTL_MS = 2 * 60 * 60 * 1000
const ADMIN_TTL_MS = 7 * 24 * 60 * 60 * 1000

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
      pragma: 'no-cache',
    },
  })
}

function adminUsername(env) {
  return String(env.WENGU_ADMIN_USERNAME || 'admin').trim()
}

function adminPassword(env) {
  return String(env.WENGU_ADMIN_PASSWORD || '').trim()
}

function sessionSecret(env) {
  const fromEnv = String(env.WENGU_SESSION_SECRET || '').trim()
  if (fromEnv) return fromEnv
  const pass = adminPassword(env)
  if (!pass) return ''
  return `wengu-cf-session-v1|${pass}`
}

export function isAuthConfigured(env) {
  return Boolean(adminPassword(env) && sessionSecret(env))
}

function sessionTtlForRole(role) {
  return role === 'admin' ? ADMIN_TTL_MS : MEMBER_TTL_MS
}

function b64url(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlToBytes(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function deriveSessionKey(secret) {
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

async function pbkdf2Hash(password, saltBytes) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: 120_000, hash: 'SHA-256' },
    material,
    256,
  )
  return b64url(bits)
}

async function createPasswordRecord(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2Hash(password, salt)
  return { v: 2, algo: 'pbkdf2', salt: b64url(salt), hash }
}

async function verifyPassword(password, record) {
  if (!record?.salt || !record?.hash) return false
  if (record.algo && record.algo !== 'pbkdf2') return false
  const salt = b64urlToBytes(record.salt)
  const hash = await pbkdf2Hash(password, salt)
  if (hash.length !== record.hash.length) return false
  let ok = 0
  for (let i = 0; i < hash.length; i++) ok |= hash.charCodeAt(i) ^ record.hash.charCodeAt(i)
  return ok === 0
}

function safeEqual(a, b) {
  const x = String(a)
  const y = String(b)
  if (x.length !== y.length) return false
  let ok = 0
  for (let i = 0; i < x.length; i++) ok |= x.charCodeAt(i) ^ y.charCodeAt(i)
  return ok === 0
}

async function loadUsers(env) {
  if (!env.WENGU_KV) return { users: [] }
  try {
    const raw = await env.WENGU_KV.get(USERS_KEY)
    if (!raw) return { users: [] }
    const parsed = JSON.parse(raw)
    return { users: Array.isArray(parsed?.users) ? parsed.users : [] }
  } catch {
    return { users: [] }
  }
}

async function saveUsers(env, data) {
  if (!env.WENGU_KV) throw new Error('未绑定 WENGU_KV，无法管理成员')
  await env.WENGU_KV.put(USERS_KEY, JSON.stringify(data))
}

async function loadBlacklist(env) {
  if (!env.WENGU_KV) return { entries: [] }
  try {
    const raw = await env.WENGU_KV.get(BLACKLIST_KEY)
    if (!raw) return { entries: [] }
    const parsed = JSON.parse(raw)
    const now = Date.now()
    return {
      entries: Array.isArray(parsed?.entries)
        ? parsed.entries.filter((e) => e?.exp > now)
        : [],
    }
  } catch {
    return { entries: [] }
  }
}

async function saveBlacklist(env, data) {
  if (!env.WENGU_KV) return
  const now = Date.now()
  const entries = (data.entries || []).filter((e) => e?.exp > now)
  await env.WENGU_KV.put(BLACKLIST_KEY, JSON.stringify({ entries }))
}

async function signToken(env, user) {
  const secret = sessionSecret(env)
  const key = await deriveSessionKey(secret)
  const now = Date.now()
  const members = await loadUsers(env)
  const member = members.users.find((u) => u.username === user.username)
  const payload = {
    sub: user.username,
    role: user.role,
    iat: now,
    exp: now + sessionTtlForRole(user.role),
    jti: b64url(crypto.getRandomValues(new Uint8Array(16))),
    epoch: member ? Number(member.sessionEpoch || 0) : 0,
  }
  const payloadB64 = b64url(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64))
  return `${payloadB64}.${b64url(sig)}`
}

async function parseToken(env, token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sigB64] = parts
  const key = await deriveSessionKey(sessionSecret(env))
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    b64urlToBytes(sigB64),
    new TextEncoder().encode(payloadB64),
  )
  if (!ok) return null
  try {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)))
  } catch {
    return null
  }
}

export async function resolveSessionUser(env, token) {
  const payload = await parseToken(env, token)
  if (!payload?.sub || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
  const bl = await loadBlacklist(env)
  if (bl.entries.some((e) => e.jti === payload.jti)) return null

  const username = String(payload.sub)
  const role = payload.role === 'admin' ? 'admin' : 'member'
  if (username === adminUsername(env) && role === 'admin') {
    return { username, role: 'admin' }
  }

  const { users } = await loadUsers(env)
  const member = users.find((u) => u.username === username)
  if (!member || member.enabled === false) return null
  if (Number(payload.epoch || 0) !== Number(member.sessionEpoch || 0)) return null
  return { username, role: 'member' }
}

function bearer(request) {
  const h = request.headers.get('authorization') || ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return m?.[1]?.trim() || ''
}

export async function requireAuth(env, request) {
  if (!isAuthConfigured(env)) {
    return {
      error: json(
        { error: { message: '服务端未配置登录（缺少 WENGU_ADMIN_PASSWORD）', type: 'auth_config' } },
        503,
      ),
    }
  }
  const token = bearer(request)
  const user = await resolveSessionUser(env, token)
  if (!user) {
    const payload = await parseToken(env, token)
    if (payload?.sub && payload.sub !== adminUsername(env)) {
      const { users } = await loadUsers(env)
      const member = users.find((u) => u.username === payload.sub)
      if (member && member.enabled === false) {
        return {
          error: json({ error: { message: '账号已被禁用，请联系管理员', type: 'auth_forbidden' } }, 403),
        }
      }
    }
    return {
      error: json(
        { error: { message: '未登录或会话已过期', type: 'auth_required' } },
        401,
      ),
    }
  }
  return { user, token }
}

export async function requireAdmin(env, request) {
  const r = await requireAuth(env, request)
  if (r.error) return r
  if (r.user.role !== 'admin') {
    return { error: json({ error: { message: '需要管理员权限', type: 'auth_forbidden' } }, 403) }
  }
  return r
}

function sanitizeUsername(raw) {
  const name = String(raw ?? '').trim()
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,32}$/.test(name)) return null
  return name
}

function sanitizePassword(raw) {
  const pass = String(raw ?? '')
  if (pass.length < 6 || pass.length > 128) return null
  return pass
}

export async function handleAuthConfig(env) {
  return json({
    ok: true,
    authEnabled: isAuthConfigured(env),
    adminUsernameHint: adminUsername(env),
    memberSessionTtlHours: 2,
    adminSessionTtlDays: 7,
    hosting: 'cloudflare-pages',
    alwaysOn: true,
  })
}

export async function handleLogin(env, request) {
  if (!isAuthConfigured(env)) {
    return json({ ok: false, message: '服务端未配置登录' }, 503)
  }
  const body = await request.json().catch(() => ({}))
  const name = String(body.username ?? '').trim()
  const pass = String(body.password ?? '')
  if (!name || !pass) return json({ ok: false, message: '用户名或密码错误' }, 401)

  let user = null
  if (name === adminUsername(env) && safeEqual(pass, adminPassword(env))) {
    user = { username: name, role: 'admin' }
  } else {
    const { users } = await loadUsers(env)
    const member = users.find((u) => u.username === name && u.enabled !== false)
    if (member && (await verifyPassword(pass, member))) {
      user = { username: name, role: 'member' }
    }
  }
  if (!user) return json({ ok: false, message: '用户名或密码错误' }, 401)
  const token = await signToken(env, user)
  return json({
    ok: true,
    token,
    user,
    expiresInMs: sessionTtlForRole(user.role),
  })
}

export async function handleLogout(env, request) {
  const token = bearer(request)
  const payload = await parseToken(env, token)
  if (payload?.jti && typeof payload.exp === 'number' && payload.exp > Date.now()) {
    const bl = await loadBlacklist(env)
    if (!bl.entries.some((e) => e.jti === payload.jti)) {
      bl.entries.push({ jti: payload.jti, exp: payload.exp, at: new Date().toISOString() })
      await saveBlacklist(env, bl)
    }
  }
  return json({ ok: true })
}

export async function handleMe(env, request) {
  const user = await resolveSessionUser(env, bearer(request))
  if (!user) return json({ ok: false, message: '未登录或会话已过期' }, 401)
  return json({ ok: true, user })
}

export async function handleListUsers(env, request) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  const { users } = await loadUsers(env)
  return json({
    ok: true,
    users: users.map((u) => ({
      username: u.username,
      role: 'member',
      enabled: u.enabled !== false,
      createdAt: u.createdAt ?? null,
    })),
  })
}

export async function handleCreateUser(env, request) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!env.WENGU_KV) {
    return json({ ok: false, message: '请在 Cloudflare Pages 绑定 KV：WENGU_KV' }, 503)
  }
  const body = await request.json().catch(() => ({}))
  const username = sanitizeUsername(body.username)
  const password = sanitizePassword(body.password)
  if (!username || !password) {
    return json({ ok: false, message: '用户名 2–32 位，密码 6–128 位' }, 400)
  }
  if (username === adminUsername(env)) {
    return json({ ok: false, message: '不能与管理员用户名重复' }, 400)
  }
  const data = await loadUsers(env)
  if (data.users.some((u) => u.username === username)) {
    return json({ ok: false, message: '用户名已存在' }, 409)
  }
  const record = await createPasswordRecord(password)
  data.users.push({
    username,
    ...record,
    role: 'member',
    enabled: true,
    sessionEpoch: 0,
    createdAt: new Date().toISOString(),
  })
  await saveUsers(env, data)
  return json({ ok: true, user: { username, role: 'member', enabled: true } })
}

export async function handlePatchUser(env, request, usernameRaw) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!env.WENGU_KV) return json({ ok: false, message: '请绑定 WENGU_KV' }, 503)
  const username = sanitizeUsername(usernameRaw)
  if (!username || username === adminUsername(env)) {
    return json({ ok: false, message: '无效的用户名' }, 400)
  }
  const data = await loadUsers(env)
  const idx = data.users.findIndex((u) => u.username === username)
  if (idx < 0) return json({ ok: false, message: '用户不存在' }, 404)
  const user = data.users[idx]
  const body = await request.json().catch(() => ({}))
  if (typeof body.enabled === 'boolean') {
    const was = user.enabled !== false
    user.enabled = body.enabled
    if (was && body.enabled === false) user.sessionEpoch = Number(user.sessionEpoch || 0) + 1
  }
  if (body.password) {
    const pass = sanitizePassword(body.password)
    if (!pass) return json({ ok: false, message: '新密码需 6–128 位' }, 400)
    Object.assign(user, await createPasswordRecord(pass))
    user.sessionEpoch = Number(user.sessionEpoch || 0) + 1
  }
  data.users[idx] = user
  await saveUsers(env, data)
  return json({
    ok: true,
    user: { username: user.username, role: 'member', enabled: user.enabled !== false },
  })
}

export async function handleDeleteUser(env, request, usernameRaw) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!env.WENGU_KV) return json({ ok: false, message: '请绑定 WENGU_KV' }, 503)
  const username = sanitizeUsername(usernameRaw)
  if (!username || username === adminUsername(env)) {
    return json({ ok: false, message: '无效的用户名' }, 400)
  }
  const data = await loadUsers(env)
  const next = data.users.filter((u) => u.username !== username)
  if (next.length === data.users.length) return json({ ok: false, message: '用户不存在' }, 404)
  await saveUsers(env, { users: next })
  return json({ ok: true })
}

export async function handleChatCompletions(env, request) {
  const gate = await requireAuth(env, request)
  if (gate.error) return gate.error
  const key = String(env.DEEPSEEK_API_KEY || '').trim()
  if (!key) {
    return json(
      { error: { message: '未配置 DEEPSEEK_API_KEY', type: 'proxy_config' } },
      503,
    )
  }
  const upstream = String(env.DEEPSEEK_API_BASE || 'https://api.deepseek.com').replace(/\/$/, '')
  const body = await request.json().catch(() => ({}))
  const model = String(body.model || '').trim() || 'deepseek-v4-flash'
  body.model = model
  try {
    const upstreamRes = await fetch(`${upstream}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    })
    const buf = await upstreamRes.arrayBuffer()
    const ct = upstreamRes.headers.get('content-type') || 'application/json'
    return new Response(buf, {
      status: upstreamRes.status,
      headers: {
        'content-type': ct,
        'cache-control': 'no-store',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'upstream failed'
    return json({ error: { message: `AI 代理失败：${msg}`, type: 'proxy_fetch' } }, 502)
  }
}

export { json, sha256Hex }
