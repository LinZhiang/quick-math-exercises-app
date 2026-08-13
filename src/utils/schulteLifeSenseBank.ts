/**
 * 舒尔特·生活常识：考点对齐快判「生活常识」题库。
 * 将原一问一答改写为陈述句后出示；释义用原 explanation。
 * 字数（仅汉字、且字字不同）：简单 ≤13；普通 ≤17；复杂 ≥13。
 */

import { LIFE_SENSE_BANK } from '@/utils/lifeSenseBank.generated'
import type { LifeSenseBankItem } from '@/utils/lifeSenseBankTypes'
import { resolveFactExplanation } from '@/utils/factExplanationOverrides'

const HAN_RE = /[\u4e00-\u9fff]/

export type SchulteLifeDifficulty = 'easy' | 'normal' | 'hard'

/** 简单题识记字数上限（含点选字） */
export const SCHULTE_MEMO_EASY_MAX_CHARS = 13
/** 普通题识记字数上限 */
export const SCHULTE_MEMO_NORMAL_MAX_CHARS = 17
/** 高难/复杂题识记字数下限 */
export const SCHULTE_MEMO_HARD_MIN_CHARS = 13

export type SchulteLifeSenseItem = {
  key: string
  difficulty: SchulteLifeDifficulty
  /** 陈述句展示文案 */
  display: string
  /** 点选字序（仅汉字） */
  chars: string[]
  /** 原题释义 */
  meaning: string
  stem: string
  correct: string
  /** 去重身份：题干+答案 */
  knowledgeKey: string
}

function extractHan(text: string): string[] {
  return Array.from(text.normalize('NFC')).filter((c) => HAN_RE.test(c))
}

function normalizeKnowledgeKey(stem: string, correct: string): string {
  return `${stem}|${correct}`.trim().replace(/\s+/g, '')
}

function ensurePeriod(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  return /[。！？；]$/.test(t) ? t : `${t}。`
}

