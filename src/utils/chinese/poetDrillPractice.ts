/** 识记·诗词模块分期测试：基于材料的细致四选一 */

import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chinese/chineseMcqAiFields'

export type PoetDrillQuestionType =
  | 'verse-to-author'
  | 'author-to-verse'
  | 'verse-to-background'
  | 'poet-fact'

export const POET_DRILL_QUESTION_COUNT = 10

export type PoetDrillQuestion = {
  id: string
  questionType: PoetDrillQuestionType
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
  /** 如 tang-early */
  scopeKey: string
}

export function poetDrillQuestionTypeLabel(type: PoetDrillQuestionType): string {
  if (type === 'verse-to-author') return '诗句选作者'
  if (type === 'author-to-verse') return '作者选诗句'
  if (type === 'verse-to-background') return '诗句选背景'
  return '诗人背景'
}

/** 作答前是否展示 term（篇目/考点标识）；背景题、诗句选作者题提前露篇目会降难度 */
export function shouldShowPoetDrillTermBeforeSubmit(q: PoetDrillQuestion): boolean {
  return q.questionType === 'author-to-verse' || q.questionType === 'poet-fact'
}

function normalizeLeakText(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, '')
    .replace(/[《》〈〉「」『』【】\[\]（）()、，。！？：；·\-—_/\\]/g, '')
}

function stemLeaksAnswer(stem: string, answer: string): boolean {
  const a = normalizeLeakText(answer)
  if (!a || a.length < 2) return false
  return normalizeLeakText(stem).includes(a)
}

/** 选项是否把篇目名/考点标识直接写进文案（如「武昌黄鹤楼…」对 term「黄鹤楼」） */
function termLandmarkKeys(term: string): string[] {
  const t = normalizeLeakText(term)
  if (t.length < 2) return []
  const keys = new Set<string>([t])
  const base = t
    .replace(/二首.*$/, '')
    .replace(/其三$/, '')
    .replace(/其二$/, '')
    .replace(/其一$/, '')
    .replace(/第[一二三四五六七八九十百]+$/, '')
  if (base.length >= 2) keys.add(base)
  const stripped = base.replace(/^(早发|晚泊|夜泊|登|过|送|忆|望|游|题|赋|咏|观)/, '')
  if (stripped.length >= 3 && stripped.length <= 8) keys.add(stripped)
  return [...keys]
}

function optionLeaksTerm(option: string, term: string): boolean {
  const o = normalizeLeakText(option)
  if (!o) return false
  return termLandmarkKeys(term).some((k) => o.includes(k))
}

/**
 * 背景题过易：正确答案含篇目名；或四选项里只有正确答案含篇目名关键字。
 * 干扰项也含篇目名时同样过易（一眼对号入座），一律拒收。
 */
function isTooEasyBackgroundMcq(
  term: string,
  correct: string,
  distractors: string[],
): boolean {
  if (optionLeaksTerm(correct, term)) return true
  if (distractors.some((d) => optionLeaksTerm(d, term))) return true
  return false
}

export function getPoetDrillQuestionFingerprint(input: {
  questionType: PoetDrillQuestionType
  term: string
  stem: string
  options: string[]
  scopeKey: string
}): string {
  const opts = [...input.options].map((o) => o.trim()).sort().join('\u001f')
  return [
    'poet-drill',
    input.scopeKey,
    input.questionType,
    input.term.trim(),
    input.stem.trim(),
    opts,
  ].join('\u001e')
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export function buildPoetDrillQuestionFromMcq(input: {
  questionType: PoetDrillQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  scopeKey: string
  seq: number
}): PoetDrillQuestion | null {
  const term = input.term.trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  if (stemLeaksAnswer(stem, correct)) return null
  if (
    input.questionType === 'verse-to-background' &&
    isTooEasyBackgroundMcq(term, correct, distractors)
  ) {
    return null
  }
  if (
    (input.questionType === 'verse-to-author' ||
      input.questionType === 'verse-to-background') &&
    stemLeaksAnswer(stem, term)
  ) {
    // stem 里直接写篇目名同样降难度
    return null
  }
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getPoetDrillQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    scopeKey: input.scopeKey,
  })
  const q: PoetDrillQuestion = {
    id: `poet-drill-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
    scopeKey: input.scopeKey,
  }
  if (!isPlayableFourChoiceMcq(q)) return null
  return q
}

const TYPE_ALIASES: Record<string, PoetDrillQuestionType> = {
  'verse-to-author': 'verse-to-author',
  'author-to-verse': 'author-to-verse',
  'verse-to-background': 'verse-to-background',
  'poet-fact': 'poet-fact',
  诗句选作者: 'verse-to-author',
  选作者: 'verse-to-author',
  作者选诗句: 'author-to-verse',
  选诗句: 'author-to-verse',
  诗句选背景: 'verse-to-background',
  选背景: 'verse-to-background',
  诗人背景: 'poet-fact',
  背景事实: 'poet-fact',
}

export function parsePoetDrillMcqAiObject(item: unknown): {
  questionType: PoetDrillQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const typeRaw = String(o.questionType ?? o.type ?? '').trim()
  const questionType = TYPE_ALIASES[typeRaw] ?? null
  if (!questionType) return null
  const term = String(o.term ?? o.poem ?? o.title ?? o.poet ?? '').trim()
  const stem = String(o.stem ?? o.question ?? o.lines ?? '').trim()
  const picked = extractMcqCorrectAndDistractors(o)
  if (!picked || !term || !stem) return null
  return {
    questionType,
    term,
    stem,
    correct: picked.correct,
    distractors: picked.distractors,
    explanation: String(o.explanation ?? o.explain ?? '').trim(),
  }
}
