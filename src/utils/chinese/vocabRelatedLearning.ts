/** 重点题 · 成语/词语「关联学习」：学习包与小测类型 */

import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chinese/chineseMcqAiFields'

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

/** 第四层 · 快速识记：使用场景强调点 + 短例句（不含近/反义词） */
export type VocabRelatedQuickMem = {
  word: string
  /** 简短记忆强调点，如「形势发展顺利、不可逆的过程」 */
  cue: string
  /** 简短例句，可多条 */
  examples: string[]
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
  /**
   * 第四层 · 快速识记：目标词 + 易混 + 其他选项（不含近/反义词）
   * 每条：场景强调点 + 短例句
   */
  quickMem: VocabRelatedQuickMem[]
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
    let example = String(
      o.example ?? o.exampleSentence ?? o.sentence ?? o.例句 ?? '',
    ).trim()
    const howToDistinguish = String(
      o.howToDistinguish ?? o.distinguish ?? o.diff ?? o.note ?? '',
    ).trim()
    if (!word || !meaning) continue
    if (!example) example = `使用「${word}」时要注意语境与搭配。`
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

function asExampleList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x ?? '').trim()).filter(Boolean)
  }
  const s = String(raw ?? '').trim()
  if (!s) return []
  // 兼容单句或用分号/换行分隔
  return s
    .split(/[\n；;]+/)
    .map((x) => x.trim())
    .filter(Boolean)
}

/**
 * 解析第四层快速识记。至少须含目标词一条；覆盖易混与其他选项优先。
 * 返回 null 表示 AI 未给可用条目（调用方可用 synthesizeQuickMem 兜底）。
 */
function parseQuickMem(
  raw: unknown,
  requiredWords: string[],
): VocabRelatedQuickMem[] | null {
  if (!Array.isArray(raw) || !raw.length) return null
  const byWord = new Map<string, VocabRelatedQuickMem>()
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const word = String(o.word ?? o.term ?? o.text ?? '').trim()
    const cue = String(
      o.cue ?? o.emphasis ?? o.point ?? o.场景 ?? o.强调 ?? o.memoryPoint ?? o.meaning ?? '',
    ).trim()
    const examples = asExampleList(
      o.examples ?? o.example ?? o.例句 ?? o.scenes ?? o.usageExamples,
    )
    if (!word || !cue || !examples.length) continue
    const key = normalizeVocabTermKey(word)
    if (!key || byWord.has(key)) continue
    byWord.set(key, { word, cue, examples: examples.slice(0, 4) })
  }

  const out: VocabRelatedQuickMem[] = []
  const seen = new Set<string>()
  for (const w of requiredWords) {
    const k = normalizeVocabTermKey(w)
    if (!k || seen.has(k)) continue
    const hit = byWord.get(k)
    if (!hit) {
      // 目标词缺失则整层失败；其余词缺则跳过（不整包作废）
      if (out.length === 0) return null
      continue
    }
    seen.add(k)
    out.push(hit)
  }
  if (!out.length) return null
  const targetKey = normalizeVocabTermKey(requiredWords[0] ?? '')
  if (targetKey && !out.some((x) => normalizeVocabTermKey(x.word) === targetKey)) {
    return null
  }
  for (const [k, v] of byWord) {
    if (seen.has(k)) continue
    seen.add(k)
    out.push(v)
  }
  return out
}

