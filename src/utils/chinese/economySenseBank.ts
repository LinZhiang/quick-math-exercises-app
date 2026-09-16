import type { EconomySenseBankItem } from '@/utils/chinese/economySenseBankTypes'
import { pickGlobExport } from '@/utils/app/loadOptionalModule'

const packed = import.meta.glob('./economySenseBank.content.ts', { eager: true })
export const ECONOMY_SENSE_BANK = pickGlobExport<EconomySenseBankItem[]>(packed, 'ECONOMY_SENSE_BANK', [])
export const ECONOMY_SENSE_BANK_COUNTS = pickGlobExport(
  packed,
  'ECONOMY_SENSE_BANK_COUNTS',
  { normal: 0, total: 0 },
)
