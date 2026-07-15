import { computed, ref, type ComputedRef } from 'vue'
import { ElMessage } from 'element-plus'
import type { ChineseKeyQuestionSource } from '@/constants/chinese-practice-tabs'
import { readingSubModeFromKeySource } from '@/constants/chinese-practice-tabs'
import {
  removeChineseCharLiteracyFavorite,
  removeChineseCharLiteracyWrong,
} from '@/utils/chineseCharLiteracyStorage'
import {
  removeChineseClassicalChineseFavorite,
  removeChineseClassicalChineseWrong,
} from '@/utils/chineseClassicalChineseStorage'
import {
  removeChineseEconomyCommonSenseFavorite,
  removeChineseEconomyCommonSenseWrong,
} from '@/utils/chineseEconomyCommonSenseStorage'
import {
  removeChineseGeographyCommonSenseFavorite,
  removeChineseGeographyCommonSenseWrong,
} from '@/utils/chineseGeographyCommonSenseStorage'
import {
  removeChineseHistoryCommonSenseFavorite,
  removeChineseHistoryCommonSenseWrong,
} from '@/utils/chineseHistoryCommonSenseStorage'
import { removeChineseFavorite, removeChineseWrong } from '@/utils/chineseIdiomStorage'
import {
  removeChineseLegalCommonSenseFavorite,
  removeChineseLegalCommonSenseWrong,
} from '@/utils/chineseLegalCommonSenseStorage'
import {
  removeChineseLifeCommonSenseFavorite,
  removeChineseLifeCommonSenseWrong,
} from '@/utils/chineseLifeCommonSenseStorage'
import {
  removeChinesePartyHistoryFavorite,
  removeChinesePartyHistoryWrong,
} from '@/utils/chinesePartyHistoryStorage'
import {
  removeChinesePoetryFavorite,
  removeChinesePoetryWrong,
} from '@/utils/chinesePoetryStorage'
import {
  removeChineseReadingComprehensionFavorite,
  removeChineseReadingComprehensionWrong,
} from '@/utils/chineseReadingComprehensionStorage'
import {
  removeChineseRhetoricUsageFavorite,
  removeChineseRhetoricUsageWrong,
} from '@/utils/chineseRhetoricUsageStorage'
import {
  removeChineseTheoryPolicyFavorite,
  removeChineseTheoryPolicyWrong,
} from '@/utils/chineseTheoryPolicyStorage'
import {
  removeChineseWordMemorizationFavorite,
  removeChineseWordMemorizationWrong,
} from '@/utils/chineseWordMemorizationStorage'

export type ChineseKeyReviewBank = 'wrong' | 'favorite'

export type ChineseKeyReviewMeta = {
  source: ChineseKeyQuestionSource
  bank: ChineseKeyReviewBank
  /** 与练习题下标对齐：该变式题对应的重点题原题指纹 */
  originFingerprints: string[]
}

let activeSession: ChineseKeyReviewMeta | null = null
/** 会话是否开启（响应式，供测验 UI 订阅） */
const keyReviewSessionActive = ref(false)
/** 用 ref 以便删除按钮 UI 响应式更新 */
const removedOriginFingerprints = ref<Set<string>>(new Set())

export function beginChineseKeyReviewSession(meta: ChineseKeyReviewMeta) {
  activeSession = {
    source: meta.source,
    bank: meta.bank,
    originFingerprints: [...meta.originFingerprints],
  }
  removedOriginFingerprints.value = new Set()
  keyReviewSessionActive.value = true
}

export function clearChineseKeyReviewSession() {
  activeSession = null
  removedOriginFingerprints.value = new Set()
  keyReviewSessionActive.value = false
}

export function isChineseKeyReviewActive(): boolean {
  return keyReviewSessionActive.value
}

export function getChineseKeyReviewSession(): ChineseKeyReviewMeta | null {
  return activeSession
}

export function getKeyReviewOriginFingerprint(index: number): string | null {
  const fp = activeSession?.originFingerprints[index]
  const t = typeof fp === 'string' ? fp.trim() : ''
  return t || null
}

export function isKeyReviewOriginRemoved(fingerprint: string): boolean {
  return removedOriginFingerprints.value.has(fingerprint)
}

