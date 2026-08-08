/** 快判·修辞手法题库条目类型 */
export type RhetoricDeviceBankItem = {
  difficulty: 'normal'
  stem: string
  correct: string
  distractors: string[]
  /** 修辞 + 出处 + 解析 +（可选）补充；加深识记/错题展示 */
  explanation: string
  key: string
}
