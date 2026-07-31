/** 重点题 · 字音字形「关联学习」：学习包与小测类型 */

import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'
import type { ChineseCharLiteracyQuestionType } from '@/utils/charLiteracyPractice'
import { charLiteracyQuestionTypeLabel } from '@/utils/charLiteracyPractice'

export type CharLiteracyRelatedSourceRow = {
  fingerprint: string
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  questionType: ChineseCharLiteracyQuestionType | string
}

export type CharLiteracyRelatedConfusable = {
  word: string
  /** 正确字音或规范字形 */
  correctFormOrReading: string
  howToDistinguish: string
}

export type CharLiteracyRelatedOtherOption = {
  text: string
  /** 该选项对应的正确字音/字形 */
  correctFormOrReading: string
  /** 易混点说明 */
  confusionPoint: string
}

export type CharLiteracyRelatedQuizType = 'pronunciation' | 'typo'

export type CharLiteracyRelatedQuizQuestion = {
  id: string
  questionType: CharLiteracyRelatedQuizType
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  focusTerm: string
}

export type CharLiteracyRelatedLearningPack = {
  term: string
  questionType: CharLiteracyRelatedQuizType
  /** 第一层 */
  meaning: string
  /** 当前词正确字音/字形要点 */
  phonologyOrForm: string
  /** 第二层：高频易混（字音字形，至少 1） */
  confusables: CharLiteracyRelatedConfusable[]
  /** 第三层：其他选项正确字音/字形与易混点 */
  otherOptions: CharLiteracyRelatedOtherOption[]
  quiz: CharLiteracyRelatedQuizQuestion[]
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function normalizeQuizType(raw: unknown, fallback: string): CharLiteracyRelatedQuizType {
  const t = String(raw ?? fallback).trim()
  if (t === 'typo' || t === '错别字' || t === '字形') return 'typo'
  return 'pronunciation'
}

function parseConfusables(raw: unknown): CharLiteracyRelatedConfusable[] {
  if (!Array.isArray(raw)) return []
  const out: CharLiteracyRelatedConfusable[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const word = String(o.word ?? o.term ?? '').trim()
    const correctFormOrReading = String(
      o.correctFormOrReading ?? o.correct ?? o.reading ?? o.form ?? o.meaning ?? '',
    ).trim()
    const howToDistinguish = String(
      o.howToDistinguish ?? o.distinguish ?? o.diff ?? o.note ?? '',
    ).trim()
    if (!word || !correctFormOrReading) continue
    out.push({
      word,
      correctFormOrReading,
      howToDistinguish: howToDistinguish || '注意读音或字形与目标词的差异。',
    })
  }
  return out
}

function parseOtherOptions(
  raw: unknown,
  fallbackTexts: string[],
): CharLiteracyRelatedOtherOption[] {
  if (Array.isArray(raw)) {
    const out: CharLiteracyRelatedOtherOption[] = []
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue
      const o = item as Record<string, unknown>
      const text = String(o.text ?? o.option ?? o.word ?? o.term ?? '').trim()
      const correctFormOrReading = String(
        o.correctFormOrReading ?? o.correct ?? o.reading ?? o.form ?? '',
      ).trim()
      const confusionPoint = String(
        o.confusionPoint ?? o.confusion ?? o.diff ?? o.note ?? o.meaning ?? '',
      ).trim()
      if (!text) continue
      out.push({
        text,
        correctFormOrReading: correctFormOrReading || '（见解析）',
        confusionPoint: confusionPoint || '注意与正确项在字音或字形上的差异。',
      })
    }
    if (out.length) return out
  }
  return fallbackTexts.map((text) => ({
    text,
    correctFormOrReading: '（生成未返回，可结合解析理解）',
    confusionPoint: '注意与正确项在字音或字形上的差异。',
  }))
}