export function removeChineseKeyQuestionRecord(
  source: ChineseKeyQuestionSource,
  bank: ChineseKeyReviewBank,
  fingerprint: string,
): void {
  const readingMode = readingSubModeFromKeySource(source)
  if (source === 'idiom-memorization') {
    if (bank === 'wrong') removeChineseWrong(fingerprint)
    else removeChineseFavorite(fingerprint)
    return
  }
  if (source === 'word-memorization') {
    if (bank === 'wrong') removeChineseWordMemorizationWrong(fingerprint)
    else removeChineseWordMemorizationFavorite(fingerprint)
    return
  }
  if (source === 'char-literacy') {
    if (bank === 'wrong') removeChineseCharLiteracyWrong(fingerprint)
    else removeChineseCharLiteracyFavorite(fingerprint)
    return
  }
  if (source === 'poetry-practice') {
    if (bank === 'wrong') removeChinesePoetryWrong(fingerprint)
    else removeChinesePoetryFavorite(fingerprint)
    return
  }
  if (source === 'classical-chinese') {
    if (bank === 'wrong') removeChineseClassicalChineseWrong(fingerprint)
    else removeChineseClassicalChineseFavorite(fingerprint)
    return
  }
  if (source === 'rhetoric-usage') {
    if (bank === 'wrong') removeChineseRhetoricUsageWrong(fingerprint)
    else removeChineseRhetoricUsageFavorite(fingerprint)
    return
  }
  if (readingMode) {
    if (bank === 'wrong') removeChineseReadingComprehensionWrong(fingerprint)
    else removeChineseReadingComprehensionFavorite(fingerprint)
    return
  }
  if (source === 'history-common-sense') {
    if (bank === 'wrong') removeChineseHistoryCommonSenseWrong(fingerprint)
    else removeChineseHistoryCommonSenseFavorite(fingerprint)
    return
  }
  if (source === 'party-history') {
    if (bank === 'wrong') removeChinesePartyHistoryWrong(fingerprint)
    else removeChinesePartyHistoryFavorite(fingerprint)
    return
  }
  if (source === 'theory-policy') {
    if (bank === 'wrong') removeChineseTheoryPolicyWrong(fingerprint)
    else removeChineseTheoryPolicyFavorite(fingerprint)
    return
  }
  if (source === 'legal-common-sense') {
    if (bank === 'wrong') removeChineseLegalCommonSenseWrong(fingerprint)
    else removeChineseLegalCommonSenseFavorite(fingerprint)
    return
  }
  if (source === 'economy-common-sense') {
    if (bank === 'wrong') removeChineseEconomyCommonSenseWrong(fingerprint)
    else removeChineseEconomyCommonSenseFavorite(fingerprint)
    return
  }
  if (source === 'life-common-sense') {
    if (bank === 'wrong') removeChineseLifeCommonSenseWrong(fingerprint)
    else removeChineseLifeCommonSenseFavorite(fingerprint)
    return
  }
  if (source === 'geography-common-sense') {
    if (bank === 'wrong') removeChineseGeographyCommonSenseWrong(fingerprint)
    else removeChineseGeographyCommonSenseFavorite(fingerprint)
  }
}

export function removeKeyReviewOriginAt(index: number): 'removed' | 'already' | 'none' {
  const session = activeSession
  const fp = getKeyReviewOriginFingerprint(index)
  if (!session || !fp) return 'none'
  if (removedOriginFingerprints.value.has(fp)) return 'already'
  removeChineseKeyQuestionRecord(session.source, session.bank, fp)
  const next = new Set(removedOriginFingerprints.value)
  next.add(fp)
  removedOriginFingerprints.value = next
  return 'removed'
}

type QuizUiState = {
  submitted: boolean
  currentIndex: number
  results: { correct: boolean }[]
}

export function useChineseKeyReviewQuizUi(getState: () => QuizUiState): {
  isKeyReview: ComputedRef<boolean>
  bankLabel: ComputedRef<string>
  canRemoveRelated: ComputedRef<boolean>
  relatedRemoved: ComputedRef<boolean>
  onRemoveRelatedOrigin: () => void
} {
  const isKeyReview = computed(() => keyReviewSessionActive.value)
  const bankLabel = computed(() =>
    getChineseKeyReviewSession()?.bank === 'favorite' ? '收藏' : '错题本',
  )
  const canRemoveRelated = computed(() => {
    if (!keyReviewSessionActive.value) return false
    const st = getState()
    if (!st.submitted) return false
    const row = st.results[st.results.length - 1]
    if (!row?.correct) return false
    const fp = getKeyReviewOriginFingerprint(st.currentIndex)
    if (!fp) return false
    return !removedOriginFingerprints.value.has(fp)
  })
  const relatedRemoved = computed(() => {
    if (!keyReviewSessionActive.value) return false
    const st = getState()
    if (!st.submitted) return false
    const row = st.results[st.results.length - 1]
    if (!row?.correct) return false
    const fp = getKeyReviewOriginFingerprint(st.currentIndex)
    return !!fp && removedOriginFingerprints.value.has(fp)
  })

  function onRemoveRelatedOrigin() {
    const st = getState()
    const r = removeKeyReviewOriginAt(st.currentIndex)
    if (r === 'removed') {
      ElMessage.success(`已从${bankLabel.value}删除相关原题`)
    } else if (r === 'already') {
      ElMessage.info('相关原题已删除')
    } else {
      ElMessage.warning('未找到对应原题')
    }
  }

  return {
    isKeyReview,
    bankLabel,
    canRemoveRelated,
    relatedRemoved,
    onRemoveRelatedOrigin,
  }
}
