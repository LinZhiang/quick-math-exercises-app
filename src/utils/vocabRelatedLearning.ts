/** 重点题 · 成语/词语「关联学习」：学习包与小测类型 */

import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'

export type VocabRelatedKind = 'idiom' | 'word'

/** 感情色彩：褒义 / 贬义 / 中性 / 分情况（视语境） */
export type VocabSentiment = '褒义' | '贬义' | '中性' | '分情况'

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
  /** 例句（须含该词） */
  example: string
  /** 感情色彩 */
  sentiment: VocabSentiment
  /** 分情况时的说明；其他情况可空 */
  sentimentNote: string
  howToDistinguish: string
}

export type VocabRelatedOtherOption = {
  text: string
  meaning: string
  sentiment: VocabSentiment
  sentimentNote: string
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
  /** 例句（须含目标词） */
  example: string
  /** 感情色彩：褒义 / 贬义 / 中性 / 分情况 */
  sentiment: VocabSentiment
  /** 分情况时须说明；其余可空 */
  sentimentNote: string
  phonologyNotes: string
  /** 第二层：高频易混（至少 1） */
  confusables: VocabRelatedConfusable[]
  /** 第三层 */
  synonyms: string[]
  antonyms: string[]
  otherOptions: VocabRelatedOtherOption[]
  /** 学后小测 2～3 题（可空：表示待重新生成） */
  quiz: VocabRelatedQuizQuestion[]
}

export function vocabSentimentLabel(s: VocabSentiment): string {
  return s
}

function escapeVocabHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 例句展示：转义 HTML，并把该词（含 AI 可能加的 **词**）加粗。
 */
export function formatVocabExampleHtml(example: string, word: string): string {
  const raw = String(example ?? '').trim()
  if (!raw) return ''
  const term = String(word ?? '').trim()
  // 去掉模型可能自带的 markdown 加粗，统一由我们加粗
  const cleaned = raw.replace(/\*\*([^*]+)\*\*/g, '$1')
  if (!term) return escapeVocabHtml(cleaned)
  const escaped = escapeVocabHtml(cleaned)
  const needle = escapeVocabHtml(term)
  if (!needle) return escaped
  const parts = escaped.split(needle)
  if (parts.length === 1) return escaped
  return parts.join(`<strong class="vr__ex-term">${needle}</strong>`)
}

