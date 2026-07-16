import type { ChineseKeyQuestionSource } from '@/constants/chinese-practice-tabs'
import { readingSubModeFromKeySource } from '@/constants/chinese-practice-tabs'
import { isAiChatConfigured, requestChinesePracticeVariantJson } from '@/services/deepseek'
import type { KeyPracticePayload } from '@/types/chinese-practice'
import { isPlayableFourChoiceMcq } from '@/utils/chineseMcqAiFields'
import {
  buildCharLiteracyQuestionFromMcq,
  parseCharLiteracyMcqAiObject,
  type CharLiteracyQuestion,
} from '@/utils/charLiteracyPractice'
import {
  buildClassicalChineseQuestionFromMcq,
  parseClassicalChineseMcqAiObject,
  type ClassicalChineseQuestion,
} from '@/utils/classicalChinesePractice'
import {
  buildEconomyCommonSenseQuestionFromMcq,
  parseEconomyCommonSenseMcqAiObject,
  type EconomyCommonSenseQuestion,
} from '@/utils/economyCommonSensePractice'
import {
  buildGeographyCommonSenseQuestionFromMcq,
  parseGeographyCommonSenseMcqAiObject,
  type GeographyCommonSenseQuestion,
} from '@/utils/geographyCommonSensePractice'
import {
  buildHistoryCommonSenseQuestionFromMcq,
  parseHistoryCommonSenseMcqAiObject,
  type HistoryCommonSenseQuestion,
} from '@/utils/historyCommonSensePractice'
import {
  buildIdiomQuestionFromMcq,
  parseIdiomMcqAiObject,
  type IdiomRecognitionQuestion,
} from '@/utils/idiomRecognitionPractice'
import {
  buildLegalCommonSenseQuestionFromMcq,
  parseLegalCommonSenseMcqAiObject,
  type LegalCommonSenseQuestion,
} from '@/utils/legalCommonSensePractice'
import {
  buildLifeCommonSenseQuestionFromMcq,
  parseLifeCommonSenseMcqAiObject,
  type LifeCommonSenseQuestion,
} from '@/utils/lifeCommonSensePractice'
import {
  buildPartyHistoryQuestionFromMcq,
  parsePartyHistoryMcqAiObject,
  type PartyHistoryQuestion,
} from '@/utils/partyHistoryPractice'
import {
  buildPoetryQuestionFromMcq,
  parsePoetryMcqAiObject,
  type PoetryRecognitionQuestion,
} from '@/utils/poetryRecognitionPractice'
import {
  buildReadingComprehensionQuestionFromMcq,
  parseReadingComprehensionMcqAiObject,
  type ReadingComprehensionQuestion,
} from '@/utils/readingComprehensionPractice'
import {
  buildRhetoricUsageQuestionFromMcq,
  parseRhetoricUsageMcqAiObject,
  type RhetoricUsageQuestion,
} from '@/utils/rhetoricUsagePractice'
import {
  buildTheoryPolicyQuestionFromMcq,
  parseTheoryPolicyMcqAiObject,
  type TheoryPolicyQuestion,
} from '@/utils/theoryPolicyPractice'
import {
  buildWordMemorizationQuestionFromMcq,
  parseWordMemorizationMcqAiObject,
  type WordMemorizationQuestion,
} from '@/utils/wordMemorizationPractice'

type AnyChineseQuestion = KeyPracticePayload['questions'][number]

function toOriginalJson(q: AnyChineseQuestion): string {
  const base: Record<string, unknown> = {
    questionType: q.questionType,
    term: 'term' in q ? q.term : undefined,
    stem: q.stem,
    options: q.options,
    correctIndex: q.correctIndex,
    correct: q.options[q.correctIndex],
    distractors: q.options.filter((_, i) => i !== q.correctIndex),
    explanation: q.explanation,
  }
  if ('passage' in q && typeof (q as ReadingComprehensionQuestion).passage === 'string') {
    base.passage = (q as ReadingComprehensionQuestion).passage
  }
  return JSON.stringify(base)
}

function schemaHint(source: ChineseKeyQuestionSource): string {
  const readingMode = readingSubModeFromKeySource(source)
  if (source === 'idiom-memorization' || source === 'word-memorization') {
    return 'questionType: word-to-meaning|meaning-to-word；term；stem；correct；distractors[3]；explanation'
  }
  if (source === 'char-literacy') {
    return 'questionType: pronunciation|typo；term；stem；correct；distractors[3]；explanation'
  }
  if (source === 'poetry-practice') {
    return 'questionType: poem-to-author|poem-to-theme；term；stem；correct；distractors[3]；explanation'
  }
  if (readingMode) {
    return `questionType 固定 ${readingMode}；term；passage；stem；correct；distractors[3]；explanation。硬性：至少 1 个 distractor 字数严格长于 correct，禁止正确项独最长；干扰半真半假。`
  }
  return 'questionType: general；term；stem；correct；distractors[3]；explanation'
}

function sourceTitle(source: ChineseKeyQuestionSource): string {
  const map: Partial<Record<ChineseKeyQuestionSource, string>> = {
    'idiom-memorization': '成语识记',
    'word-memorization': '词语识记',
    'char-literacy': '字音字形',
    'poetry-practice': '诗词练习',
    'classical-chinese': '文言知识',
    'rhetoric-usage': '修辞运用',
    'history-common-sense': '历史常识',
    'party-history': '中共党史',
    'theory-policy': '理论政策',
    'legal-common-sense': '法律常识',
    'economy-common-sense': '经济常识',
    'life-common-sense': '生活科学',
    'geography-common-sense': '地理常识',
  }
  const readingMode = readingSubModeFromKeySource(source)
  if (readingMode) return `阅读理解·${readingMode}`
  return map[source] ?? '语文练习'
}

