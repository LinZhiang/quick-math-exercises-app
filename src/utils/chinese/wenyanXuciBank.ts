import type { WenyanXuciBankItem } from '@/utils/chinese/wenyanXuciBankTypes'
import { pickGlobExport } from '@/utils/app/loadOptionalModule'

const packed = import.meta.glob('./wenyanXuciBank.content.ts', { eager: true })
export const WENYAN_XUCI_BANK = pickGlobExport<WenyanXuciBankItem[]>(packed, 'WENYAN_XUCI_BANK', [])
