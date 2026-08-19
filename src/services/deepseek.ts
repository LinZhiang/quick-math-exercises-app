/**
 * AI 出题与对话的对外入口。
 *
 * 实现已按领域拆分，避免单文件过万行：
 * - `aiQuizCore.ts` 登录检测、对话、讲义测验
 * - `quiz/chineseMcq.ts` 语文
 * - `quiz/dataAnalysisMcq.ts` 资料分析
 * - `quiz/mathLogicMcq.ts` 数量与逻辑
 *
 * 现有代码继续 `import { … } from '@/services/deepseek'` 即可。
 */
export * from '@/services/aiQuizCore'
export * from '@/services/quiz/chineseMcq'
export * from '@/services/quiz/dataAnalysisMcq'
export * from '@/services/quiz/mathLogicMcq'
