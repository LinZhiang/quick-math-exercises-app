/** 口算·圈出所有语法：圈出句中全部主谓宾定状补 */

import {
  ALL_GRAMMAR_ROLES,
  GRAMMAR_JUDGMENT_BANK,
  GRAMMAR_ROLE_LABELS,
  type GrammarPart,
  type GrammarRole,
  type GrammarSentence,
} from '@/utils/grammarJudgmentBank'

export type CircleGrammarMode = 'circle-grammar-easy' | 'circle-grammar-hard'

export type CircleGrammarModeConfig = {
  id: CircleGrammarMode
  label: string
  /** 0 = 不计倒计时，只累计用时 */
  durationSec: number
  questionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
  bankDifficulty: 'normal' | 'hard'
}

export const CIRCLE_GRAMMAR_MODES: CircleGrammarModeConfig[] = [
  {
    id: 'circle-grammar-easy',
    label: '简单题',
    durationSec: 0,
    questionCount: 5,
    correctDelta: 20,
    wrongDelta: -5,
    maxScore: 100,
    desc: '5 题 · 普通句式 · 圈出全部成分 · 不计时 · 对 +20 / 错 -5',
    bankDifficulty: 'normal',
  },
  {
    id: 'circle-grammar-hard',
    label: '困难题',
    durationSec: 0,
    questionCount: 5,
    correctDelta: 20,
    wrongDelta: -5,
    maxScore: 100,
    desc: '5 题 · 复杂句式 · 圈出全部成分 · 不计时 · 对 +20 / 错 -5',
    bankDifficulty: 'hard',
  },
]

export type CircleGrammarMark = {
  text: string
  role: GrammarRole
  /** 在原句中的起始下标（用于高亮；手动输入可无） */
  start?: number
  end?: number
}

export type CircleGrammarQuestion = {
  id: number
  sentence: GrammarSentence
  prompt: string
  expected: GrammarPart[]
  explanation: string
}

const CURSOR_KEY = 'mental-circle-grammar-cursor-v1'

type CursorMap = Record<'easy' | 'hard', number>

let memoryCursors: CursorMap = { easy: 0, hard: 0 }
let memoryHydrated = false

function hydrateCursorsOnce() {
  if (memoryHydrated) return
  memoryHydrated = true
  try {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(CURSOR_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<CursorMap>
    memoryCursors = {
      easy: typeof parsed.easy === 'number' ? parsed.easy : 0,
      hard: typeof parsed.hard === 'number' ? parsed.hard : 0,
    }
  } catch {
    /* ignore */
  }
}

function readCursors(): CursorMap {
  hydrateCursorsOnce()
  return { ...memoryCursors }
}

function writeCursors(map: CursorMap) {
  memoryCursors = { ...map }
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(CURSOR_KEY, JSON.stringify(memoryCursors))
  } catch {
    /* ignore */
  }
}

export function isCircleGrammarMode(mode: string): mode is CircleGrammarMode {
  return mode === 'circle-grammar-easy' || mode === 'circle-grammar-hard'
}

export function getCircleGrammarModeConfig(mode: CircleGrammarMode): CircleGrammarModeConfig {
  const hit = CIRCLE_GRAMMAR_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`Unknown circle grammar mode: ${mode}`)
  return hit
}

export function clampCircleGrammarScore(score: number): number {
  return Math.max(0, Math.min(100, score))
}

function poolFor(mode: CircleGrammarMode): GrammarSentence[] {
  const diff = getCircleGrammarModeConfig(mode).bankDifficulty
  return GRAMMAR_JUDGMENT_BANK.filter((s) => s.difficulty === diff)
}

function cursorKey(mode: CircleGrammarMode): 'easy' | 'hard' {
  return mode === 'circle-grammar-hard' ? 'hard' : 'easy'
}

