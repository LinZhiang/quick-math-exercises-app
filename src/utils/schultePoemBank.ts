/**
 * 舒尔特·古诗词：考点严格对齐识记模块「诗词模块」POET_OVERVIEW_BANK。
 * 只收录正式篇目名句与原 note，不收录「（阶段概述）」等非诗句材料。
 * 展示形如「会当凌绝顶，一览众山小——杜甫」。
 */

import { POET_OVERVIEW_BANK } from '@/data/poetOverview/bank'
import type { PoetOverviewPoem } from '@/utils/poetOverviewTypes'

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
  /** 注释（原样来自诗词模块 note，不改写） */
  meaning: string
}

function extractHan(text: string): string[] {
  return Array.from(text.normalize('NFC')).filter((c) => HAN_RE.test(c))
}

/** 是否为诗词模块中的正式篇目（排除阶段概述等非诗句考点） */
function isMemorizationPoem(poem: PoetOverviewPoem): boolean {
  const t = poem.title.trim()
  if (!t) return false
  if (t.includes('阶段概述')) return false
  if (/^[（(]/.test(t)) return false
  // 模块内正式篇目普遍带书名号《…》
  if (!(t.includes('《') && t.includes('》'))) return false
  return poem.lines.some((line) => extractHan(line).length >= 4)
}

function buildBank(): SchultePoemItem[] {
  const out: SchultePoemItem[] = []
  let seq = 0
  for (const poet of POET_OVERVIEW_BANK) {
    const authorHans = extractHan(poet.name)
    if (!authorHans.length) continue
    for (const stage of poet.stages) {
      for (const poem of stage.poems) {
        if (!isMemorizationPoem(poem)) continue
        for (let li = 0; li < poem.lines.length; li++) {
          const line = poem.lines[li]!
          const lineHans = extractHan(line)
          if (lineHans.length < 4) continue
          const chars = [...lineHans, ...authorHans]
          // 格子必须字字不同：目标序列自身不得重复
          if (new Set(chars).size !== chars.length) continue
          // 须能放进高难 7×5=35 格（至少留 1 个干扰）
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
