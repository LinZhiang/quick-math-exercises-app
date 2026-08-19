/**
 * 按领域把 utils / composables / mental-math 组件挪到子目录，并改写全库引用。
 * 可安全重跑：目标已在子目录里则跳过搬家。
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

const LOGIC_UTILS = [
  'translationReasonPractice',
  'comboArrangePractice',
  'truthFalsePractice',
  'evalReasonPractice',
  'strengthenReasonPractice',
  'weakenReasonPractice',
  'dailyConclusionPractice',
  'explainPhenomPractice',
  'graphicReasoningPractice',
]

const APP_UTILS = new Set([
  'aiJsonParse',
  'aiProviderStore',
  'appNavigation',
  'appUiSettings',
  'deepseekApiKeyStore',
  'userDataBackup',
  'practiceCompletionStats',
  'practiceSessionLog',
  'strategyGuideNotes',
  'wrongBookOverlayLock',
  'wrongBookReviewStats',
  'wrongBookWorkspaceGate',
  'qb-perfect-sound',
  'qb-perfect-sound.lite',
])

const CHINESE_PREFIXES = [
  'chinese',
  'idiom',
  'poetry',
  'poet',
  'readingComprehension',
  'rhetoric',
  'shortenSentence',
  'hanzi',
  'wenyan',
  'grammarJudgment',
  'charLiteracy',
  'vocabRelated',
  'currentAffairs',
  'geographyCommon',
  'historyCommon',
  'partyHistory',
  'theoryPolicy',
  'legalCommon',
  'economyCommon',
  'economySense',
  'lifeCommon',
  'lifeSense',
  'whatIsThis',
  'systemMgmt',
  'factDeepen',
  'factExplanation',
  'circleGrammar',
  'classicalChinese',
  'wordMemorization',
  'memorizationWrong',
]

const APP_COMPOSABLES = new Set([
  'useAppChrome',
  'usePwaInstall',
  'useTouchPointerDrag',
  'useDeepseekConversation',
  'usePersonalBankQuiz',
  'useFactDeepenMemorization',
])

const LOGIC_COMPOSABLES = new Set([
  'useTranslationReasonTest',
  'useComboArrangeTest',
  'useTruthFalseTest',
  'useEvalReasonTest',
  'useStrengthenReasonTest',
  'useWeakenReasonTest',
  'useDailyConclusionTest',
  'useExplainPhenomTest',
])

const CHINESE_COMPOSABLES_EXTRA = new Set([
  'useVocabRelatedLearning',
  'useCharLiteracyRelatedLearning',
])

const LOGIC_PANELS = new Set([
  'TranslationReasonPanel',
  'ComboArrangePanel',
  'TruthFalsePanel',
  'EvalReasonPanel',
  'StrengthenReasonPanel',
  'WeakenReasonPanel',
  'DailyConclusionPanel',
  'ExplainPhenomPanel',
])

const CHINESE_PANELS = new Set([
  'CircleGrammarPanel',
  'ShortenSentencePanel',
  'SystemMgmtMindmapButton',
])

const SHARED_PANELS = new Set([
  'MentalMathFavoriteButton',
  'MentalMathPracticeGuide',
  'MentalMathWrongBookPanel',
  'PracticeCompletionStat',
  'PracticeSessionLogPanel',
  'WrongBookImmersivePreview',
  'WrongBookReviewStat',
  'FactDeepenMemorizationPanel',
])

function utilStem(filename) {
  return filename.replace(/\.ts$/, '').replace(/\.json$/, '')
}

function classifyUtil(stem) {
  if (stem.startsWith('dataAnalysis')) return 'data-analysis'
  if (stem.startsWith('computer') || stem.startsWith('wengu')) return 'computer'
  if (stem.startsWith('personalBank') || stem === 'personalQuestionBank') return 'personal-bank'
  if (stem.startsWith('markdown') || stem === 'richTextHtml') return 'markdown'
  if (LOGIC_UTILS.some((p) => stem === p || stem.startsWith(p))) return 'logic'
  if (APP_UTILS.has(stem)) return 'app'
  if (CHINESE_PREFIXES.some((p) => stem === p || stem.startsWith(p))) return 'chinese'
  return 'math'
}

function classifyComposable(stem) {
  if (stem.startsWith('useChinese') || CHINESE_COMPOSABLES_EXTRA.has(stem)) return 'chinese'
  if (stem.startsWith('useDataAnalysis')) return 'data-analysis'
  if (stem.startsWith('useComputer')) return 'computer'
  if (APP_COMPOSABLES.has(stem)) return 'app'
  if (LOGIC_COMPOSABLES.has(stem)) return 'logic'
  return 'math'
}

function classifyPanel(stem) {
  if (stem.startsWith('DataAnalysis')) return 'data-analysis'
  if (LOGIC_PANELS.has(stem)) return 'logic'
  if (CHINESE_PANELS.has(stem)) return 'chinese'
  if (SHARED_PANELS.has(stem) || stem.startsWith('MentalMath') || stem.startsWith('Practice') || stem.startsWith('WrongBook')) {
    return 'shared'
  }
  return 'math'
}

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue
    const full = path.join(dir, name)
    const st = fs.statSync(full)
    if (st.isDirectory()) walkFiles(full, acc)
    else acc.push(full)
  }
  return acc
}

function moveIfNeeded(from, to) {
  if (!fs.existsSync(from)) return false
  if (path.resolve(from) === path.resolve(to)) return false
  fs.mkdirSync(path.dirname(to), { recursive: true })
  if (fs.existsSync(to)) {
    console.warn('skip existing', path.relative(root, to))
    return false
  }
  fs.renameSync(from, to)
  return true
}

const utilMap = new Map() // stem -> category
const utilsDir = path.join(root, 'src/utils')
for (const name of fs.readdirSync(utilsDir)) {
  const full = path.join(utilsDir, name)
  if (!fs.statSync(full).isFile()) continue
  if (!/\.(ts|json)$/.test(name)) continue
  const stem = utilStem(name)
  const cat = classifyUtil(stem)
  utilMap.set(stem, cat)
  moveIfNeeded(full, path.join(utilsDir, cat, name))
}

const composableMap = new Map()
const composablesDir = path.join(root, 'src/composables')
for (const name of fs.readdirSync(composablesDir)) {
  const full = path.join(composablesDir, name)
  if (!fs.statSync(full).isFile() || !name.endsWith('.ts')) continue
  const stem = name.replace(/\.ts$/, '')
  const cat = classifyComposable(stem)
  composableMap.set(stem, cat)
  moveIfNeeded(full, path.join(composablesDir, cat, name))
}

const panelMap = new Map()
const panelsDir = path.join(root, 'src/views/tools/mental-math/components')
for (const name of fs.readdirSync(panelsDir)) {
  const full = path.join(panelsDir, name)
  if (!fs.statSync(full).isFile() || !name.endsWith('.vue')) continue
  const stem = name.replace(/\.vue$/, '')
  const cat = classifyPanel(stem)
  panelMap.set(stem, cat)
  moveIfNeeded(full, path.join(panelsDir, cat, name))
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 长 id 优先，避免短名误伤 */
function applyMap(text, prefix, map, suffix = '') {
  const keys = [...map.keys()].sort((a, b) => b.length - a.length)
  let out = text
  for (const id of keys) {
    const cat = map.get(id)
    const from = `${prefix}${id}${suffix}`
    const to = `${prefix}${cat}/${id}${suffix}`
    out = out.split(from).join(to)
  }
  return out
}

