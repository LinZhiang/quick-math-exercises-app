import type { CsVocabBankItem } from '@/utils/cs-vocab/csVocabBankTypes'
import empty from '@/utils/cs-vocab/bank.empty.json'

type Pack = { items?: CsVocabBankItem[] }

const generated = import.meta.glob('./bank.generated.json', { eager: true, import: 'default' }) as Record<
  string,
  Pack | CsVocabBankItem[]
>

function loadItems(): CsVocabBankItem[] {
  const raw = generated['./bank.generated.json']
  if (Array.isArray(raw) && raw.length) return raw
  if (raw && typeof raw === 'object' && Array.isArray((raw as Pack).items) && (raw as Pack).items!.length) {
    return (raw as Pack).items as CsVocabBankItem[]
  }
  const fallback = empty as Pack
  return Array.isArray(fallback.items) ? fallback.items : []
}

export const CS_VOCAB_BANK: CsVocabBankItem[] = loadItems()
