/** 口算生活常识题库条目类型 */
export type LifeSenseBankItem = {
  difficulty: 'easy' | 'normal' | 'hard'
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  key: string
}
