/**
 * 温故口算 — 服务端身份鉴权
 * - 管理员账号写在 server/.env，任意设备可用同一套凭据登录
 * - 普通成员由管理员在后台增删，持久化到 server/data/users.json
 * - Session 为 HMAC 签名短时令牌；登出/禁用走黑名单 + sessionEpoch 实时校验
 */
import './load-env.mjs'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const BLACKLIST_FILE = path.join(DATA_DIR, 'token-blacklist.json')

const ADMIN_USERNAME = (process.env.WENGU_ADMIN_USERNAME || 'admin').trim()
const ADMIN_PASSWORD = (process.env.WENGU_ADMIN_PASSWORD || '').trim()
/** 成员默认 2 小时；管理员默认 7 天 */
const MEMBER_SESSION_TTL_MS = Number(process.env.WENGU_SESSION_TTL_MS || 2 * 60 * 60 * 1000)
const ADMIN_SESSION_TTL_MS = Number(
  process.env.WENGU_ADMIN_SESSION_TTL_MS || 7 * 24 * 60 * 60 * 1000,
)

function sessionTtlForRole(role) {
  return role === 'admin' ? ADMIN_SESSION_TTL_MS : MEMBER_SESSION_TTL_MS
}

function resolveSessionSecret() {
  const fromEnv = (process.env.WENGU_SESSION_SECRET || '').trim()
  if (fromEnv) return fromEnv
  if (ADMIN_PASSWORD) {
    return crypto.createHash('sha256').update(`wengu-session-v1|${ADMIN_PASSWORD}`).digest('hex')
  }
  return ''
}

const SESSION_SECRET = resolveSessionSecret()

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function hashPassword(password, saltB64) {
  const salt = Buffer.from(saltB64, 'base64')
  return crypto.scryptSync(password, salt, 64).toString('base64')
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('base64')
  const hash = hashPassword(password, salt)
  return { salt, hash }
}

function verifyPassword(password, record) {
  if (!record?.salt || !record?.hash) return false
  const hash = hashPassword(password, record.salt)
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(record.hash))
  } catch {
    return false
  }
}

function safeStringEqual(a, b) {
  const ba = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

function loadUsersFile() {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) return { users: [] }
  try {
    const parsed = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
    if (!Array.isArray(parsed?.users)) return { users: [] }
    return { users: parsed.users }
  } catch {
    return { users: [] }
  }
}

function saveUsersFile(data) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function getMemberRecord(username) {
  const { users } = loadUsersFile()
  return users.find((u) => u.username === username) ?? null
}

function loadBlacklist() {
  ensureDataDir()
  if (!fs.existsSync(BLACKLIST_FILE)) return { entries: [] }
  try {
    const parsed = JSON.parse(fs.readFileSync(BLACKLIST_FILE, 'utf8'))
    if (!Array.isArray(parsed?.entries)) return { entries: [] }
    return { entries: parsed.entries }
  } catch {
    return { entries: [] }
  }
}

function saveBlacklist(data) {
  ensureDataDir()
  const now = Date.now()
  const entries = (data.entries ?? []).filter((e) => typeof e?.exp === 'number' && e.exp > now)
  fs.writeFileSync(BLACKLIST_FILE, `${JSON.stringify({ entries }, null, 2)}\n`, 'utf8')
}

function isJtiBlacklisted(jti) {
  if (!jti) return false
  const { entries } = loadBlacklist()
  const now = Date.now()
  return entries.some((e) => e.jti === jti && e.exp > now)
}

function revokeJti(jti, exp) {
  if (!jti || typeof exp !== 'number') return
  const data = loadBlacklist()
  const now = Date.now()
  if (exp <= now) return
  if (!data.entries.some((e) => e.jti === jti)) {
    data.entries.push({ jti, exp, at: new Date().toISOString() })
  }
  saveBlacklist(data)
}

export function isAuthConfigured() {
  return Boolean(ADMIN_PASSWORD && SESSION_SECRET)
}

