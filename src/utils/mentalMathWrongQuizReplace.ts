/**
 * 口算错题分批测验：变式答错时用变式替换原错题，并累加 wrongCount / 复盘统计由调用方负责。
 */
import { ElMessage } from 'element-plus'
import {
  bumpMentalMathWrongCount,
  getMentalMathWrongByFingerprint,
  replaceMentalMathWrongWithVariant,
} from '@/utils/mentalMathWrongBook'
import {
  getMentalMathWrongNote,
  removeMentalMathWrongNote,
  setMentalMathWrongNote,
} from '@/utils/mentalMathWrongNotes'
import type { WrongBookQuizItem } from '@/utils/mentalMathWrongQuiz'

function migrateMentalMathWrongNote(
  section: WrongBookQuizItem['section'],
  fromFp: string,
  toFp: string,
) {
  if (!fromFp || !toFp || fromFp === toFp) return
  const note = getMentalMathWrongNote(section, fromFp).trim()
  if (!note) {
    removeMentalMathWrongNote(section, fromFp)
    return
  }
  const existing = getMentalMathWrongNote(section, toFp).trim()
  if (!existing) setMentalMathWrongNote(section, toFp, note)
  removeMentalMathWrongNote(section, fromFp)
}

/**
 * 错题本测验答错：
 * - 变式题 → 用变式替换原错题（备注迁到新指纹），wrongCount = 原 + 1
 * - 原题 → 仅累加原错题次数
 * - 收藏库练习 → 不改错题本
 */
export function handleMentalMathWrongQuizMiss(input: {
  quiz: WrongBookQuizItem
  chosenAnswer: string
  bank: 'wrong' | 'favorite'
}): 'replaced' | 'bumped' | 'skipped' {
  if (input.bank !== 'wrong') return 'skipped'
  const q = input.quiz
  const origin = getMentalMathWrongByFingerprint(q.originFingerprint)
  if (!origin) return 'skipped'

  if (!q.isVariant) {
    bumpMentalMathWrongCount(q.originFingerprint)
    return 'bumped'
  }

  const correctAnswer =
    q.kind === 'mcq'
      ? String(q.options[q.correctIndex] ?? '').trim()
      : String(q.fillAnswer ?? '').trim()
  if (!correctAnswer) {
    bumpMentalMathWrongCount(q.originFingerprint)
    return 'bumped'
  }

  const { ok, newFingerprint } = replaceMentalMathWrongWithVariant({
    originFingerprint: q.originFingerprint,
    modeId: q.modeId || origin.modeId,
    section: q.section || origin.section,
    expression: q.expression,
    correctAnswer,
    chosenAnswer: input.chosenAnswer,
    options: q.kind === 'mcq' ? q.options : undefined,
    explanation: q.explanation,
  })
  if (!ok) {
    bumpMentalMathWrongCount(q.originFingerprint)
    return 'bumped'
  }
  migrateMentalMathWrongNote(origin.section, q.originFingerprint, newFingerprint)
  return 'replaced'
}

/** 提交答错后的用户提示 */
export function notifyMentalMathWrongQuizMissResult(
  result: 'replaced' | 'bumped' | 'skipped',
) {
  if (result === 'replaced') {
    ElMessage.info('已用本变式题替换错题本记录，并累加错题次数')
  }
}
