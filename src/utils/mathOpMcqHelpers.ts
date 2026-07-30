/** 运算技巧 MCQ 共用：比例约分、干扰去重、禁止 NaN、比例等价过滤 */

export function gcdInt(a: number, b: number): number {
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

export function reduceRatioInts(x: number, y: number): [number, number] {
  const g = gcdInt(x, y)
  return [x / g, y / g]
}

export function ratioStrInts(x: number, y: number): string {
  const [a, b] = reduceRatioInts(x, y)
  return `${a}:${b}`
}

/** 解析 "a:b" 或 "a:b:c"；失败返回 null */
export function parseRatioParts(s: string): number[] | null {
  const parts = s
    .trim()
    .split(':')
    .map((p) => Number(p.trim()))
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) return null
  return parts
}

/** 两比例字符串是否数学等价（含项数不同则否） */
export function ratiosEquivalent(a: string, b: string): boolean {
  const pa = parseRatioParts(a)
  const pb = parseRatioParts(b)
  if (!pa || !pb || pa.length !== pb.length) return false
  if (pa.some((n) => n === 0) || pb.some((n) => n === 0)) {
    return pa.every((n, i) => n === pb[i])
  }
  const scaleA = pa[0]!
  const scaleB = pb[0]!
  for (let i = 0; i < pa.length; i++) {
    // pa[i]/pa[0] == pb[i]/pb[0]
    if (pa[i]! * scaleB !== pb[i]! * scaleA) return false
  }
  return true
}

/**
 * 收集干扰项：文本互异、禁止 NaN、禁止与正确答案比例等价。
 * 不足时用安全假比例/假整数补齐，绝不产出 "NaN"。
 */
export function uniqueMcqStrings(correct: string, cands: string[], need = 3): string[] {
  const c = correct.trim()
  const out: string[] = []
  const seen = new Set<string>([c.replace(/\s+/g, '')])

  const tryPush = (raw: string) => {
    const t = raw.trim()
    if (!t || t === 'NaN' || /nan/i.test(t)) return false
    const key = t.replace(/\s+/g, '')
    if (seen.has(key)) return false
    if (ratiosEquivalent(c, t)) return false
    seen.add(key)
    out.push(t)
    return true
  }

  for (const cand of cands) {
    tryPush(String(cand))
    if (out.length >= need) break
  }

  const nCorrect = Number(c)
  let g = 0
  while (out.length < need && g++ < 60) {
    if (Number.isFinite(nCorrect) && c !== '' && !c.includes(':')) {
      tryPush(String(Math.round(nCorrect) + g + 1))
    } else if (c.includes(':')) {
      const parts = parseRatioParts(c)
      if (parts && parts.length >= 2) {
        const bumped = parts.map((p, i) => (i === 0 ? p + g : p + (g % 3)))
        tryPush(bumped.join(':'))
        tryPush([...parts].reverse().join(':'))
      } else {
        tryPush(`${g}:${g + 1}`)
      }
    } else {
      tryPush(String(10 + g))
    }
  }
  return out.slice(0, need)
}

export function uniqueMcqNums(correct: number, cands: number[], need = 3): string[] {
  return uniqueMcqStrings(
    String(correct),
    cands
      .filter((x) => Number.isFinite(x) && Number.isInteger(x) && x !== correct)
      .map(String),
    need,
  )
}

/**
 * 十字交叉：用整数百分点与利润/成本精确算成本比，避免浮点舍入成 1563:937。
 * aPct、bPct 为带符号百分数（如 15、-10），profit/total 为成本与利润。
 */
export function crossYieldCostRatio(
  aPct: number,
  bPct: number,
  profit: number,
  total: number,
): string | null {
  if (total <= 0) return null
  // (c-b):(a-c) 两边同乘 100*total
  const x = 100 * profit - bPct * total
  const y = aPct * total - 100 * profit
  if (x <= 0 || y <= 0) return null
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    // 仍尽量约分到整数
    const g = gcdInt(Math.round(x), Math.round(y))
    if (g <= 0) return null
    return ratioStrInts(Math.round(x), Math.round(y))
  }
  return ratioStrInts(x, y)
}
