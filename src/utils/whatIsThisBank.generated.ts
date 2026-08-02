/** 由 scripts/generate-what-is-this-bank.mjs 生成，请勿手改 */
import type { WhatIsThisBankItem } from '@/utils/whatIsThisBankTypes'
import raw from '@/utils/whatIsThisBank.generated.json'

export type { WhatIsThisBankItem }

export const WHAT_IS_THIS_BANK = raw.items as WhatIsThisBankItem[]

export const WHAT_IS_THIS_BANK_COUNTS = {
  easy: raw.easy,
  normal: raw.normal,
  hard: raw.hard,
  total: raw.total,
} as const
