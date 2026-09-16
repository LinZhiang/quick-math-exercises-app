import type { RhetoricDeviceBankItem } from '@/utils/chinese/rhetoricDeviceBankTypes'
import { pickGlobExport } from '@/utils/app/loadOptionalModule'

const packed = import.meta.glob('./rhetoricDeviceBank.content.ts', { eager: true })
export const RHETORIC_DEVICE_BANK = pickGlobExport<RhetoricDeviceBankItem[]>(
  packed,
  'RHETORIC_DEVICE_BANK',
  [],
)
