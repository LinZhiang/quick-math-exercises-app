import type { CsVocabTopicId } from '@/utils/cs-vocab/csVocabTopics'

export type CsVocabBankItem = {
  difficulty: 'easy' | 'normal' | 'hard'
  topic: CsVocabTopicId
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  key: string
}