export function getAuthPublicConfig() {
  return {
    authEnabled: isAuthConfigured(),
    adminUsernameHint: ADMIN_USERNAME,
    memberSessionTtlMs: MEMBER_SESSION_TTL_MS,
    adminSessionTtlMs: ADMIN_SESSION_TTL_MS,
    memberSessionTtlHours: Math.round((MEMBER_SESSION_TTL_MS / (60 * 60 * 1000)) * 10) / 10,
    adminSessionTtlDays: Math.round((ADMIN_SESSION_TTL_MS / (24 * 60 * 60 * 1000)) * 10) / 10,
    memberStorageHint: 'sessionStorage',
    adminStorageHint: 'localStorage',
  }
}

function authenticateUser(username, password) {
  const name = String(username ?? '').trim()
  const pass = String(password ?? '')
  if (!name || !pass) return null

  if (name === ADMIN_USERNAME && ADMIN_PASSWORD && safeStringEqual(pass, ADMIN_PASSWORD)) {
    return { username: name, role: 'admin' }
  }

  const member = getMemberRecord(name)
  if (member && member.enabled !== false && verifyPassword(pass, member)) {
    return { username: name, role: member.role === 'admin' ? 'admin' : 'member' }
  }
  return null
}

function signToken(user) {
  const now = Date.now()
  const ttl = sessionTtlForRole(user.role)
  const member = user.role === 'member' ? getMemberRecord(user.username) : null
  const payload = {
    sub: user.username,
    role: user.role,
    iat: now,
    exp: now + ttl,
    jti: crypto.randomBytes(16).toString('base64url'),
    epoch: member ? Number(member.sessionEpoch ?? 0) : 0,
  }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

function parseTokenPayload(token) {
  if (!SESSION_SECRET || !token) return null
  const parts = String(token).split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sig] = parts
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url')
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    return JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

/** 解析令牌并做黑名单 + 账号启用状态 + sessionEpoch 实时校验 */
export function resolveSessionUser(token) {
  const payload = parseTokenPayload(token)
  if (!payload?.sub || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
  if (isJtiBlacklisted(payload.jti)) return null

  const username = String(payload.sub)
  const role = payload.role === 'admin' ? 'admin' : 'member'

  if (username === ADMIN_USERNAME && role === 'admin') {
    return { username, role: 'admin' }
  }

  const member = getMemberRecord(username)
  if (!member || member.enabled === false) return null
  const epoch = Number(member.sessionEpoch ?? 0)
  if (Number(payload.epoch ?? 0) !== epoch) return null

  return { username, role: member.role === 'admin' ? 'admin' : 'member' }
}

export function verifySessionToken(token) {
  return resolveSessionUser(token)
}

function extractBearer(req) {
  const h = req.headers.authorization || ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return m?.[1]?.trim() || ''
}

function revokeTokenString(token) {
  const payload = parseTokenPayload(token)
  if (!payload?.jti) return
  revokeJti(payload.jti, payload.exp)
}

export function requireAuth(req, res, next) {
  if (!isAuthConfigured()) {
    res.status(503).json({
      error: {
        message: '服务端未配置登录：请在 server/.env 填写 WENGU_ADMIN_PASSWORD',
        type: 'auth_config',
      },
    })
    return
  }
  const token = extractBearer(req)
  const user = resolveSessionUser(token)
  if (!user) {
    const payload = parseTokenPayload(token)
    if (payload?.sub && payload.sub !== ADMIN_USERNAME) {
      const member = getMemberRecord(String(payload.sub))
      if (member && member.enabled === false) {
        res.status(403).json({
          error: {
            message: '账号已被禁用，请联系管理员',
            type: 'auth_forbidden',
          },
        })
        return
      }
    }
    res.status(401).json({
      error: {
        message: '未登录或会话已过期，请到「导览 → 安装」重新登录',
        type: 'auth_required',
      },
    })
    return
  }
  req.wenguUser = user
  req.wenguToken = token
  next()
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.wenguUser?.role !== 'admin') {
      res.status(403).json({
        error: { message: '需要管理员权限', type: 'auth_forbidden' },
      })
      return
    }
    next()
  })
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

