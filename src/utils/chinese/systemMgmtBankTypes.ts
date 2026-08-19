/** 口算·体制管理题库条目类型 */
export type SystemMgmtBankItem = {
  difficulty: 'normal'
  stem: string
  correct: string
  distractors: string[]
  /** 含定义要点 + 举例 / 层级 / 易错点（加深识记展示） */
  explanation: string
  key: string
}
