import type { WenyanJushiBankItem } from '@/utils/chinese/wenyanJushiBankTypes'
import { pickGlobExport } from '@/utils/app/loadOptionalModule'

const packed = import.meta.glob('./wenyanJushiBank.content.ts', { eager: true })
export const WENYAN_JUSHI_BANK = pickGlobExport<WenyanJushiBankItem[]>(packed, 'WENYAN_JUSHI_BANK', [])