export function parseVocabSentiment(raw: unknown): VocabSentiment {
  const s = String(raw ?? '').trim()
  if (!s) return '中性'
  if (/分情况|视语境|依语境|可褒可贬|两用|褒贬两用/.test(s)) return '分情况'
  if (/褒/.test(s) && !/贬/.test(s)) return '褒义'
  if (/贬/.test(s) && !/褒/.test(s)) return '贬义'
  if (/中性/.test(s)) return '中性'
  if (/褒/.test(s) && /贬/.test(s)) return '分情况'
  return '中性'
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
    const example = String(
      o.example ?? o.exampleSentence ?? o.sentence ?? o.例句 ?? '',
    ).trim()
    const howToDistinguish = String(
      o.howToDistinguish ?? o.distinguish ?? o.diff ?? o.note ?? '',
    ).trim()
    if (!word || !meaning || !example) continue
    const sentiment = parseVocabSentiment(
      o.sentiment ?? o.valence ?? o.connotation ?? o.感情色彩 ?? o.色彩,
    )
    const sentimentNote = String(
      o.sentimentNote ?? o.valenceNote ?? o.色彩说明 ?? o.分情况说明 ?? '',
    ).trim()
    out.push({
      word,
      meaning,
      example,
      sentiment,
      sentimentNote: sentiment === '分情况' ? sentimentNote || '视具体语境而定。' : sentimentNote,
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
  const byText = new Map<
    string,
    { meaning: string; sentiment: VocabSentiment; sentimentNote: string }
  >()

  const absorb = (
    text: string,
    meaning: string,
    sentiment: VocabSentiment,
    sentimentNote: string,
  ) => {
    const t = text.trim()
    const m = meaning.trim()
    if (!t || !m) return
    if (!byText.has(t)) {
      byText.set(t, {
        meaning: m,
        sentiment,
        sentimentNote:
          sentiment === '分情况' ? sentimentNote || '视具体语境而定。' : sentimentNote,
      })
    }
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string') {
        const s = item.trim()
        const m = s.match(/^(.+?)[：:：\s]+(.+)$/)
        if (m) absorb(m[1]!, m[2]!, '中性', '')
        continue
      }
      if (!item || typeof item !== 'object') continue
      const o = item as Record<string, unknown>
      absorb(
        pickTextField(o),
        pickMeaningField(o),
        parseVocabSentiment(o.sentiment ?? o.valence ?? o.connotation ?? o.感情色彩 ?? o.色彩),
        String(o.sentimentNote ?? o.valenceNote ?? o.色彩说明 ?? o.分情况说明 ?? '').trim(),
      )
    }
  } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      absorb(k, String(v ?? '').trim(), '中性', '')
    }
  }

  if (!fallback.length) {
    return [...byText.entries()].map(([text, v]) => ({ text, ...v }))
  }

  const out: VocabRelatedOtherOption[] = []
  for (const text of fallback) {
    const t = text.trim()
    if (!t) continue
    let hit = byText.get(t)
    if (!hit) {
      const norm = t.replace(/\s+/g, '')
      for (const [k, v] of byText) {
        if (k.replace(/\s+/g, '') === norm) {
          hit = v
          break
        }
      }
    }
    if (!hit) return null
    out.push({ text: t, ...hit })
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

function normalizeVocabTermKey(s: string): string {
  return String(s ?? '').trim().replace(/\s+/g, '')
}

/** 学习材料中出现过的词面（目标词、易混、近反义、其他选项） */
export function collectVocabRelatedStudyTerms(
  pack: Pick<
    VocabRelatedLearningPack,
    'term' | 'confusables' | 'synonyms' | 'antonyms' | 'otherOptions'
  >,
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  const push = (raw: string) => {
    const t = String(raw ?? '').trim()
    if (!t) return
    const k = normalizeVocabTermKey(t)
    if (!k || seen.has(k)) return
    seen.add(k)
    out.push(t)
  }
  push(pack.term)
  for (const c of pack.confusables ?? []) push(c.word)
  for (const s of pack.synonyms ?? []) push(s)
  for (const a of pack.antonyms ?? []) push(a)
  for (const o of pack.otherOptions ?? []) push(o.text)
  return out
}

function fillOptionsAllFromStudyTerms(
  options: string[],
  studyTerms: Iterable<string>,
): boolean {
  const allowed = new Set(
    [...studyTerms].map(normalizeVocabTermKey).filter(Boolean),
  )
  if (allowed.size < 4) return false
  return options.every((opt) => allowed.has(normalizeVocabTermKey(opt)))
}

function parseQuizItem(
  item: unknown,
  kind: VocabRelatedKind,
  focusFallback: string,
  seq: number,
  studyTerms?: string[],
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
  // 选词填空：四个选项必须全部来自本词学习材料中出现过的词
  if (
    questionType === 'fill' &&
    studyTerms &&
    !fillOptionsAllFromStudyTerms(assembled.options, studyTerms)
  ) {
    return null
  }
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

/** 仅解析小测数组（用于答错/重开时重出题） */
export function parseVocabRelatedQuizList(
  raw: unknown,
  input: {
    kind: VocabRelatedKind
    term: string
    /** 选词填空选项池；传入后 fill 题会校验 */
    studyTerms?: string[]
  },
): VocabRelatedQuizQuestion[] | null {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? ((raw as Record<string, unknown>).quiz ??
        (raw as Record<string, unknown>).questions ??
        (raw as Record<string, unknown>).practice)
      : null
  if (!Array.isArray(list)) return null
  const quiz: VocabRelatedQuizQuestion[] = []
  list.forEach((item, idx) => {
    const q = parseQuizItem(item, input.kind, input.term, idx + 1, input.studyTerms)
    if (q) quiz.push(q)
  })
  if (quiz.length < 2) return null
  return quiz.slice(0, 3)
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

  const example = String(
    layer1.example ??
      layer1.exampleSentence ??
      layer1.sentence ??
      layer1.例句 ??
      o.example ??
      o.例句 ??
      '',
  ).trim()
  if (!example) return null

  const sentiment = parseVocabSentiment(
    layer1.sentiment ??
      layer1.valence ??
      layer1.connotation ??
      layer1.感情色彩 ??
      o.sentiment ??
      o.感情色彩,
  )
  const sentimentNote = String(
    layer1.sentimentNote ??
      layer1.valenceNote ??
      layer1.色彩说明 ??
      layer1.分情况说明 ??
      o.sentimentNote ??
      '',
  ).trim()

  const phonologyNotes = String(
    layer1.phonologyNotes ?? layer1.phonetics ?? layer1.formNotes ?? o.phonologyNotes ?? '',
  ).trim()

  const confusables = parseConfusables(
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

  const studyTerms = collectVocabRelatedStudyTerms({
    term: String(o.term ?? input.term).trim() || input.term,
    confusables,
    synonyms,
    antonyms,
    otherOptions,
  })

  const quizRaw = o.quiz ?? o.questions ?? o.practice
  const quiz: VocabRelatedQuizQuestion[] = []
  if (Array.isArray(quizRaw)) {
    quizRaw.forEach((item, idx) => {
      const q = parseQuizItem(item, input.kind, input.term, idx + 1, studyTerms)
      if (q) quiz.push(q)
    })
  }
  // 首次整包生成须带小测；仅材料缓存可读时可为空，由调用方再生成小测
  if (quiz.length > 0 && quiz.length < 2) return null

  return {
    term: String(o.term ?? input.term).trim() || input.term,
    kind: input.kind,
    meaning,
    example,
    sentiment,
    sentimentNote: sentiment === '分情况' ? sentimentNote || '视具体语境而定。' : sentimentNote,
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

/** 学习材料是否可用（小测可空，答错/重开时另生成） */
export function isVocabRelatedMaterialsPack(v: unknown): v is VocabRelatedLearningPack {
  if (!v || typeof v !== 'object') return false
  const o = v as VocabRelatedLearningPack
  if (!String(o.term ?? '').trim()) return false
  if (o.kind !== 'idiom' && o.kind !== 'word') return false
  if (!String(o.meaning ?? '').trim()) return false
  if (!String(o.example ?? '').trim()) return false
  if (!o.sentiment) return false
  if (!Array.isArray(o.confusables) || o.confusables.length < 1) return false
  if (o.confusables.some((c) => !String(c.example ?? '').trim())) return false
  if (!Array.isArray(o.otherOptions) || o.otherOptions.length < 1) return false
  if (o.otherOptions.some((x) => /生成未返回/.test(x.meaning))) return false
  return true
}

/** 校验已缓存/内存中的完整学习包（含小测） */
export function isVocabRelatedLearningPack(v: unknown): v is VocabRelatedLearningPack {
  if (!isVocabRelatedMaterialsPack(v)) return false
  const o = v as VocabRelatedLearningPack
  if (!Array.isArray(o.quiz) || o.quiz.length < 2) return false
  return o.quiz.every((q) => isUsableRelatedQuizMcq(q) || isPlayableFourChoiceMcq(q))
}

/** 取出缓存材料时清空小测，强制下次作答重新出题 */
export function stripVocabRelatedQuiz(pack: VocabRelatedLearningPack): VocabRelatedLearningPack {
  return { ...pack, quiz: [] }
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
