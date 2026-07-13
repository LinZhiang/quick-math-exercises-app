import type { CharLiteracyQuestion } from '@/utils/charLiteracyPractice'
import type { CommonSenseQuestion } from '@/utils/commonSensePractice'
import type { IdiomRecognitionQuestion } from '@/utils/idiomRecognitionPractice'
import type { PoetryRecognitionQuestion } from '@/utils/poetryRecognitionPractice'
import type { ChineseKeyQuestionSource } from '@/constants/chinese-practice-tabs'

export type ChinesePaperSource = 'generated' | 'review' | null

export type KeyPracticePayload =
  | { source: 'word-memorization'; questions: IdiomRecognitionQuestion[] }
  | { source: 'char-literacy'; questions: CharLiteracyQuestion[] }
  | { source: 'poetry-practice'; questions: PoetryRecognitionQuestion[] }
  | { source: 'common-sense'; questions: CommonSenseQuestion[] }

export type { ChineseKeyQuestionSource }
