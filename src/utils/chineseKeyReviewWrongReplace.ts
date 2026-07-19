/**
 * 重点题 · 错题本变式练习：答错变式且原题无备注时，用变式替换原错题记录。
 * 替换时 wrongCount 在原记录基础上 +1（不重置为 1）。
 */
import { ElMessage } from 'element-plus'
import type { ChineseKeyQuestionSource } from '@/constants/chinese-practice-tabs'
import { readingSubModeFromKeySource } from '@/constants/chinese-practice-tabs'
import { getKeyQuestionNote } from '@/utils/chineseKeyQuestionNotes'
import {
  getChineseKeyReviewSession,
  getKeyReviewOriginFingerprint,
  isChineseKeyReviewActive,
  updateKeyReviewOriginFingerprint,
} from '@/utils/chineseKeyReviewSession'
import {
  listChineseWrongRecords,
  removeChineseWrong,
} from '@/utils/chineseIdiomStorage'
import {
  listChineseWordMemorizationWrongRecords,
  removeChineseWordMemorizationWrong,
} from '@/utils/chineseWordMemorizationStorage'
import {
  listChineseCharLiteracyWrongRecords,
  removeChineseCharLiteracyWrong,
} from '@/utils/chineseCharLiteracyStorage'
import {
  listChinesePoetryWrongRecords,
  removeChinesePoetryWrong,
} from '@/utils/chinesePoetryStorage'
import {
  listChineseClassicalChineseWrongRecords,
  removeChineseClassicalChineseWrong,
} from '@/utils/chineseClassicalChineseStorage'
import {
  listChineseRhetoricUsageWrongRecords,
  removeChineseRhetoricUsageWrong,
} from '@/utils/chineseRhetoricUsageStorage'
import {
  listChineseReadingComprehensionWrongRecords,
  removeChineseReadingComprehensionWrong,
} from '@/utils/chineseReadingComprehensionStorage'
import {
  listChineseHistoryCommonSenseWrongRecords,
  removeChineseHistoryCommonSenseWrong,
} from '@/utils/chineseHistoryCommonSenseStorage'
import {
  listChinesePartyHistoryWrongRecords,
  removeChinesePartyHistoryWrong,
} from '@/utils/chinesePartyHistoryStorage'
import {
  listChineseTheoryPolicyWrongRecords,
  removeChineseTheoryPolicyWrong,
} from '@/utils/chineseTheoryPolicyStorage'
import {
  listChineseLegalCommonSenseWrongRecords,
  removeChineseLegalCommonSenseWrong,
} from '@/utils/chineseLegalCommonSenseStorage'
import {
  listChineseEconomyCommonSenseWrongRecords,
  removeChineseEconomyCommonSenseWrong,
} from '@/utils/chineseEconomyCommonSenseStorage'
import {
  listChineseLifeCommonSenseWrongRecords,
  removeChineseLifeCommonSenseWrong,
} from '@/utils/chineseLifeCommonSenseStorage'
import {
  listChineseGeographyCommonSenseWrongRecords,
  removeChineseGeographyCommonSenseWrong,
} from '@/utils/chineseGeographyCommonSenseStorage'
import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'

/** 各模块测验题的最小公共形状（变式题均具备） */
export type KeyReviewVariantQuestion = {
  fingerprint: string
  [key: string]: unknown
}

type WrongRow = {
  fingerprint: string
  wrongCount?: number
  updatedAt?: string
  [key: string]: unknown
}