function takeNextSentence(mode: CircleGrammarMode): GrammarSentence {
  const pool = poolFor(mode)
  const key = cursorKey(mode)
  const cursors = readCursors()
  const idx = ((cursors[key] % pool.length) + pool.length) % pool.length
  cursors[key] = idx + 1
  writeCursors(cursors)
  return pool[idx]!
}

function uniqueParts(parts: GrammarPart[]): GrammarPart[] {
  const seen = new Set<string>()
  const out: GrammarPart[] = []
  for (const p of parts) {
    const key = `${p.role}|${p.text.trim()}`
    if (!p.text.trim() || seen.has(key)) continue
    seen.add(key)
    out.push({ text: p.text.trim(), role: p.role })
  }
  return out
}

function formatExplanation(sentence: string, parts: GrammarPart[]): string {
  return `整句：${sentence} 成分：${parts
    .map((p) => `${p.text}（${GRAMMAR_ROLE_LABELS[p.role]}）`)
    .join('、')}。`
}

export function generateCircleGrammarQuestion(
  mode: CircleGrammarMode,
  id: number,
): CircleGrammarQuestion {
  const sentence = takeNextSentence(mode)
  const expected = uniqueParts(sentence.parts)
  return {
    id,
    sentence,
    prompt: '请圈出句中全部主语、谓语、宾语、定语、状语、补语（可滑动圈选或手动输入）。',
    expected,
    explanation: formatExplanation(sentence.sentence, expected),
  }
}

export function getCircleGrammarQuestionFingerprint(q: CircleGrammarQuestion): string {
  return `circle-grammar:${q.sentence.id}`
}

function normalizeMarkKey(text: string, role: GrammarRole): string {
  return `${role}|${text.replace(/\s+/g, '').trim()}`
}

/** 判定：成分集合完全一致（角色+文本，顺序无关） */
export function validateCircleGrammarAnswer(
  expected: GrammarPart[],
  marks: CircleGrammarMark[],
): { ok: boolean; missing: GrammarPart[]; extra: CircleGrammarMark[]; detail: string } {
  const expKeys = new Map<string, GrammarPart>()
  for (const p of uniqueParts(expected)) {
    expKeys.set(normalizeMarkKey(p.text, p.role), p)
  }

  const actKeys = new Map<string, CircleGrammarMark>()
  for (const m of marks) {
    const t = m.text.replace(/\s+/g, '').trim()
    if (!t) continue
    actKeys.set(normalizeMarkKey(t, m.role), { ...m, text: t })
  }

  const missing: GrammarPart[] = []
  for (const [k, p] of expKeys) {
    if (!actKeys.has(k)) missing.push(p)
  }
  const extra: CircleGrammarMark[] = []
  for (const [k, m] of actKeys) {
    if (!expKeys.has(k)) extra.push(m)
  }

  const ok = missing.length === 0 && extra.length === 0
  const detail = ok
    ? '全部成分圈选正确'
    : [
        missing.length
          ? `漏标：${missing.map((p) => `${p.text}（${GRAMMAR_ROLE_LABELS[p.role]}）`).join('、')}`
          : '',
        extra.length
          ? `多标/错标：${extra.map((m) => `${m.text}（${GRAMMAR_ROLE_LABELS[m.role]}）`).join('、')}`
          : '',
      ]
        .filter(Boolean)
        .join('；')

  return { ok, missing, extra, detail }
}

export function formatCircleGrammarMarks(marks: CircleGrammarMark[]): string {
  if (!marks.length) return '（未圈选）'
  return marks.map((m) => `${m.text}=${GRAMMAR_ROLE_LABELS[m.role]}`).join('、')
}

export function formatCircleGrammarExpected(parts: GrammarPart[]): string {
  return parts.map((p) => `${p.text}=${GRAMMAR_ROLE_LABELS[p.role]}`).join('、')
}

export { ALL_GRAMMAR_ROLES, GRAMMAR_ROLE_LABELS }
