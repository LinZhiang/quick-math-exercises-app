/**
 * 前端讲义测验：把题干里的 JS 真正跑一遍，标答对不上就整题作废。
 * 也据此生成「代码骨架」，后一轮换字符串/变量名仍算雷同。
 */

export type HandoutJsRun =
  | { status: 'value'; value: unknown; logs: string[]; focus: 'probe' | 'logs' }
  | { status: 'throw'; name: string; message: string; logs: string[] }
  | { status: 'skip' }

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
  'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'typeof', 'instanceof',
  'in', 'of', 'void', 'delete', 'async', 'await', 'yield', 'import', 'export', 'default', 'extends',
  'static', 'get', 'set', 'this', 'super', 'with', 'debugger', 'true', 'false', 'null', 'undefined',
])

const JS_BUILTINS = new Set([
  'console', 'Error', 'TypeError', 'ReferenceError', 'SyntaxError', 'RangeError', 'URIError',
  'JSON', 'Math', 'Number', 'String', 'Boolean', 'Array', 'Object', 'Date', 'Promise', 'Symbol',
  'BigInt', 'Map', 'Set', 'WeakMap', 'WeakSet', 'RegExp', 'Proxy', 'Reflect', 'Intl',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'NaN', 'Infinity',
  'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'arguments',
])

function stripAskText(stem: string): string {
  return String(stem ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`[^`]*`/g, ' ')
}

function stripJsStringsAndComments(js: string): string {
  return String(js ?? '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
}

export function isUnsafeHandoutJs(js: string): boolean {
  const body = stripJsStringsAndComments(js)
  return (
    /\b(?:window|document|globalThis|process|require|fetch|XMLHttpRequest|Worker|importScripts|indexedDB|localStorage|eval|Function)\b/.test(
      body,
    ) || /\bimport\s/.test(body)
  )
}

export function skeletonizeHandoutJs(js: string): string {
  let src = String(js ?? '')
  src = src.replace(/\/\*[\s\S]*?\*\//g, '')
  src = src.replace(/\/\/.*$/gm, '')
  src = src.replace(/\/((?:\\.|[^/\n])+?)\/([gimsuy]*)/g, (_all, body: string, flags: string) => {
    return `/${String(body).replace(/[A-Za-z0-9]+/g, 'x')}/${flags}`
  })
  src = src.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, 'S')
  const map = new Map<string, string>()
  src = src.replace(/\b[A-Za-z_$][\w$]*\b/g, (name) => {
    if (JS_KEYWORDS.has(name) || JS_BUILTINS.has(name)) return name
    const hit = map.get(name)
    if (hit) return hit
    const next = `I${map.size}`
    map.set(name, next)
    return next
  })
  return src.replace(/\s+/g, '').slice(0, 180)
}

export function frontendQuizAskPattern(stem: string): string {
  const t = stripAskText(stem)
  if (/exec|match/.test(t) && /\[\s*\d+\s*\]/.test(t)) return 're-index'
  if (/exec/.test(t) && /结果|返回|值/.test(t)) return 're-exec'
  if (/\.test\s*\(/.test(t) || /test\(/.test(t)) return 're-test'
  if (/replace\(/.test(t)) return 're-replace'
  if (/typeof/.test(t)) return 'typeof'
  if (/console\.log|控制台|打印出|输出什么|输出的是/.test(t)) return 'output'
  if (/的值是|等于多少|运行结果/.test(t)) return 'value'
  return 'other'
}

export function detectHandoutJsProbe(stem: string, js: string): string | 'logs' | null {
  const ask = stripAskText(stem)
  const idx = ask.match(/\b([A-Za-z_$][\w$]*)\s*\[\s*(\d+)\s*\]/)
  if (idx) return `${idx[1]}[${idx[2]}]`
  const val = ask.match(/\b([A-Za-z_$][\w$]*)\s*(?:的值|等于什么|是多少|为何值|的结果)/)
  if (val && !['exec', 'match', 'test', 'log', 'console'].includes(val[1] ?? '')) return val[1] ?? null
  if (/console\.log/.test(js) && /输出|打印|控制台/.test(ask)) return 'logs'
  const execCall = js.match(/((?:[A-Za-z_$][\w$]*\.)exec\s*\([^)]+\))/)
  if (execCall && /exec|匹配/.test(ask)) {
    const n = ask.match(/\[\s*(\d+)\s*\]/)
    if (n) return `${execCall[1]}[${n[1]}]`
    return execCall[1]
  }
  if (/输出|运行结果|打印/.test(ask) && /console\.log/.test(js)) return 'logs'
  return null
}

export function runHandoutQuizJs(source: string, probe: string | 'logs' | null): HandoutJsRun {
  const js = String(source || '').trim()
  if (!js || js.length > 4000) return { status: 'skip' }
  if (isUnsafeHandoutJs(js)) return { status: 'skip' }
  const probeExpr = probe && probe !== 'logs' ? probe : 'void 0'
  const body = `"use strict";
const __logs = [];
const console = {
  log: function () {
    const parts = [];
    for (let i = 0; i < arguments.length; i++) {
      const x = arguments[i];
      parts.push(x === undefined ? 'undefined' : x === null ? 'null' : String(x));
    }
    __logs.push(parts.join(' '));
  },
};
try {
${js}
  var __probe = ${probeExpr};
  return { ok: true, logs: __logs, probe: __probe };
} catch (e) {
  return {
    ok: false,
    logs: __logs,
    name: e && e.name ? String(e.name) : 'Error',
    message: e && e.message ? String(e.message) : String(e),
  };
}`
  try {
    const fn = new Function(body)
    const ret = fn() as {
      ok?: boolean
      logs?: string[]
      probe?: unknown
      name?: string
      message?: string
    }
    const logs = Array.isArray(ret?.logs) ? ret.logs.map(String) : []
    if (ret && ret.ok) {
      return {
        status: 'value',
        value: ret.probe,
        logs,
        focus: probe === 'logs' ? 'logs' : 'probe',
      }
    }
    return {
      status: 'throw',
      name: String(ret?.name || 'Error'),
      message: String(ret?.message || ''),
      logs,
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    return { status: 'throw', name: err.name || 'Error', message: err.message || String(e), logs: [] }
  }
}

function compactAns(s: string): string {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
    .replace(/[`'"“”‘’]/g, '')
    .toLowerCase()
}