function listWrongRows(source: ChineseKeyQuestionSource): WrongRow[] {
  if (source === 'idiom-memorization') return listChineseWrongRecords() as WrongRow[]
  if (source === 'word-memorization') return listChineseWordMemorizationWrongRecords() as WrongRow[]
  if (source === 'char-literacy') return listChineseCharLiteracyWrongRecords() as WrongRow[]
  if (source === 'poetry-practice') return listChinesePoetryWrongRecords() as WrongRow[]
  if (source === 'classical-chinese') return listChineseClassicalChineseWrongRecords() as WrongRow[]
  if (source === 'rhetoric-usage') return listChineseRhetoricUsageWrongRecords() as WrongRow[]
  if (readingSubModeFromKeySource(source)) {
    return listChineseReadingComprehensionWrongRecords() as WrongRow[]
  }
  if (source === 'history-common-sense') {
    return listChineseHistoryCommonSenseWrongRecords() as WrongRow[]
  }
  if (source === 'party-history') return listChinesePartyHistoryWrongRecords() as WrongRow[]
  if (source === 'theory-policy') return listChineseTheoryPolicyWrongRecords() as WrongRow[]
  if (source === 'legal-common-sense') {
    return listChineseLegalCommonSenseWrongRecords() as WrongRow[]
  }
  if (source === 'economy-common-sense') {
    return listChineseEconomyCommonSenseWrongRecords() as WrongRow[]
  }
  if (source === 'life-common-sense') {
    return listChineseLifeCommonSenseWrongRecords() as WrongRow[]
  }
  if (source === 'geography-common-sense') {
    return listChineseGeographyCommonSenseWrongRecords() as WrongRow[]
  }
  return []
}

function removeWrong(source: ChineseKeyQuestionSource, fingerprint: string): void {
  if (source === 'idiom-memorization') {
    removeChineseWrong(fingerprint)
    return
  }
  if (source === 'word-memorization') {
    removeChineseWordMemorizationWrong(fingerprint)
    return
  }
  if (source === 'char-literacy') {
    removeChineseCharLiteracyWrong(fingerprint)
    return
  }
  if (source === 'poetry-practice') {
    removeChinesePoetryWrong(fingerprint)
    return
  }
  if (source === 'classical-chinese') {
    removeChineseClassicalChineseWrong(fingerprint)
    return
  }
  if (source === 'rhetoric-usage') {
    removeChineseRhetoricUsageWrong(fingerprint)
    return
  }
  if (readingSubModeFromKeySource(source)) {
    removeChineseReadingComprehensionWrong(fingerprint)
    return
  }
  if (source === 'history-common-sense') {
    removeChineseHistoryCommonSenseWrong(fingerprint)
    return
  }
  if (source === 'party-history') {
    removeChinesePartyHistoryWrong(fingerprint)
    return
  }
  if (source === 'theory-policy') {
    removeChineseTheoryPolicyWrong(fingerprint)
    return
  }
  if (source === 'legal-common-sense') {
    removeChineseLegalCommonSenseWrong(fingerprint)
    return
  }
  if (source === 'economy-common-sense') {
    removeChineseEconomyCommonSenseWrong(fingerprint)
    return
  }
  if (source === 'life-common-sense') {
    removeChineseLifeCommonSenseWrong(fingerprint)
    return
  }
  if (source === 'geography-common-sense') {
    removeChineseGeographyCommonSenseWrong(fingerprint)
  }
}

function getWrongCount(source: ChineseKeyQuestionSource, fingerprint: string): number {
  const hit = listWrongRows(source).find((r) => r.fingerprint === fingerprint)
  const n = hit?.wrongCount
  return typeof n === 'number' && n > 0 ? n : 0
}

/**
 * 用变式题面替换/写入错题，wrongCount 设为指定值（已含本次累加）。
 * 若同指纹已存在则更新题面与次数；否则插入新记录。
 */
function writeWrongWithCount(
  source: ChineseKeyQuestionSource,
  variant: KeyReviewVariantQuestion,
  wrongCount: number,
): void {
  const fp = String(variant.fingerprint).trim()
  const count = Math.max(1, Math.floor(wrongCount))
  const now = new Date().toISOString()

  // 先清掉同指纹旧行，再按各 storage 的写入约定：直接操作 list + localStorage 太散
  // 统一：remove 同指纹后，借助「临时塞一条带 wrongCount 的记录」——各 upsert 不接受 count。
  // 因此在对应 storage 的 list 层手写一行。
  removeWrong(source, fp)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = variant as any
  const base: WrongRow = {
    fingerprint: fp,
    questionType: q.questionType,
    term: typeof q.term === 'string' ? q.term : '',
    stem: typeof q.stem === 'string' ? q.stem : '',
    options: Array.isArray(q.options) ? [...q.options] : [],
    correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
    explanation: typeof q.explanation === 'string' ? q.explanation : '',
    wrongCount: count,
    updatedAt: now,
  }
  if (typeof q.passage === 'string') base.passage = q.passage

  const key = storageKeyFor(source)
  if (!key) return
  try {
    const raw = localStorage.getItem(key)
    const rows: WrongRow[] = raw ? (JSON.parse(raw) as WrongRow[]) : []
    const list = Array.isArray(rows) ? rows.filter((r) => r.fingerprint !== fp) : []
    list.unshift(base)
    localStorage.setItem(key, JSON.stringify(list))
    chinesePracticeDataTick.value += 1
  } catch {
    /* ignore */
  }
}

