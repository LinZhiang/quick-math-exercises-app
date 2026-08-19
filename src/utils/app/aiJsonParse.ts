/** DeepSeek 等模型返回的 JSON：去围栏、从夹杂文本中提取数组 */

export function stripAiJsonFence(text: string): string {
  let t = text.trim()
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')
  }
  return t.trim()
}

function tryParseArray(slice: string): unknown[] | null {
  try {
    const p = JSON.parse(slice) as unknown
    if (Array.isArray(p)) return p
    if (p && typeof p === 'object') return [p]
  } catch {
    /* ignore */
  }
  return null
}

function salvageTruncatedJsonArray(text: string): unknown[] {
  const start = text.indexOf('[')
  if (start < 0) return []
  const candidate = text.slice(start)
  for (let end = candidate.length; end > 2; end--) {
    let sub = candidate.slice(0, end).trimEnd()
    while (sub.endsWith(',')) sub = sub.slice(0, -1).trimEnd()
    if (!sub.endsWith(']')) sub += ']'
    const parsed = tryParseArray(sub)
    if (parsed && parsed.length > 0) return parsed
  }
  return []
}

export function parseAiJsonArrayLenient(text: string): unknown[] {
  const stripped = stripAiJsonFence(text)
  if (!stripped) return []
  const direct = tryParseArray(stripped)
  if (direct) return direct
  const arrayStart = stripped.indexOf('[')
  const arrayEnd = stripped.lastIndexOf(']')
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    const inner = tryParseArray(stripped.slice(arrayStart, arrayEnd + 1))
    if (inner) return inner
  }
  return salvageTruncatedJsonArray(stripped)
}

export function parseAiJsonObjectLenient(text: string): unknown | null {
  const stripped = stripAiJsonFence(text)
  if (!stripped) return null

  const tryObject = (raw: string): unknown | null => {
    const candidates = [
      raw,
      raw.replace(/,\s*([}\]])/g, '$1'), // 去尾逗号
      raw.replace(/[“”]/g, '"').replace(/[‘’]/g, "'"),
      raw.replace(/,\s*([}\]])/g, '$1').replace(/[“”]/g, '"').replace(/[‘’]/g, "'"),
    ]
    for (const c of candidates) {
      try {
        const p = JSON.parse(c) as unknown
        if (p && typeof p === 'object' && !Array.isArray(p)) return p
        if (Array.isArray(p) && p.length > 0 && p[0] && typeof p[0] === 'object') return p[0]
      } catch {
        /* next */
      }
    }
    return null
  }

  const direct = tryObject(stripped)
  if (direct) return direct

  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start >= 0 && end > start) {
    const sliced = tryObject(stripped.slice(start, end + 1))
    if (sliced) return sliced
  }

  // 截断 JSON：尽量补全右括号
  if (start >= 0) {
    let sub = stripped.slice(start).trimEnd()
    while (sub.endsWith(',')) sub = sub.slice(0, -1).trimEnd()
    const opens = (sub.match(/\{/g) ?? []).length
    const closes = (sub.match(/\}/g) ?? []).length
    if (opens > closes) sub += '}'.repeat(opens - closes)
    const salvaged = tryObject(sub)
    if (salvaged) return salvaged
  }
  return null
}