export function attachAuthRoutes(app) {
  app.get('/auth/config', (_req, res) => {
    res.json({ ok: true, ...getAuthPublicConfig() })
  })

  app.post('/auth/login', (req, res) => {
    if (!isAuthConfigured()) {
      res.status(503).json({
        ok: false,
        message: '服务端未配置登录，请联系管理员在 server/.env 设置 WENGU_ADMIN_PASSWORD',
      })
      return
    }
    const user = authenticateUser(req.body?.username, req.body?.password)
    if (!user) {
      res.status(401).json({ ok: false, message: '用户名或密码错误' })
      return
    }
    const token = signToken(user)
    res.json({
      ok: true,
      token,
      user: { username: user.username, role: user.role },
      expiresInMs: sessionTtlForRole(user.role),
    })
  })

  app.post('/auth/logout', (req, res) => {
    const token = extractBearer(req)
    if (token) revokeTokenString(token)
    res.json({ ok: true })
  })

  app.get('/auth/me', (req, res) => {
    const user = resolveSessionUser(extractBearer(req))
    if (!user) {
      res.status(401).json({ ok: false, message: '未登录或会话已过期' })
      return
    }
    res.json({ ok: true, user })
  })

  app.get('/admin/users', requireAdmin, (_req, res) => {
    const { users } = loadUsersFile()
    res.json({
      ok: true,
      users: users.map((u) => ({
        username: u.username,
        role: u.role === 'admin' ? 'admin' : 'member',
        enabled: u.enabled !== false,
        createdAt: u.createdAt ?? null,
      })),
    })
  })

  app.post('/admin/users', requireAdmin, (req, res) => {
    const username = sanitizeUsername(req.body?.username)
    const password = sanitizePassword(req.body?.password)
    if (!username || !password) {
      res.status(400).json({ ok: false, message: '用户名 2–32 位（字母数字下划线中文），密码 6–128 位' })
      return
    }
    if (username === ADMIN_USERNAME) {
      res.status(400).json({ ok: false, message: '不能与管理员用户名重复' })
      return
    }
    const data = loadUsersFile()
    if (data.users.some((u) => u.username === username)) {
      res.status(409).json({ ok: false, message: '用户名已存在' })
      return
    }
    const record = createPasswordRecord(password)
    data.users.push({
      username,
      ...record,
      role: 'member',
      enabled: true,
      sessionEpoch: 0,
      createdAt: new Date().toISOString(),
    })
    saveUsersFile(data)
    res.json({ ok: true, user: { username, role: 'member', enabled: true } })
  })

  app.patch('/admin/users/:username', requireAdmin, (req, res) => {
    const username = sanitizeUsername(req.params.username)
    if (!username || username === ADMIN_USERNAME) {
      res.status(400).json({ ok: false, message: '无效的用户名' })
      return
    }
    const data = loadUsersFile()
    const idx = data.users.findIndex((u) => u.username === username)
    if (idx < 0) {
      res.status(404).json({ ok: false, message: '用户不存在' })
      return
    }
    const user = data.users[idx]
    let epochBumped = false
    if (typeof req.body?.enabled === 'boolean') {
      const wasEnabled = user.enabled !== false
      user.enabled = req.body.enabled
      if (wasEnabled && req.body.enabled === false) {
        user.sessionEpoch = Number(user.sessionEpoch ?? 0) + 1
        epochBumped = true
      }
    }
    if (req.body?.password) {
      const pass = sanitizePassword(req.body.password)
      if (!pass) {
        res.status(400).json({ ok: false, message: '新密码需 6–128 位' })
        return
      }
      Object.assign(user, createPasswordRecord(pass))
      user.sessionEpoch = Number(user.sessionEpoch ?? 0) + 1
      epochBumped = true
    }
    data.users[idx] = user
    saveUsersFile(data)
    if (epochBumped) saveBlacklist(loadBlacklist())
    res.json({
      ok: true,
      user: {
        username: user.username,
        role: 'member',
        enabled: user.enabled !== false,
      },
    })
  })

  app.delete('/admin/users/:username', requireAdmin, (req, res) => {
    const username = sanitizeUsername(req.params.username)
    if (!username || username === ADMIN_USERNAME) {
      res.status(400).json({ ok: false, message: '无效的用户名' })
      return
    }
    const data = loadUsersFile()
    const nextUsers = data.users.filter((u) => u.username !== username)
    if (nextUsers.length === data.users.length) {
      res.status(404).json({ ok: false, message: '用户不存在' })
      return
    }
    saveUsersFile({ users: nextUsers })
    saveBlacklist(loadBlacklist())
    res.json({ ok: true })
  })
}

/** 全局禁止浏览器缓存会话相关响应 */
export function noStoreCacheMiddleware(_req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
}