/** 与各 *Storage.ts 中 WRONG_KEY 对齐 */
function storageKeyFor(source: ChineseKeyQuestionSource): string | null {
  if (source === 'idiom-memorization') return 'chinese-practice-wrong-v1'
  if (source === 'word-memorization') return 'chinese-word-memorization-wrong-v1'
  if (source === 'char-literacy') return 'chinese-char-literacy-wrong-v1'
  if (source === 'poetry-practice') return 'chinese-poetry-wrong-v1'
  if (source === 'classical-chinese') return 'chinese-classical-chinese-wrong-v1'
  if (source === 'rhetoric-usage') return 'chinese-rhetoric-usage-wrong-v1'
  if (readingSubModeFromKeySource(source)) return 'chinese-reading-comprehension-wrong-v1'
  if (source === 'history-common-sense') return 'chinese-history-common-sense-wrong-v1'
  if (source === 'party-history') return 'chinese-party-history-wrong-v1'
  if (source === 'theory-policy') return 'chinese-theory-policy-wrong-v1'
  if (source === 'legal-common-sense') return 'chinese-legal-common-sense-wrong-v1'
  if (source === 'economy-common-sense') return 'chinese-economy-common-sense-wrong-v1'
  if (source === 'life-common-sense') return 'chinese-life-common-sense-wrong-v1'
  if (source === 'geography-common-sense') return 'chinese-geography-common-sense-wrong-v1'
  return null
}

/**
 * 重点题错题本变式答错时：
 * - 原题有备注 → 保留原错题，不写入变式
 * - 原题无备注 → 用变式替换原错题，wrongCount = 原次数 + 1
 */
export function handleKeyReviewVariantWrong(
  questionIndex: number,
  variant: KeyReviewVariantQuestion,
): 'replaced' | 'kept-note' | 'skipped' {
  if (!isChineseKeyReviewActive()) return 'skipped'
  const session = getChineseKeyReviewSession()
  if (!session || session.bank !== 'wrong') return 'skipped'

  const originFp = getKeyReviewOriginFingerprint(questionIndex)
  if (!originFp) return 'skipped'

  const note = getKeyQuestionNote(session.source, originFp).trim()
  if (note) return 'kept-note'

  const variantFp = typeof variant.fingerprint === 'string' ? variant.fingerprint.trim() : ''
  if (!variantFp) return 'skipped'

  const originCount = getWrongCount(session.source, originFp)
  // 无论原次数是几，都在原有基础上 +1（原记录缺失时按 1 起算再 +1）
  const nextCount = (originCount > 0 ? originCount : 1) + 1

  if (variantFp !== originFp) {
    removeWrong(session.source, originFp)
  }
  writeWrongWithCount(session.source, variant, nextCount)
  updateKeyReviewOriginFingerprint(questionIndex, variantFp)
  return 'replaced'
}

/** 供 submitCurrent 一行调用：普通答错入闸；变式答错按备注决定是否替换 */
export function noteWrongOrReplaceKeyReviewVariant(
  isCorrect: boolean,
  questionIndex: number,
  question: KeyReviewVariantQuestion,
  noteOrdinaryWrong: () => void,
): void {
  if (isCorrect) return
  if (isChineseKeyReviewActive()) {
    const r = handleKeyReviewVariantWrong(questionIndex, question)
    if (r === 'replaced') {
      ElMessage.info('原错题无备注，已用本变式题替换错题本记录（错题次数已累加）')
    }
    return
  }
  noteOrdinaryWrong()
}