function rewriteText(text) {
  let out = text
  out = applyMap(out, '@/utils/', utilMap)
  out = applyMap(out, '@/composables/', composableMap)
  out = applyMap(out, '@/views/tools/mental-math/components/', panelMap, '.vue')
  // 生成脚本里的磁盘路径
  out = applyMap(out, 'src/utils/', utilMap, '.ts')
  out = applyMap(out, 'src/utils/', utilMap, '.json')
  out = applyMap(out, 'src/composables/', composableMap, '.ts')
  out = applyMap(out, '../src/utils/', utilMap, '.ts')
  out = applyMap(out, '../src/utils/', utilMap, '.json')
  return out
}

const textExt = new Set(['.ts', '.vue', '.js', '.mjs', '.mts', '.md', '.json', '.css', '.html'])
let rewritten = 0
for (const file of walkFiles(root)) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  if (rel.startsWith('scripts/reorganize-src.mjs')) continue
  if (rel.startsWith('scripts/split-deepseek.mjs')) continue
  const ext = path.extname(file)
  if (!textExt.has(ext)) continue
  const before = fs.readFileSync(file, 'utf8')
  const after = rewriteText(before)
  if (after !== before) {
    fs.writeFileSync(file, after)
    rewritten++
  }
}

const vuePath = path.join(root, 'src/views/tools/mental-math/index.vue')
let vue = fs.readFileSync(vuePath, 'utf8')
if (vue.includes('<style scoped>') && !vue.includes('src="./mental-math-page.css"')) {
  const m = vue.match(/<style scoped>\r?\n([\s\S]*)<\/style>\s*$/)
  if (m) {
    fs.writeFileSync(path.join(root, 'src/views/tools/mental-math/mental-math-page.css'), m[1].replace(/\s+$/, '') + '\n')
    vue = vue.replace(/<style scoped>[\s\S]*<\/style>\s*$/, '<style scoped src="./mental-math-page.css"></style>\n')
  }
}
if (!vue.startsWith('<!--')) {
  vue =
    `<!--
  知识训练总壳（路由 /train/:section）。
  脚本负责切换题型与计时；具体出题/判分在 composables + utils；
  各题型面板按领域放在 components/{math,data-analysis,logic,chinese,shared}/。
-->
` + vue
}
fs.writeFileSync(vuePath, vue)

