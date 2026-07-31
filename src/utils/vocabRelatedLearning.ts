/** 重点题 · 成语/词语「关联学习」：学习包与小测类型 */

import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'

export type VocabRelatedKind = 'idiom' | 'word'

export type VocabRelatedSourceRow = {
  fingerprint: string
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  questionType: string
}

export type VocabRelatedConfusable = {
  word: string
  meaning: string
  howToDistinguish: string
}

export type VocabRelatedOtherOption = {
  text: string
  meaning: string
}

export type VocabRelatedQuizType = 'meaning' | 'fill'

export type VocabRelatedQuizQuestion = {
  id: string
  questionType: VocabRelatedQuizType
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  /** 本小题主要考查的词 */
  focusTerm: string
}

export type VocabRelatedLearningPack = {
  term: string
  kind: VocabRelatedKind
  /** 第一层 */
  meaning: string
  phonologyNotes: string
  /** 第二层：高频易混（至少 1） */
  confusables: VocabRelatedConfusable[]
  /** 第三层 */
  synonyms: string[]
  antonyms: string[]
  otherOptions: VocabRelatedOtherOption[]
  /** 学后小测 2～3 题 */
  quiz: VocabRelatedQuizQuestion[]
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => String(x ?? '').trim()).filter(Boolean)
}

function parseConfusables(raw: unknown): VocabRelatedConfusable[] {
  if (!Array.isArray(raw)) return []
  const out: VocabRelatedConfusable[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const word = String(o.word ?? o.term ?? '').trim()
    const meaning = String(o.meaning ?? o.definition ?? '').trim()
    const howToDistinguish = String(
      o.howToDistinguish ?? o.distinguish ?? o.diff ?? o.note ?? '',
    ).trim()
    if (!word || !meaning) continue
    out.push({
      word,
      meaning,
      howToDistinguish: howToDistinguish || '注意语境搭配与感情色彩差异。',
    })
  }
  return out
}

function pickMeaningField(o: Record<string, unknown>): string {
  return String(
    o.meaning ??
      o.definition ??
      o.释义 ??
      o.意思 ??
      o.explain ??
      o.explanation ??
      o.note ??
      o.desc ??
      o.description ??
      '',
  ).trim()
}

function pickTextField(o: Record<string, unknown>): string {
  return String(o.text ?? o.option ?? o.word ?? o.term ?? o.name ?? '').trim()
}

/**
 * 解析其他选项释义。缺释义则返回 null（整包作废，触发补生成），禁止占位文案入库。
 */
function parseOtherOptions(
  raw: unknown,
  fallback: string[],
): VocabRelatedOtherOption[] | null {
  const byText = new Map<string, string>()

  const absorb = (text: string, meaning: string) => {
    const t = text.trim()
    const m = meaning.trim()
    if (!t || !m) return
    if (!byText.has(t)) byText.set(t, m)
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string') {
        const s = item.trim()
        const m = s.match(/^(.+?)[：:：\s]+(.+)$/)
        if (m) absorb(m[1]!, m[2]!)
        continue
      }
      if (!item || typeof item !== 'object') continue
      const o = item as Record<string, unknown>
      absorb(pickTextField(o), pickMeaningField(o))
    }
  } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      absorb(k, String(v ?? '').trim())
    }
  }

  if (!fallback.length) {
    return [...byText.entries()].map(([text, meaning]) => ({ text, meaning }))
  }

  const out: VocabRelatedOtherOption[] = []
  for (const text of fallback) {
    const t = text.trim()
    if (!t) continue
    let meaning = byText.get(t)
    if (!meaning) {
      // 宽松匹配：去空白后相等
      const norm = t.replace(/\s+/g, '')
      for (const [k, v] of byText) {
        if (k.replace(/\s+/g, '') === norm) {
          meaning = v
          break
        }
      }
    }
    if (!meaning) return null
    out.push({ text: t, meaning })
  }
  return out.length ? out : null
}

/** 关联学习小测：只要求四选项结构可用，不过度用「表面泄题」卡死（否则整包易解析失败） */
function isUsableRelatedQuizMcq(q: { options: string[]; correctIndex: number }): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => String(o ?? '').trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n)) return false
  return new Set(norms).size === 4
}

