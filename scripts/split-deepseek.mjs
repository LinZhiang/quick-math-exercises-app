/**
 * 把 src/services/deepseek.ts 拆成：核心对话 + 语文/资料分析/数量逻辑 三个出题模块。
 * 旧入口 `@/services/deepseek` 仍 re-export，调用方不用改。
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const srcPath = path.join(root, 'src/services/deepseek.ts')
const srcText = fs.readFileSync(srcPath, 'utf8')
if (!srcText.includes('const IDIOM_SYSTEM')) {
  console.error('deepseek.ts 已拆分，跳过。如需重跑请从 git 恢复该文件。')
  process.exit(1)
}
const lines = srcText.split(/\n/)

const CORE_END = 654 // 0-based: through deepseekChatConversation
const CHINESE_END = 3731 // exclusive; next line is DATA_ANALYSIS_PERCENT_SYSTEM
const DA_END = 8109 // exclusive; next is requestGeometryMcqs block start ~8110

function slice(from, to) {
  return lines.slice(from, to).join('\n').replace(/\s+$/, '') + '\n'
}

const quizDir = path.join(root, 'src/services/quiz')
fs.mkdirSync(quizDir, { recursive: true })

const core = `/**
 * AI 对话与出题共用底层。
 * 页面请继续从 \`@/services/deepseek\` 引入；不要直接依赖本文件里的未导出细节。
 */
import { parseAiJsonArrayLenient, parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/aiJsonParse'
import { CHINESE_MCQ_CORRECTNESS_RULES } from '@/utils/chineseMcqAiFields'
import { hasStoredDeepSeekApiKey } from '@/utils/deepseekApiKeyStore'
import {
  isWenguApiReadyForCurrentUser,
  isWenguLoggedIn,
  WENGU_LOGIN_REQUIRED_HINT,
  wenguAuthTick,
} from '@/utils/wenguAuthStore'
import { WENGU_MEMBER_CUSTOM_API_HINT } from '@/utils/wenguApiOrigin'
import { aiChatCompletion, type AiMessage } from '@/services/ai'
import { aiRequestProgressText, getAiProvider, type AiProvider } from '@/utils/aiProviderStore'

${slice(457, CORE_END + 1)}

/** 近期已练词语，生成新题时避开 */
export function normalizeAvoidTerm(term: string): string {
  return term.trim().replace(/\\s+/g, '')
}

export function buildAvoidTermsHint(label: string, terms: string[]): string {
  const unique = [...new Set(terms.map(normalizeAvoidTerm).filter(Boolean))]
  if (!unique.length) return ''
  return \`\\n【禁止重复】以下\${label}近期已练过，本批**一律不得**再出（含近义换题干）：\${unique.join('、')}\`
}

`

// Export deepseekChatRaw: currently it's `async function`, need to change to export in the sliced core.
const coreFixed = core
  .replace('async function deepseekChatCompletion(', 'export async function deepseekChatCompletion(')
  .replace('async function deepseekChatRaw(', 'export async function deepseekChatRaw(')

fs.writeFileSync(path.join(root, 'src/services/aiQuizCore.ts'), coreFixed)

const sharedImport = `import { buildAvoidTermsHint, deepseekChatRaw, normalizeAvoidTerm } from '@/services/aiQuizCore'
`

const origImports = slice(0, 456)

function moduleBanner(title) {
  return `/**
 * ${title}
 * 由 scripts/split-deepseek.mjs 从 deepseek.ts 拆出。对外仍从 @/services/deepseek 导出。
 */
`
}

let chineseBody = slice(655, CHINESE_END)
chineseBody = chineseBody.replace(
  /function normalizeAvoidTerm\(term: string\): string \{[\s\S]*?^function dedupeQuestions\(/m,
  'function dedupeQuestions(',
)

fs.writeFileSync(
  path.join(quizDir, 'chineseMcq.ts'),
  moduleBanner('语文类 AI 出题（成语、诗词、常识、阅读等）') + origImports + sharedImport + chineseBody,
)

fs.writeFileSync(
  path.join(quizDir, 'dataAnalysisMcq.ts'),
  moduleBanner('资料分析 AI 出题（增长、比重、平均数、倍数、指数、拉动、顺差）') +
    origImports +
    sharedImport +
    slice(CHINESE_END, DA_END),
)

fs.writeFileSync(
  path.join(quizDir, 'mathLogicMcq.ts'),
  moduleBanner('数量关系 / 逻辑判断 AI 出题（几何、概率、函数图、翻译/加强削弱等）') +
    origImports +
    sharedImport +
    slice(DA_END),
)

fs.writeFileSync(
  path.join(root, 'src/services/deepseek.ts'),
  `/**
 * AI 出题与对话的对外入口。
 *
 * 实现已按领域拆分，避免单文件过万行：
 * - \`aiQuizCore.ts\` 登录检测、对话、讲义测验
 * - \`quiz/chineseMcq.ts\` 语文
 * - \`quiz/dataAnalysisMcq.ts\` 资料分析
 * - \`quiz/mathLogicMcq.ts\` 数量与逻辑
 *
 * 现有代码继续 \`import { … } from '@/services/deepseek'\` 即可。
 */
export * from '@/services/aiQuizCore'
export * from '@/services/quiz/chineseMcq'
export * from '@/services/quiz/dataAnalysisMcq'
export * from '@/services/quiz/mathLogicMcq'
`,
)

fs.writeFileSync(
  path.join(quizDir, 'README.md'),
  `# AI 出题模块

| 文件 | 内容 |
| --- | --- |
| \`chineseMcq.ts\` | 成语、诗词、诗人、时政、常识、字音字形、文言、修辞、阅读 |
| \`dataAnalysisMcq.ts\` | 资料分析各考点（多数强制豆包） |
| \`mathLogicMcq.ts\` | 几何 / 概率 / 函数图 / 逻辑判断 |

底层对话在 \`../aiQuizCore.ts\`。页面不要直接 import 本目录，统一走 \`@/services/deepseek\`。
`,
)

console.log('split done', {
  chinese: chineseBody.split('\n').length,
  da: DA_END - CHINESE_END,
  math: lines.length - DA_END,
})
