import type { HanziPatternBankItem } from '@/utils/chinese/hanziPatternBankTypes'
import { pickGlobExport } from '@/utils/app/loadOptionalModule'

const packed = import.meta.glob('./hanziPatternBank.content.ts', { eager: true })
export const HANZI_PATTERN_BANK = pickGlobExport<HanziPatternBankItem[]>(
  packed,
  'HANZI_PATTERN_BANK',
  [],
)