function writeReadme(dir, body) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'README.md'), body)
}

writeReadme(
  utilsDir,
  `# src/utils

练习与工具函数按领域分子目录，避免根下一两百个平铺文件。

| 目录 | 内容 |
| --- | --- |
| \`app/\` | 导航、主题、登录、备份、练习统计、音效 |
| \`chinese/\` | 语文出题、题库、错题存储 |
| \`computer/\` | 计算机基础树、讲义测验、温故 API |
| \`data-analysis/\` | 资料分析各考点 + 公式展示 |
| \`logic/\` | 逻辑判断、图形推理 |
| \`markdown/\` | Markdown / 富文本渲染 |
| \`math/\` | 数量关系、口算、舒尔特等 |
| \`personal-bank/\` | 个人题库导入与测验 |

引用示例：\`import { … } from '@/utils/math/mentalMathPractice'\`。
`,
)

writeReadme(
  composablesDir,
  `# src/composables

每个 \`useXxxTest\` 对应一种练习面板的出题/提交/错题逻辑。目录与 \`src/utils\` 对齐：

- \`app/\` 壳层（标题栏、PWA、拖拽、对话）
- \`chinese/\` \`data-analysis/\` \`logic/\` \`math/\` \`computer/\`

页面不要把出题流程写在超长 \`index.vue\` 里，优先改对应 composable。
`,
)

writeReadme(
  panelsDir,
  `# 知识训练面板

| 目录 | 内容 |
| --- | --- |
| \`shared/\` | 错题本、收藏、完成统计、攻略按钮 |
| \`math/\` | 数量关系 / 口算 / 舒尔特等 |
| \`data-analysis/\` | 资料分析 |
| \`logic/\` | 翻译、加强削弱、真假等 |
| \`chinese/\` | 圈病句、压缩、系统管理导图 |

新题型：先加 \`utils\` + \`composables\`，再在本目录对应分类下加 Panel。
`,
)

writeReadme(
  path.join(root, 'src/services'),
  `# src/services

- \`ai.ts\` 统一走 DeepSeek / 豆包
- \`deepseek.ts\` **对外入口**（re-export），页面只从这里 import
- \`aiQuizCore.ts\` 登录检测、对话、讲义测验
- \`quiz/\` 按学科拆开的出题 prompt 与解析
`,
)

const wenyanGen = path.join(root, 'scripts/generate-wenyan-xuci-jushi-banks.mjs')
if (fs.existsSync(wenyanGen)) {
  const t = fs.readFileSync(wenyanGen, 'utf8')
  const n = t.replace("from '@/utils/${typeImport}'", "from '@/utils/chinese/${typeImport}'")
  if (n !== t) fs.writeFileSync(wenyanGen, n)
}

console.log('reorganize done', {
  utils: utilMap.size,
  composables: composableMap.size,
  panels: panelMap.size,
  rewritten,
})
