/**
 * 舒尔特·古诗词：从识记模块「诗词模块」POET_OVERVIEW_BANK 扁平化。
 * 每条名句单独出题，展示形如「会当凌绝顶，一览众山小——杜甫」。
 */

import { POET_OVERVIEW_BANK } from '@/data/poetOverview/bank'

const HAN_RE = /[\u4e00-\u9fff]/

export type SchultePoemItem = {
  key: string
  author: string
  title: string
  /** 原句（可含标点） */
  line: string
  /** 出示文案：句——作者 */
  display: string
  /** 点选字序（仅汉字：原句汉字 + 作者汉字） */
  chars: string[]
  /** 注释（来自诗词模块 note） */
  meaning: string
}

function extractHan(text: string): string[] {
  return Array.from(text.normalize('NFC')).filter((c) => HAN_RE.test(c))
}

function buildBank(): SchultePoemItem[] {
  const out: SchultePoemItem[] = []
  let seq = 0
  for (const poet of POET_OVERVIEW_BANK) {
    const authorHans = extractHan(poet.name)
    if (!authorHans.length) continue
    for (const stage of poet.stages) {
      for (const poem of stage.poems) {
        for (let li = 0; li < poem.lines.length; li++) {
          const line = poem.lines[li]!
          const lineHans = extractHan(line)
          if (lineHans.length < 4) continue
          const chars = [...lineHans, ...authorHans]
          // 格子必须字字不同：目标序列自身不得重复
          if (new Set(chars).size !== chars.length) continue
          if (chars.length >= 35) continue
          seq += 1
          const display = `${line.replace(/[。！？；]$/, '')}——${poet.name}`
          out.push({
            key: `poem-${String(seq).padStart(3, '0')}`,
            author: poet.name,
            title: poem.title,
            line,
            display,
            chars,
            meaning: poem.note,
          })
        }
      }
    }
  }
  return out
}

export const SCHULTE_POEM_BANK: SchultePoemItem[] = buildBank()

export const SCHULTE_POEM_BANK_COUNT = SCHULTE_POEM_BANK.length
