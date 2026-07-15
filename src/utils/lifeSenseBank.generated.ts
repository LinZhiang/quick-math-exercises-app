/** 由 scripts/generate-life-sense-bank.mjs 生成，请勿手改 */
import type { LifeSenseBankItem } from '@/utils/lifeSenseBankTypes'
import raw from '@/utils/lifeSenseBank.generated.json'

export type { LifeSenseBankItem }

export const LIFE_SENSE_BANK = raw.items as LifeSenseBankItem[]

export const LIFE_SENSE_BANK_COUNTS = {
  easy: raw.easy,
  normal: raw.normal,
  hard: raw.hard,
  total: raw.total,
} as const