function parseQuizItem(
  item: unknown,
  fallbackType: CharLiteracyRelatedQuizType,
  focusFallback: string,
  seq: number,
): CharLiteracyRelatedQuizQuestion | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const questionType = normalizeQuizType(o.questionType ?? o.type, fallbackType)
  const stem = String(o.stem ?? o.question ?? '').trim()
  const focusTerm = String(o.focusTerm ?? o.term ?? focusFallback).trim() || focusFallback
  const picked = extractMcqCorrectAndDistractors(o)
  if (!stem || !picked) return null
  const assembled = assembleFourChoiceMcq(picked.correct, picked.distractors, shuffleInPlace)
  if (!assembled) return null
  const q: CharLiteracyRelatedQuizQuestion = {
    id: `char-rel-quiz-${questionType}-${seq}-${Date.now()}`,
    questionType,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    explanation: String(o.explanation ?? o.explain ?? '').trim(),
    focusTerm,
  }
  // 关联学习小测放宽表面泄题校验，避免整包因字数蒙题规则被整段丢弃
  const norms = q.options.map((o) => String(o ?? '').trim().replace(/\s+/g, ''))
  const basicOk =
    norms.length === 4 &&
    norms.every(Boolean) &&
    new Set(norms).size === 4 &&
    q.correctIndex >= 0 &&
    q.correctIndex < 4
  if (!basicOk && !isPlayableFourChoiceMcq(q)) return null
  return q
}

export function parseCharLiteracyRelatedLearningPack(
  raw: unknown,
  input: {
    term: string
    questionType: string
    otherOptionTexts: string[]
  },
): CharLiteracyRelatedLearningPack | null {
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

  let phonologyOrForm = String(
    layer1.phonologyOrForm ??
      layer1.phonologyNotes ??
      layer1.formNotes ??
      layer1.reading ??
      o.phonologyOrForm ??
      '',
  ).trim()
  if (!phonologyOrForm) {
    // 模型偶发漏字段：用题干/term 兜底，避免整包作废
    phonologyOrForm = `注意「${input.term}」的规范读音与写法。`
  }

  let confusables = parseConfusables(
    layer2.confusables ?? layer2.confused ?? o.confusables ?? o.confusedWords,
  )
  if (!confusables.length) {
    const fallbackWord = input.otherOptionTexts[0]?.trim()
    if (fallbackWord) {
      confusables = [
        {
          word: fallbackWord,
          correctFormOrReading: '见规范读音/写法',
          howToDistinguish: '注意与目标词在字音或字形上的差异。',
        },
      ]
    } else {
      return null
    }
  }

  const otherOptions = parseOtherOptions(
    layer3.otherOptions ?? o.otherOptions ?? o.distractorNotes,
    input.otherOptionTexts,
  )

  const quizRaw = o.quiz ?? o.questions ?? o.practice
  if (!Array.isArray(quizRaw)) return null
  const baseType = normalizeQuizType(o.questionType ?? input.questionType, 'pronunciation')
  const quiz: CharLiteracyRelatedQuizQuestion[] = []
  quizRaw.forEach((item, idx) => {
    const q = parseQuizItem(item, baseType, input.term, idx + 1)
    if (q) quiz.push(q)
  })
  if (quiz.length < 2) return null

  return {
    term: String(o.term ?? input.term).trim() || input.term,
    questionType: baseType,
    meaning,
    phonologyOrForm,
    confusables,
    otherOptions,
    quiz: quiz.slice(0, 3),
  }
}

export function isCharLiteracyRelatedLearningPack(
  v: unknown,
): v is CharLiteracyRelatedLearningPack {
  if (!v || typeof v !== 'object') return false
  const o = v as CharLiteracyRelatedLearningPack
  if (!String(o.term ?? '').trim()) return false
  if (!String(o.meaning ?? '').trim()) return false
  if (!String(o.phonologyOrForm ?? '').trim()) return false
  if (!Array.isArray(o.confusables) || o.confusables.length < 1) return false
  if (!Array.isArray(o.quiz) || o.quiz.length < 2) return false
  return o.quiz.every((q) => {
    const norms = q.options.map((x) => String(x ?? '').trim().replace(/\s+/g, ''))
    const basicOk =
      norms.length === 4 &&
      norms.every(Boolean) &&
      new Set(norms).size === 4 &&
      q.correctIndex >= 0 &&
      q.correctIndex < 4
    return basicOk || isPlayableFourChoiceMcq(q)
  })
}

export function charLiteracyRelatedContentKey(
  row: Pick<
    CharLiteracyRelatedSourceRow,
    'term' | 'stem' | 'options' | 'correctIndex' | 'questionType'
  >,
): string {
  return [
    row.term.trim(),
    row.stem.trim(),
    String(row.questionType),
    String(row.correctIndex),
    row.options.map((x) => String(x ?? '').trim()).join('\u001f'),
  ].join('\u001e')
}

export function charLiteracyRelatedQuizTypeLabel(t: CharLiteracyRelatedQuizType): string {
  return charLiteracyQuestionTypeLabel(t)
}
