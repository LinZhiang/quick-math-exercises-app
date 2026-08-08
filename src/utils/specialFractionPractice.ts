/**
 * 估算分数 · 特殊分数值
 * 仅考查固定对照表内的「单位分数 ↔ 百分数」互化，不外扩。
 */

export type SpecialFractionMode = 'fraction-special-easy' | 'fraction-special-hard'

export type SpecialFractionModeConfig = {
  id: SpecialFractionMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

/** 对照表：严格按产品给定文案（含一位小数百分数） */
export const SPECIAL_FRACTION_TABLE: ReadonlyArray<{ den: number; pct: string }> = [
  { den: 2, pct: '50%' },
  { den: 3, pct: '33.3%' },
  { den: 4, pct: '25%' },
  { den: 5, pct: '20%' },
  { den: 6, pct: '16.7%' },
  { den: 7, pct: '14.3%' },
  { den: 8, pct: '12.5%' },
  { den: 9, pct: '11.1%' },
  { den: 10, pct: '10%' },
  { den: 11, pct: '9.1%' },
  { den: 12, pct: '8.3%' },
  { den: 13, pct: '7.7%' },
  { den: 14, pct: '7.1%' },
  { den: 15, pct: '6.7%' },
  { den: 16, pct: '6.3%' },
  { den: 17, pct: '5.9%' },
  { den: 18, pct: '5.6%' },
  { den: 19, pct: '5.3%' },
]

/** 简单：10% 及以上 → 1/2 … 1/10 */
const EASY_TABLE = SPECIAL_FRACTION_TABLE.filter((x) => x.den <= 10)

/** 高难：5.3% 及以上 → 全表 1/2 … 1/19 */
const HARD_TABLE = SPECIAL_FRACTION_TABLE

export const SPECIAL_FRACTION_MODES: SpecialFractionModeConfig[] = [
  {
    id: 'fraction-special-easy',
    label: '简单题',
    durationSec: 25,
    optionCount: 3,
    correctDelta: 4,
    wrongDelta: -8,
    maxScore: 100,
    desc: '25 秒 · 对照表 1/2～1/10（≥10%）百分数↔分数 · 3 选项 · 对 +4 / 错 -8 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'fraction-special-hard',
    label: '高难题',
    durationSec: 35,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -16,
    maxScore: 100,
    desc: '35 秒 · 对照表 1/2～1/19（≥5.3%）百分数↔分数 · 4 选项 · 对 +8 / 错 -16 · 对 +1 秒 / 错 -1 秒',
  },
]

export type SpecialFractionQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function fracLabel(den: number): string {
  return `1/${den}`
}

function tableFor(mode: SpecialFractionMode) {
  return mode === 'fraction-special-easy' ? EASY_TABLE : HARD_TABLE
}

function pickDistractors(correct: string, pool: string[], need: number): string[] {
  const wrong = shuffle(pool.filter((x) => x !== correct))
  const out: string[] = []
  for (const x of wrong) {
    if (out.length >= need) break
    out.push(x)
  }
  // 表内不够时不应发生；兜底仍从表内循环取不同项
  let i = 0
  while (out.length < need && i < pool.length * 2) {
    const x = pool[i % pool.length]!
    i++
    if (x === correct || out.includes(x)) continue
    out.push(x)
  }
  return out.slice(0, need)
}

function buildMcq(
  id: number,
  expression: string,
  correct: string,
  optionPool: string[],
  optionCount: number,
  explanation: string,
): SpecialFractionQuestion {
  const need = Math.max(1, optionCount - 1)
  const distractors = pickDistractors(correct, optionPool, need)
  const options = shuffle([correct, ...distractors])
  const correctIndex = Math.max(0, options.findIndex((x) => x === correct))
  return { id, expression, correctAnswer: correct, options, correctIndex, explanation }
}

export function generateSpecialFractionQuestion(
  mode: SpecialFractionMode,
  id: number,
  optionCount: number,
): SpecialFractionQuestion {
  const table = tableFor(mode)
  const entry = pickOne(table)
  const frac = fracLabel(entry.den)
  const pct = entry.pct
  const fracPool = table.map((x) => fracLabel(x.den))
  const pctPool = table.map((x) => x.pct)

  // 双向各半：分数→百分数 / 百分数→分数
  if (Math.random() < 0.5) {
    return buildMcq(
      id,
      `${frac} 百分数`,
      pct,
      pctPool,
      optionCount,
      `对照：${frac} = ${pct}`,
    )
  }
  return buildMcq(
    id,
    `${pct} 分数`,
    frac,
    fracPool,
    optionCount,
    `对照：${pct} = ${frac}`,
  )
}

export function isSpecialFractionMode(mode: string): mode is SpecialFractionMode {
  return mode === 'fraction-special-easy' || mode === 'fraction-special-hard'
}

export function getSpecialFractionModeConfig(mode: SpecialFractionMode): SpecialFractionModeConfig {
  const hit = SPECIAL_FRACTION_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知特殊分数值模式: ${mode}`)
  return hit
}

export function getSpecialFractionQuestionFingerprint(q: SpecialFractionQuestion): string {
  return `${q.expression}\u001f${q.correctAnswer}\u001f${[...q.options].sort().join('|')}`
}
