/** 口算·经济学常识题库条目类型 */
export type EconomySenseBankItem = {
  difficulty: 'normal'
  stem: string
  correct: string
  distractors: string[]
  /** 含定义要点 + 举例（加深识记展示） */
  explanation: string
  key: string
}
