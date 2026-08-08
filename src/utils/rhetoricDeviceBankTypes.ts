/** 快判·修辞手法题库条目类型 */
export type RhetoricDeviceBankItem = {
  difficulty: 'normal'
  stem: string
  correct: string
  distractors: string[]
  /** 含修辞要点 + 例句（加深识记展示） */
  explanation: string
  key: string
}
