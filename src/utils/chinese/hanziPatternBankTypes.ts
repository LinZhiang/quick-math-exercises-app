/** 快判·汉字规律题库条目 */
export type HanziPatternBankItem = {
  difficulty: 'normal'
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  key: string
  /** 题干展示的四个汉字 */
  chars: [string, string, string, string]
}