function stringifyRuntimeValue(value: unknown): string[] {
  if (value === null) return ['null', '空']
  if (value === undefined) return ['undefined', '未定义']
  if (typeof value === 'string') {
    return [compactAns(value), compactAns(JSON.stringify(value))]
  }
  if (typeof value === 'number' || typeof value === 'boolean') return [compactAns(String(value))]
  if (Array.isArray(value)) {
    const first = value.length ? stringifyRuntimeValue(value[0]) : []
    return [...first, compactAns(value.map(String).join(',')), compactAns(JSON.stringify(value))]
  }
  try {
    return [compactAns(JSON.stringify(value)), compactAns(String(value))]
  } catch {
    return [compactAns(String(value))]
  }
}

function looksLikeErrorClaim(claim: string): boolean {
  const c = compactAns(claim)
  return /报错|异常|error|typeerror|referenceerror|cannotread|无法读取|不能读取|会抛/.test(c)
}

export function handoutJsAnswerMatches(
  claim: string,
  run: HandoutJsRun,
  options?: string[],
): boolean {
  const c = compactAns(claim)
  if (!c) return false
  if (run.status === 'skip') return false
  if (run.status === 'throw') {
    if (looksLikeErrorClaim(c)) return true
    if (options?.some((opt) => looksLikeErrorClaim(opt) && compactAns(opt) !== c)) return false
    return false
  }
  const tokens = new Set<string>()
  if (run.focus === 'logs') {
    for (const line of run.logs) tokens.add(compactAns(line))
  } else {
    for (const t of stringifyRuntimeValue(run.value)) tokens.add(t)
  }
  if (tokens.has(c)) return true
  if (run.focus === 'logs' && run.logs.some((line) => compactAns(line) === c || compactAns(line).includes(c))) {
    return true
  }
  if (c === '空字符串' || c === '空串') return run.focus !== 'logs' && (tokens.has('') || run.value === '')
  return false
}

export function normalizeQuizAvoidText(s: string): string {
  return String(s || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
    .replace(/[0-9]+/g, 'N')
    .slice(0, 96)
}

export function quizAvoidOverlaps(candidate: string, avoid: Iterable<string>): boolean {
  const a = normalizeQuizAvoidText(candidate)
  if (a.length < 8) return false
  for (const raw of avoid) {
    const b = normalizeQuizAvoidText(raw)
    if (b.length < 8) continue
    if (a === b) return true
    const headA = a.slice(0, 20)
    const headB = b.slice(0, 20)
    if (headA.length >= 12 && (a.includes(headB) || b.includes(headA))) return true
  }
  return false
}