function buildVariantFromAi(
  source: ChineseKeyQuestionSource,
  raw: unknown,
  seq: number,
  original: AnyChineseQuestion,
): AnyChineseQuestion | null {
  const readingMode = readingSubModeFromKeySource(source)
  if (source === 'idiom-memorization') {
    const fields = parseIdiomMcqAiObject(raw)
    if (!fields) return null
    return buildIdiomQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'word-memorization') {
    const fields = parseWordMemorizationMcqAiObject(raw)
    if (!fields) return null
    return buildWordMemorizationQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'char-literacy') {
    const fields = parseCharLiteracyMcqAiObject(raw)
    if (!fields) return null
    return buildCharLiteracyQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'poetry-practice') {
    const fields = parsePoetryMcqAiObject(raw)
    if (!fields) return null
    return buildPoetryQuestionFromMcq({ ...fields, seq })
  }
  if (readingMode) {
    const fields = parseReadingComprehensionMcqAiObject(raw)
    if (!fields) return null
    return buildReadingComprehensionQuestionFromMcq({
      ...fields,
      questionType: readingMode,
      seq,
    })
  }
  if (source === 'classical-chinese') {
    const fields = parseClassicalChineseMcqAiObject(raw)
    if (!fields) return null
    return buildClassicalChineseQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'rhetoric-usage') {
    const fields = parseRhetoricUsageMcqAiObject(raw)
    if (!fields) return null
    return buildRhetoricUsageQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'history-common-sense') {
    const fields = parseHistoryCommonSenseMcqAiObject(raw)
    if (!fields) return null
    return buildHistoryCommonSenseQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'party-history') {
    const fields = parsePartyHistoryMcqAiObject(raw)
    if (!fields) return null
    return buildPartyHistoryQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'theory-policy') {
    const fields = parseTheoryPolicyMcqAiObject(raw)
    if (!fields) return null
    return buildTheoryPolicyQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'legal-common-sense') {
    const fields = parseLegalCommonSenseMcqAiObject(raw)
    if (!fields) return null
    return buildLegalCommonSenseQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'economy-common-sense') {
    const fields = parseEconomyCommonSenseMcqAiObject(raw)
    if (!fields) return null
    return buildEconomyCommonSenseQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'life-common-sense') {
    const fields = parseLifeCommonSenseMcqAiObject(raw)
    if (!fields) return null
    return buildLifeCommonSenseQuestionFromMcq({ ...fields, seq })
  }
  if (source === 'geography-common-sense') {
    const fields = parseGeographyCommonSenseMcqAiObject(raw)
    if (!fields) return null
    return buildGeographyCommonSenseQuestionFromMcq({ ...fields, seq })
  }
  void original
  return null
}

/** 单题变式；失败返回 null（调用方应回退原题） */
export async function tryGenerateChineseKeyVariant(
  source: ChineseKeyQuestionSource,
  original: AnyChineseQuestion,
  seq: number,
): Promise<AnyChineseQuestion | null> {
  if (!isAiChatConfigured()) return null
  try {
    const raw = await requestChinesePracticeVariantJson({
      sourceTitle: sourceTitle(source),
      schemaHint: schemaHint(source),
      originalQuestionJson: toOriginalJson(original),
    })
    const built = buildVariantFromAi(source, raw, seq, original)
    if (!built) return null
    if (!isPlayableFourChoiceMcq(built)) return null
    // 与原题完全同指纹视为失败，回退原题
    if (built.fingerprint === original.fingerprint) return null
    return built
  } catch {
    return null
  }
}

/** 批量：逐题尝试变式，失败则用原题；同时返回对应原题指纹 */
export async function buildKeyPracticeQuestionsWithVariants(
  source: ChineseKeyQuestionSource,
  originals: AnyChineseQuestion[],
  onProgress?: (msg: string) => void,
): Promise<{ questions: AnyChineseQuestion[]; originFingerprints: string[] }> {
  const questions: AnyChineseQuestion[] = []
  const originFingerprints: string[] = []
  for (let i = 0; i < originals.length; i++) {
    const original = originals[i]!
    onProgress?.(`正在生成变式 ${i + 1}/${originals.length}…`)
    const variant = await tryGenerateChineseKeyVariant(source, original, i + 1)
    questions.push(variant ?? original)
    originFingerprints.push(original.fingerprint)
  }
  return { questions, originFingerprints }
}

export type {
  IdiomRecognitionQuestion,
  WordMemorizationQuestion,
  CharLiteracyQuestion,
  PoetryRecognitionQuestion,
  ClassicalChineseQuestion,
  RhetoricUsageQuestion,
  ReadingComprehensionQuestion,
  HistoryCommonSenseQuestion,
  PartyHistoryQuestion,
  TheoryPolicyQuestion,
  LegalCommonSenseQuestion,
  EconomyCommonSenseQuestion,
  LifeCommonSenseQuestion,
  GeographyCommonSenseQuestion,
}
