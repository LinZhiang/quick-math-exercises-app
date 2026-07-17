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
  idiomStemLeaksTerm,
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
  wordMemorizationStemLeaksTerm,
  type WordMemorizationQuestion,
} from '@/utils/wordMemorizationPractice'
import {
  explanationImpliesNonUniqueAnswer,
  stemHasFillBlank,
  typoMcqQualityFailure,
} from '@/utils/chineseVariantQuality'

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
    return [
      'questionType: word-to-meaning|meaning-to-word；term；stem；correct；distractors[3]；explanation',
      '选释义：选项=释义，禁止填空题干+词语选项，禁止选项含 term；干扰须近义易混书面释义，禁口语场景句',
      '选词语：correct=term，stem 不得出现 term/答案；干扰须近义/形近词',
      '题干须唯一最优答案，禁止近义双解',
    ].join('。')
  }
  if (source === 'char-literacy') {
    return [
      'questionType: pronunciation|typo；term；stem；correct；distractors[3]；explanation',
      'typo 四选项须四个不同词语，严禁同一词规范写法与错写同列',
      '「没有错别字」：correct=term，干扰=另外三词各自的错写',
      '「有错别字」：correct=term 的错写，干扰=另外三正确词，选项不得含 term',
      '禁止把规范写法标成有错别字答案',
    ].join('。')
  }
  if (source === 'poetry-practice') {
    return 'questionType: poem-to-author|poem-to-theme；term；stem；correct；distractors[3]；explanation'
  }
  if (readingMode) {
    return `questionType 固定 ${readingMode}；term；passage；stem；correct；distractors[3]；explanationFocus；explanationCorrect；explanationDistractors[3]（与 distractors 同序）；explanation 可选。解析禁止 A/B/C，须完整通顺；选项字数适度齐长；干扰半真半假。`
  }
  if (source === 'classical-chinese') {
    return [
      'questionType: general；term；stem；correct；distractors[3]；explanation',
      '题干引文必须是原文连续完整语句，禁止用省略号跨段拼接',
      '引文须带足语境：禁止仅「信而见疑」；至少「信而见疑，忠而被谤」或如「臣诚恐见欺于王而负赵」',
      '考「以为」须引《愚公移山》连续句「操蛇之神闻之……众人以为神」',
      '解析须完整；「以为」须点明以（之）为与古今义',
    ].join('。')
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

/** 变式题入库前复检：结构合法之外再拦泄题/极性/近义多解 */
function variantPassesPostCheck(
  source: ChineseKeyQuestionSource,
  q: AnyChineseQuestion,
): boolean {
  if (!isPlayableFourChoiceMcq(q)) return false
  const correct = q.options[q.correctIndex]
  if (!correct) return false
  const distractors = q.options.filter((_, i) => i !== q.correctIndex)

  if (source === 'idiom-memorization' || source === 'word-memorization') {
    const iq = q as IdiomRecognitionQuestion | WordMemorizationQuestion
    if (iq.questionType === 'word-to-meaning') {
      if (stemHasFillBlank(iq.stem)) return false
      if (iq.options.some((o) => o.trim() === iq.term.trim())) return false
    }
    if (iq.questionType === 'meaning-to-word') {
      if (correct !== iq.term) return false
      if (idiomOrWordStemLeaks(source, iq.stem, iq.term)) return false
    }
    if (explanationImpliesNonUniqueAnswer(iq.explanation, iq.options)) return false
  }

  if (source === 'char-literacy') {
    const cq = q as CharLiteracyQuestion
    if (cq.questionType === 'typo') {
      const fail = typoMcqQualityFailure({
        stem: cq.stem,
        term: cq.term,
        correct,
        distractors,
        explanation: cq.explanation,
      })
      if (fail) return false
    }
  }

  return true
}

function idiomOrWordStemLeaks(
  source: ChineseKeyQuestionSource,
  stem: string,
  term: string,
): boolean {
  if (source === 'idiom-memorization') {
    return idiomStemLeaksTerm(stem, term)
  }
  return wordMemorizationStemLeaksTerm(stem, term)
}

/** 单题变式；失败返回 null（调用方应回退原题） */
export async function tryGenerateChineseKeyVariant(
  source: ChineseKeyQuestionSource,
  original: AnyChineseQuestion,
  seq: number,
): Promise<AnyChineseQuestion | null> {
  if (!isAiChatConfigured()) return null

  const attemptOnce = async (): Promise<AnyChineseQuestion | null> => {
    try {
      const raw = await requestChinesePracticeVariantJson({
        sourceTitle: sourceTitle(source),
        schemaHint: schemaHint(source),
        originalQuestionJson: toOriginalJson(original),
      })
      const built = buildVariantFromAi(source, raw, seq, original)
      if (!built) return null
      if (!variantPassesPostCheck(source, built)) return null
      // 与原题完全同指纹视为失败，回退原题
      if (built.fingerprint === original.fingerprint) return null
      return built
    } catch {
      return null
    }
  }

  // 不合格则降随机性再试一次，仍失败则回退原题（宁可不换，不出错题）
  const first = await attemptOnce()
  if (first) return first
  return attemptOnce()
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
