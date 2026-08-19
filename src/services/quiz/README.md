# AI 出题模块

| 文件 | 内容 |
| --- | --- |
| `chineseMcq.ts` | 成语、诗词、诗人、时政、常识、字音字形、文言、修辞、阅读 |
| `dataAnalysisMcq.ts` | 资料分析各考点（多数强制豆包） |
| `mathLogicMcq.ts` | 几何 / 概率 / 函数图 / 逻辑判断 |

底层对话在 `../aiQuizCore.ts`。页面不要直接 import 本目录，统一走 `@/services/deepseek`。
