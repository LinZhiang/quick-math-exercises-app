/**
 * 舒尔特·生活常识：考点对齐快判「生活常识」题库。
 * 将原一问一答改写为陈述句后出示；释义用原 explanation。
 */

import { LIFE_SENSE_BANK } from '@/utils/lifeSenseBank.generated'
import type { LifeSenseBankItem } from '@/utils/lifeSenseBankTypes'
import { resolveFactExplanation } from '@/utils/factExplanationOverrides'

const HAN_RE = /[\u4e00-\u9fff]/

export type SchulteLifeDifficulty = 'easy' | 'normal' | 'hard'

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
}

function extractHan(text: string): string[] {
  return Array.from(text.normalize('NFC')).filter((c) => HAN_RE.test(c))
}

/** 将生活常识问答改写为陈述句（不另造考点） */
export function lifeSenseQaToStatement(stem: string, correct: string): string {
  let s = stem.trim().replace(/[？?]+$/u, '').trim()
  const a = correct.trim()
  if (!s || !a) return `${s}${a}`

  const mWhatIs = s.match(/^什么是(.+)$/)
  if (mWhatIs) return `${mWhatIs[1]}是${a}`

  if (/是什么$/.test(s)) return s.replace(/是什么$/, `是${a}`)
  if (/指的是什么$|指什么$/.test(s)) return s.replace(/指的是什么$|指什么$/, `指${a}`)
  if (/怎样$|如何$|怎么样$/.test(s)) return s.replace(/怎样$|如何$|怎么样$/, a)
  if (/有几个/.test(s)) return s.replace(/有几个/, `有${a}个`)
  if (/有多少个/.test(s)) return s.replace(/有多少个/, `有${a}个`)
  if (/有多少/.test(s)) return s.replace(/有多少/, `有${a}`)
  if (/属于哪个/.test(s)) return s.replace(/属于哪个.*$/, `属于${a}`)
  if (/来自哪里|来自何处/.test(s)) return s.replace(/来自哪里|来自何处/, `来自${a}`)
  if (/什么时候/.test(s)) return s.replace(/什么时候/, a)
  if (/什么季节/.test(s)) return s.replace(/什么季节/, a)
  if (/哪个季节/.test(s)) return s.replace(/哪个季节/, a)
  if (/哪里/.test(s)) return s.replace(/哪里/, a)
  if (/哪[个些]/.test(s)) return s.replace(/哪[个些]/, a)
  if (/几月/.test(s)) return s.replace(/几月/, a.includes('月') ? a : `${a}月`)
  if (/常在$|位于$|在于$|依据$|根据$/.test(s)) return `${s}${a}`

  // 默认：问句主干 + 答案
  return `${s}${a}`
}

function buildItem(it: LifeSenseBankItem): SchulteLifeSenseItem | null {
  const raw = lifeSenseQaToStatement(it.stem, it.correct)
  const display = /[。！？；]$/.test(raw) ? raw : `${raw}。`
  const chars = extractHan(display)
  if (chars.length < 4) return null
  if (new Set(chars).size !== chars.length) return null
  // 高难格 7×5=35，至少留 1 干扰
  if (chars.length >= 35) return null

  return {
    key: `life-${it.key}`,
    difficulty: it.difficulty,
    display,
    chars,
    meaning: resolveFactExplanation('life-sense', it.key, it.explanation),
    stem: it.stem,
    correct: it.correct,
  }
}

function buildBank(): SchulteLifeSenseItem[] {
  const out: SchulteLifeSenseItem[] = []
  const seen = new Set<string>()
  for (const it of LIFE_SENSE_BANK) {
    const item = buildItem(it)
    if (!item) continue
    const fp = `${item.difficulty}|${item.chars.join('')}`
    if (seen.has(fp)) continue
    seen.add(fp)
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
