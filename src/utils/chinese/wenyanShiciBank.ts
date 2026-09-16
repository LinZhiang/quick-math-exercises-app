import type { WenyanShiciBankItem } from '@/utils/chinese/wenyanShiciBankTypes'
import { pickGlobExport } from '@/utils/app/loadOptionalModule'

const packed = import.meta.glob('./wenyanShiciBank.content.ts', { eager: true })
export const WENYAN_SHICI_BANK = pickGlobExport<WenyanShiciBankItem[]>(packed, 'WENYAN_SHICI_BANK', [])
export const WENYAN_SHICI_BANK_COUNTS = pickGlobExport(
  packed,
  'WENYAN_SHICI_BANK_COUNTS',
  { normal: 0, total: 0 },
)
