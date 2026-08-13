/** 快判·舒尔特题库条目 */

export type SchulteWordKind = 'idiom' | 'word' | 'poem'

export type SchulteBankItem = {
  /** 稳定 id，如 idiom-001 / word-001 */
  key: string
  kind: SchulteWordKind
  /** 成语或词语正文（不含标点） */
  word: string
  /** 简明释义（公考/事业编识记向） */
  meaning: string
}
