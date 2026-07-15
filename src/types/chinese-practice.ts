import type { CharLiteracyQuestion } from '@/utils/charLiteracyPractice'
import type { ClassicalChineseQuestion } from '@/utils/classicalChinesePractice'
import type { EconomyCommonSenseQuestion } from '@/utils/economyCommonSensePractice'
import type { GeographyCommonSenseQuestion } from '@/utils/geographyCommonSensePractice'
import type { HistoryCommonSenseQuestion } from '@/utils/historyCommonSensePractice'
import type { IdiomRecognitionQuestion } from '@/utils/idiomRecognitionPractice'
import type { LegalCommonSenseQuestion } from '@/utils/legalCommonSensePractice'
import type { LifeCommonSenseQuestion } from '@/utils/lifeCommonSensePractice'
import type { PartyHistoryQuestion } from '@/utils/partyHistoryPractice'
import type { PoetryRecognitionQuestion } from '@/utils/poetryRecognitionPractice'
import type { ReadingComprehensionQuestion } from '@/utils/readingComprehensionPractice'
import type { RhetoricUsageQuestion } from '@/utils/rhetoricUsagePractice'
import type { TheoryPolicyQuestion } from '@/utils/theoryPolicyPractice'
import type { WordMemorizationQuestion } from '@/utils/wordMemorizationPractice'
import type {
  ChineseKeyQuestionSource,
  ChineseReadingKeySource,
} from '@/constants/chinese-practice-tabs'
import type { ChineseKeyReviewMeta } from '@/utils/chineseKeyReviewSession'

export type ChinesePaperSource = 'generated' | 'review' | null

export type { ChineseKeyReviewMeta }

type KeyPracticeBase = {
  /** 重点题变式练习：追踪原题指纹；答错不入错题本 */
  keyReview?: ChineseKeyReviewMeta
}

export type KeyPracticePayload = KeyPracticeBase &
  (
    | { source: 'idiom-memorization'; questions: IdiomRecognitionQuestion[] }
    | { source: 'word-memorization'; questions: WordMemorizationQuestion[] }
    | { source: 'char-literacy'; questions: CharLiteracyQuestion[] }
    | { source: 'poetry-practice'; questions: PoetryRecognitionQuestion[] }
    | { source: 'classical-chinese'; questions: ClassicalChineseQuestion[] }
    | { source: 'rhetoric-usage'; questions: RhetoricUsageQuestion[] }
    | { source: ChineseReadingKeySource; questions: ReadingComprehensionQuestion[] }
    | { source: 'history-common-sense'; questions: HistoryCommonSenseQuestion[] }
    | { source: 'party-history'; questions: PartyHistoryQuestion[] }
    | { source: 'theory-policy'; questions: TheoryPolicyQuestion[] }
    | { source: 'legal-common-sense'; questions: LegalCommonSenseQuestion[] }
    | { source: 'economy-common-sense'; questions: EconomyCommonSenseQuestion[] }
    | { source: 'life-common-sense'; questions: LifeCommonSenseQuestion[] }
    | { source: 'geography-common-sense'; questions: GeographyCommonSenseQuestion[] }
  )

export type { ChineseKeyQuestionSource }