/** 去掉引号等标点（不影响汉字序列） */
function stripNoise(s: string): string {
  return s.replace(/[“”"‘’《》〈〉（）()【】\[\]、，,：:；;]/g, '')
}

function looksLikeQuestionResidue(text: string): boolean {
  return /什么|哪[个些里]|几[个月]|如何|怎样|怎么样|为何|为什么|是否/.test(text)
}

/**
 * 生成若干陈述句候选（由短到长），不另造考点。
 * 供按难度字数带挑选。
 */
export function lifeSenseStatementCandidates(stem: string, correct: string): string[] {
  let s = stem.trim().replace(/[？?]+$/u, '').trim()
  const a = correct.trim()
  if (!s || !a) return []

  const out: string[] = []
  const push = (x: string) => {
    const t = x.trim()
    if (!t) return
    if (!out.includes(t)) out.push(t)
  }

  const mWhatIs = s.match(/^什么是(.+)$/)
  if (mWhatIs) push(`${mWhatIs[1]}是${a}`)

  if (/是什么$/.test(s)) push(s.replace(/是什么$/, `是${a}`))
  if (/指的是什么$|指什么$/.test(s)) push(s.replace(/指的是什么$|指什么$/, `指${a}`))
  if (/怎样$|如何$|怎么样$/.test(s)) push(s.replace(/怎样$|如何$|怎么样$/, a))
  if (/有几个/.test(s)) push(s.replace(/有几个/, `有${a}个`))
  if (/有多少个/.test(s)) push(s.replace(/有多少个/, `有${a}个`))
  if (/有多少/.test(s)) push(s.replace(/有多少/, `有${a}`))
  if (/属于哪个/.test(s)) push(s.replace(/属于哪个.*$/, `属于${a}`))
  if (/来自哪里|来自何处/.test(s)) push(s.replace(/来自哪里|来自何处/, `来自${a}`))
  if (/什么时候/.test(s)) push(s.replace(/什么时候/, a))
  if (/什么季节/.test(s)) push(s.replace(/什么季节/, a))
  if (/哪个季节/.test(s)) push(s.replace(/哪个季节/, a))
  if (/哪里/.test(s)) push(s.replace(/哪里/, a))
  if (/哪[个些]/.test(s)) push(s.replace(/哪[个些]/, a))
  if (/几月/.test(s)) push(s.replace(/几月/, a.includes('月') ? a : `${a}月`))
  if (/为何|为什么/.test(s)) {
    push(s.replace(/为何|为什么/, '').replace(/[？?]/g, '').trim() + a)
  }
  if (/叫什么$|称为什么$/.test(s)) push(s.replace(/叫什么$|称为什么$/, `叫${a}`))
  if (/又称什么$|别称是什么$/.test(s)) push(s.replace(/又称什么$|别称是什么$/, `又称${a}`))
  if (/主要包括什么$|包括什么$/.test(s)) push(s.replace(/主要包括什么$|包括什么$/, `包括${a}`))
  if (/常在$|位于$|在于$|依据$|根据$|用于$|用来$/.test(s)) push(`${s}${a}`)

  // 完整拼接仅作兜底（若仍含疑问词，后面评分会降权）
  push(`${s}${a}`)

  // 压缩：去掉常见赘词后再拼
  const slim = s
    .replace(/一般|通常|常常|主要|常见|往往|大约|左右/g, '')
    .replace(/的时候/g, '时')
    .trim()
  if (slim && slim !== s) {
    if (/有几个/.test(slim)) push(slim.replace(/有几个/, `有${a}个`))
    if (/什么时候/.test(slim)) push(slim.replace(/什么时候/, a))
    if (/什么季节/.test(slim)) push(slim.replace(/什么季节/, a))
    if (/是什么$/.test(slim)) push(slim.replace(/是什么$/, `是${a}`))
    push(`${slim}${a}`)
  }

  // 极短：主题 + 是 + 答案（主题需去掉疑问结构）
  const topic = s
    .replace(/^什么是/, '')
    .replace(/是什么$/, '')
    .replace(/指的是什么$|指什么$/, '')
    .replace(/又称什么$|别称是什么$/, '')
    .replace(/叫什么$|称为什么$/, '')
    .replace(/有几个/, '')
    .replace(/有多少个?/, '')
    .replace(/什么时候/, '')
    .replace(/什么季节|哪个季节/, '')
    .replace(/哪里|哪[个些]/g, '')
    .replace(/[？?]/g, '')
    .trim()
  if (topic && topic.length >= 2 && !looksLikeQuestionResidue(topic)) {
    push(`${topic}是${a}`)
    push(`${stripNoise(topic)}是${a}`)
  }

  // 去噪版本
  for (const c of [...out]) {
    const n = stripNoise(c)
    if (n !== c) push(n)
  }

  return out
}

/** 将生活常识问答改写为陈述句（默认取较自然的一条） */
export function lifeSenseQaToStatement(stem: string, correct: string): string {
  const cands = lifeSenseStatementCandidates(stem, correct)
  return cands[0] ?? `${stem.trim()}${correct.trim()}`
}

export function schulteMemoLengthOk(difficulty: SchulteLifeDifficulty, charCount: number): boolean {
  if (!Number.isFinite(charCount) || charCount < 4) return false
  if (charCount >= 35) return false
  if (difficulty === 'easy') return charCount <= SCHULTE_MEMO_EASY_MAX_CHARS
  if (difficulty === 'normal') return charCount <= SCHULTE_MEMO_NORMAL_MAX_CHARS
  return charCount >= SCHULTE_MEMO_HARD_MIN_CHARS
}

function scoreCandidate(difficulty: SchulteLifeDifficulty, display: string, n: number): number {
  // 越大越好；残留疑问词大幅降权
  let score = 0
  if (looksLikeQuestionResidue(display)) score -= 500
  if (/是是|在是|常在是/.test(display)) score -= 300
  if (difficulty === 'easy') {
    if (n > SCHULTE_MEMO_EASY_MAX_CHARS) return -1000
    score += n * 10
    return score
  }
  if (difficulty === 'normal') {
    if (n > SCHULTE_MEMO_NORMAL_MAX_CHARS) return -1000
    score += n * 10
    return score
  }
  if (n < SCHULTE_MEMO_HARD_MIN_CHARS) return -1000
  score += Math.min(n, 28) * 10
  return score
}

function buildItem(it: LifeSenseBankItem): SchulteLifeSenseItem | null {
  const cands = lifeSenseStatementCandidates(it.stem, it.correct)
  let best: { display: string; chars: string[]; score: number } | null = null

  for (const raw of cands) {
    const display = ensurePeriod(raw)
    const chars = extractHan(display)
    if (chars.length < 4) continue
    if (new Set(chars).size !== chars.length) continue
    if (chars.length >= 35) continue
    if (!schulteMemoLengthOk(it.difficulty, chars.length)) continue
    const score = scoreCandidate(it.difficulty, display, chars.length)
    if (!best || score > best.score) {
      best = { display, chars, score }
    }
  }

  // 仍选到带疑问残留的，宁可弃题
  if (!best || looksLikeQuestionResidue(best.display)) return null

  return {
    key: `life-${it.key}`,
    difficulty: it.difficulty,
    display: best.display,
    chars: best.chars,
    meaning: resolveFactExplanation('life-sense', it.key, it.explanation),
    stem: it.stem,
    correct: it.correct,
    knowledgeKey: normalizeKnowledgeKey(it.stem, it.correct),
  }
}

function buildBank(): SchulteLifeSenseItem[] {
  const out: SchulteLifeSenseItem[] = []
  const seenKnowledge = new Set<string>()
  const seenChars = new Set<string>()
  for (const it of LIFE_SENSE_BANK) {
    const item = buildItem(it)
    if (!item) continue
    if (seenKnowledge.has(item.knowledgeKey)) continue
    const fp = `${item.difficulty}|${item.chars.join('')}`
    if (seenChars.has(fp)) continue
    seenKnowledge.add(item.knowledgeKey)
    seenChars.add(fp)
    out.push(item)
  }
  return out
}

export const SCHULTE_LIFE_SENSE_BANK: SchulteLifeSenseItem[] = buildBank()

export function schulteLifeSensePool(difficulty: SchulteLifeDifficulty): SchulteLifeSenseItem[] {
  return SCHULTE_LIFE_SENSE_BANK.filter((it) => it.difficulty === difficulty)
}

export const SCHULTE_LIFE_SENSE_BANK_COUNTS = {
  easy: schulteLifeSensePool('easy').length,
  normal: schulteLifeSensePool('normal').length,
  hard: schulteLifeSensePool('hard').length,
  total: SCHULTE_LIFE_SENSE_BANK.length,
} as const
