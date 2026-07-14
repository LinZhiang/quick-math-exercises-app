import type { CharLiteracyQuestion } from '@/utils/charLiteracyPractice'
import type { ClassicalChineseQuestion } from '@/utils/classicalChinesePractice'
import type { CommonSenseQuestion } from '@/utils/commonSensePractice'
import type { EconomyCommonSenseQuestion } from '@/utils/economyCommonSensePractice'
import type { HistoryCommonSenseQuestion } from '@/utils/historyCommonSensePractice'
import type { IdiomRecognitionQuestion } from '@/utils/idiomRecognitionPractice'
import type { LegalCommonSenseQuestion } from '@/utils/legalCommonSensePractice'
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

export type ChinesePaperSource = 'generated' | 'review' | null

export type KeyPracticePayload =
  | { source: 'idiom-memorization'; questions: IdiomRecognitionQuestion[] }
  | { source: 'word-memorization'; questions: WordMemorizationQuestion[] }
  | { source: 'char-literacy'; questions: CharLiteracyQuestion[] }
  | { source: 'poetry-practice'; questions: PoetryRecognitionQuestion[] }
  | { source: 'classical-chinese'; questions: ClassicalChineseQuestion[] }
  | { source: 'rhetoric-usage'; questions: RhetoricUsageQuestion[] }
  | { source: ChineseReadingKeySource; questions: ReadingComprehensionQuestion[] }
  | { source: 'common-sense'; questions: CommonSenseQuestion[] }
  | { source: 'history-common-sense'; questions: HistoryCommonSenseQuestion[] }
  | { source: 'party-history'; questions: PartyHistoryQuestion[] }
  | { source: 'theory-policy'; questions: TheoryPolicyQuestion[] }
  | { source: 'legal-common-sense'; questions: LegalCommonSenseQuestion[] }
  | { source: 'economy-common-sense'; questions: EconomyCommonSenseQuestion[] }

export type { ChineseKeyQuestionSource }
