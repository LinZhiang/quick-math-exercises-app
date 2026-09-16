import type { SystemMgmtBankItem } from '@/utils/chinese/systemMgmtBankTypes'
import { pickGlobExport } from '@/utils/app/loadOptionalModule'

const packed = import.meta.glob('./systemMgmtBank.content.ts', { eager: true })
export const SYSTEM_MGMT_BANK = pickGlobExport<SystemMgmtBankItem[]>(packed, 'SYSTEM_MGMT_BANK', [])
export const SYSTEM_MGMT_BANK_COUNTS = pickGlobExport(
  packed,
  'SYSTEM_MGMT_BANK_COUNTS',
  { normal: 0, total: 0 },
)