function parseQuizItem(
  item: unknown,
  kind: VocabRelatedKind,
  focusFallback: string,
  seq: number,
): VocabRelatedQuizQuestion | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const typeRaw = String(o.questionType ?? o.type ?? 'meaning').trim()
  const questionType: VocabRelatedQuizType =
    typeRaw === 'fill' || typeRaw === '选词填空' || typeRaw === 'fill-blank'
      ? 'fill'
      : 'meaning'
  const stem = String(o.stem ?? o.question ?? '').trim()
  const focusTerm = String(o.focusTerm ?? o.term ?? focusFallback).trim() || focusFallback
  const picked = extractMcqCorrectAndDistractors(o)
  if (!stem || !picked) return null
  const assembled = assembleFourChoiceMcq(picked.correct, picked.distractors, shuffleInPlace)
  if (!assembled) return null
  const q: VocabRelatedQuizQuestion = {
    id: `vocab-rel-quiz-${kind}-${seq}-${Date.now()}`,
    questionType,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    explanation: String(o.explanation ?? o.explain ?? '').trim(),
    focusTerm,
  }
  if (!isUsableRelatedQuizMcq(q) && !isPlayableFourChoiceMcq(q)) return null
  return q
}

export function parseVocabRelatedLearningPack(
  raw: unknown,
  input: {
    kind: VocabRelatedKind
    term: string
    otherOptionTexts: string[]
  },
): VocabRelatedLearningPack | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const layer1 =
    o.layer1 && typeof o.layer1 === 'object' ? (o.layer1 as Record<string, unknown>) : o
  const layer2 =
    o.layer2 && typeof o.layer2 === 'object' ? (o.layer2 as Record<string, unknown>) : o
  const layer3 =
    o.layer3 && typeof o.layer3 === 'object' ? (o.layer3 as Record<string, unknown>) : o

  const meaning = String(
    layer1.meaning ?? layer1.definition ?? o.meaning ?? o.definition ?? '',
  ).trim()
  if (!meaning) return null

  const phonologyNotes = String(
    layer1.phonologyNotes ?? layer1.phonetics ?? layer1.formNotes ?? o.phonologyNotes ?? '',
  ).trim()

  let confusables = parseConfusables(
    layer2.confusables ?? layer2.confused ?? o.confusables ?? o.confusedWords,
  )
  if (!confusables.length) return null

  const synonyms = asStringArray(layer3.synonyms ?? o.synonyms)
  const antonyms = asStringArray(layer3.antonyms ?? o.antonyms)
  const otherOptions = parseOtherOptions(
    layer3.otherOptions ?? o.otherOptions ?? o.distractorMeanings,
    input.otherOptionTexts,
  )
  if (!otherOptions) return null

  const quizRaw = o.quiz ?? o.questions ?? o.practice
  if (!Array.isArray(quizRaw)) return null
  const quiz: VocabRelatedQuizQuestion[] = []
  quizRaw.forEach((item, idx) => {
    const q = parseQuizItem(item, input.kind, input.term, idx + 1)
    if (q) quiz.push(q)
  })
  if (quiz.length < 2) return null

  return {
    term: String(o.term ?? input.term).trim() || input.term,
    kind: input.kind,
    meaning,
    phonologyNotes,
    confusables,
    synonyms,
    antonyms,
    otherOptions,
    quiz: quiz.slice(0, 3),
  }
}

export function vocabRelatedQuizTypeLabel(t: VocabRelatedQuizType): string {
  return t === 'fill' ? '选词填空' : '词义理解'
}

/** 校验已缓存/内存中的学习包是否可直接使用 */
export function isVocabRelatedLearningPack(v: unknown): v is VocabRelatedLearningPack {
  if (!v || typeof v !== 'object') return false
  const o = v as VocabRelatedLearningPack
  if (!String(o.term ?? '').trim()) return false
  if (o.kind !== 'idiom' && o.kind !== 'word') return false
  if (!String(o.meaning ?? '').trim()) return false
  if (!Array.isArray(o.confusables) || o.confusables.length < 1) return false
  if (!Array.isArray(o.otherOptions) || o.otherOptions.length < 1) return false
  if (o.otherOptions.some((x) => /生成未返回/.test(x.meaning))) return false
  if (!Array.isArray(o.quiz) || o.quiz.length < 2) return false
  return o.quiz.every((q) => isUsableRelatedQuizMcq(q) || isPlayableFourChoiceMcq(q))
}

/** 用于缓存失效：题干/选项变化则视为新内容 */
export function vocabRelatedContentKey(row: Pick<
  VocabRelatedSourceRow,
  'term' | 'stem' | 'options' | 'correctIndex' | 'questionType'
>): string {
  return [
    row.term.trim(),
    row.stem.trim(),
    row.questionType,
    String(row.correctIndex),
    row.options.map((x) => String(x ?? '').trim()).join('\u001f'),
  ].join('\u001e')
}