/** 用已有释义/例句合成第四层，避免 AI 漏 layer4 导致整包失败 */
function synthesizeQuickMem(input: {
  term: string
  meaning: string
  example: string
  confusables: VocabRelatedConfusable[]
  otherOptions: VocabRelatedOtherOption[]
  kind: VocabRelatedKind
}): VocabRelatedQuickMem[] {
  const out: VocabRelatedQuickMem[] = []
  const seen = new Set<string>()
  const push = (word: string, cue: string, examples: string[]) => {
    const w = word.trim()
    const c = cue.trim()
    const ex = examples.map((x) => x.trim()).filter(Boolean)
    if (!w || !c || !ex.length) return
    const k = normalizeVocabTermKey(w)
    if (!k || seen.has(k)) return
    seen.add(k)
    out.push({ word: w, cue: c.slice(0, 40), examples: ex.slice(0, 3) })
  }

  push(
    input.term,
    input.meaning.length > 36 ? `${input.meaning.slice(0, 34)}…` : input.meaning,
    [input.example],
  )
  for (const c of input.confusables) {
    push(
      c.word,
      c.meaning.length > 36 ? `${c.meaning.slice(0, 34)}…` : c.meaning,
      [c.example],
    )
  }
  for (const o of input.otherOptions) {
    if (!isVocabRelatedFillOptionSurface(o.text, input.kind)) continue
    const cue =
      o.meaning.length > 36 ? `${o.meaning.slice(0, 34)}…` : o.meaning || '注意语境搭配'
    push(o.text, cue, [`使用「${o.text}」时要注意对象与色彩。`])
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
    // 长释义选项：允许包含关系 / 去标点后近似匹配（AI 常微调措辞）
    if (!hit) {
      const norm = t.replace(/\s+/g, '').replace(/[，。；、！？：:""''“”‘’（）()【】《》]/g, '')
      let best: { meaning: string; sentiment: VocabSentiment; sentimentNote: string } | null =
        null
      let bestScore = 0
      for (const [k, v] of byText) {
        const kn = k.replace(/\s+/g, '').replace(/[，。；、！？：:""''“”‘’（）()【】《》]/g, '')
        if (!kn) continue
        if (kn === norm || kn.includes(norm) || norm.includes(kn)) {
          const score = Math.min(kn.length, norm.length) / Math.max(kn.length, norm.length)
          if (score > bestScore) {
            bestScore = score
            best = v
          }
        }
      }
      if (best && bestScore >= 0.55) hit = best
    }
    // 仍找不到时：若 AI 给了足够条目，按序号兜底对齐（避免整包因措辞差失败）
    if (!hit && byText.size >= fallback.length) {
      const vals = [...byText.values()]
      const idx = out.length
      if (vals[idx]) hit = vals[idx]!
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

/** 选词填空选项是否像「词/成语」而非白话长句 */
export function isVocabRelatedFillOptionSurface(
  text: string,
  kind: VocabRelatedKind,
): boolean {
  const t = String(text ?? '').trim()
  if (!t) return false
  if (/[，。；、！？：:""''“”‘’（）()\[\]【】《》]/.test(t)) return false
  const maxLen = kind === 'idiom' ? 8 : 10
  if ([...t].length > maxLen) return false
  // 常见释义/白话句痕迹
  if (/看得出|不一样|指的是|意思是|表示|形容|用来|可以|不能|根本/.test(t)) return false
  if (/的{2,}|得{2,}/.test(t)) return false
  return true
}

/** 学习材料中出现过的词面（含反义词；供展示/材料用） */
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

/**
 * 选词填空专用词库：目标词 + 易混 + 近义 + 其他选项。
 * 不含反义词；并过滤掉不像词面的长句。
 */
export function collectVocabRelatedFillOptionBank(
  pack: Pick<
    VocabRelatedLearningPack,
    'term' | 'kind' | 'confusables' | 'synonyms' | 'otherOptions'
  >,
): string[] {
  const kind = pack.kind === 'idiom' ? 'idiom' : 'word'
  const seen = new Set<string>()
  const out: string[] = []
  const push = (raw: string) => {
    const t = String(raw ?? '').trim()
    if (!t || !isVocabRelatedFillOptionSurface(t, kind)) return
    const k = normalizeVocabTermKey(t)
    if (!k || seen.has(k)) return
    seen.add(k)
    out.push(t)
  }
  push(pack.term)
  for (const c of pack.confusables ?? []) push(c.word)
  for (const s of pack.synonyms ?? []) push(s)
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
  fillOptionBank?: string[],
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
  if (questionType === 'fill') {
    // 禁止白话长句；选项须是短词/成语
    if (assembled.options.some((opt) => !isVocabRelatedFillOptionSurface(opt, kind))) {
      return null
    }
    // 四个选项必须全部来自学习词库（不含反义词）
    if (
      fillOptionBank &&
      !fillOptionsAllFromStudyTerms(assembled.options, fillOptionBank)
    ) {
      return null
    }
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

/** 小测是否过度集中考目标词（有可轮换词时，禁止全套都考同一个目标词） */
export function quizFocusesTooMuchOnTarget(
  quiz: VocabRelatedQuizQuestion[],
  targetTerm: string,
  fillOptionBank?: string[],
): boolean {
  const target = normalizeVocabTermKey(targetTerm)
  if (!target || quiz.length < 2) return false
  const altCount = (fillOptionBank ?? []).filter(
    (t) => normalizeVocabTermKey(t) && normalizeVocabTermKey(t) !== target,
  ).length
  // 词库里几乎只有目标词时不强求轮换
  if (altCount < 1) return false

  const focusKeys = quiz.map((q) => {
    if (q.questionType === 'fill') {
      const correct = q.options[q.correctIndex] ?? ''
      return normalizeVocabTermKey(correct) || normalizeVocabTermKey(q.focusTerm)
    }
    return normalizeVocabTermKey(q.focusTerm)
  })
  const nonTarget = focusKeys.filter((k) => k && k !== target).length
  return nonTarget === 0
}

/** 仅解析小测数组（用于答错/重开时重出题） */
export function parseVocabRelatedQuizList(
  raw: unknown,
  input: {
    kind: VocabRelatedKind
    term: string
    /** 选词填空选项池（不含反义词）；传入后 fill 题会校验 */
    fillOptionBank?: string[]
    /** @deprecated 用 fillOptionBank */
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
  const bank = input.fillOptionBank ?? input.studyTerms
  const quiz: VocabRelatedQuizQuestion[] = []
  list.forEach((item, idx) => {
    const q = parseQuizItem(item, input.kind, input.term, idx + 1, bank)
    if (q) quiz.push(q)
  })
  if (quiz.length < 2) return null
  const sliced = quiz.slice(0, 3)
  if (quizFocusesTooMuchOnTarget(sliced, input.term, bank)) return null
  return sliced
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
  const layer4 =
    o.layer4 && typeof o.layer4 === 'object' ? (o.layer4 as Record<string, unknown>) : o

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

  const term = String(o.term ?? input.term).trim() || input.term
  // 快速识记覆盖：目标词 + 易混 + 像词面的其他选项（不含近/反义词；选释义题的长释义不入列）
  const quickMemWords = [
    term,
    ...confusables.map((c) => c.word),
    ...otherOptions
      .map((x) => x.text)
      .filter((t) => isVocabRelatedFillOptionSurface(t, input.kind)),
  ]
  let quickMem = parseQuickMem(
    layer4.quickMem ?? layer4.items ?? o.quickMem ?? o.quickMemorization,
    quickMemWords,
  )
  if (!quickMem?.length) {
    quickMem = synthesizeQuickMem({
      term,
      meaning,
      example,
      confusables,
      otherOptions,
      kind: input.kind,
    })
  }
  if (!quickMem.length) return null

  const fillOptionBank = collectVocabRelatedFillOptionBank({
    term,
    kind: input.kind,
    confusables,
    synonyms,
    otherOptions,
  })

  const quizRaw = o.quiz ?? o.questions ?? o.practice
  const quiz: VocabRelatedQuizQuestion[] = []
  if (Array.isArray(quizRaw)) {
    quizRaw.forEach((item, idx) => {
      const q = parseQuizItem(item, input.kind, input.term, idx + 1, fillOptionBank)
      if (q) quiz.push(q)
    })
  }
  // 小测不足 2 题：保留材料，交由调用方补小测（勿整包作废）
  const quizSliced = quiz.length >= 2 ? quiz.slice(0, 3) : []
  const baseMaterials = {
    term,
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
    quickMem,
  } as const
  if (
    quizSliced.length >= 2 &&
    quizFocusesTooMuchOnTarget(quizSliced, term, fillOptionBank)
  ) {
    return {
      ...baseMaterials,
      quiz: [],
    }
  }

  return {
    ...baseMaterials,
    quiz: quizSliced,
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
  if (!Array.isArray(o.quickMem) || o.quickMem.length < 1) return false
  if (
    o.quickMem.some(
      (q) =>
        !String(q.word ?? '').trim() ||
        !String(q.cue ?? '').trim() ||
        !Array.isArray(q.examples) ||
        q.examples.every((e) => !String(e ?? '').trim()),
    )
  ) {
    return false
  }
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
