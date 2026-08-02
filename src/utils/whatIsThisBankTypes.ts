/** 口算·这是什么题库条目类型 */
export type WhatIsThisBankItem = {
  difficulty: 'easy' | 'normal' | 'hard'
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  key: string
}
