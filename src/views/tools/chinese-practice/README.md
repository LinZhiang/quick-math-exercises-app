# 语文练习界面

`ChinesePracticeSection.vue` 是 tab 壳，路由仍走知识训练 `/train/chinese`。

| 文件前缀 | 内容 |
| --- | --- |
| `ChineseIdiom*` / `ChineseWord*` / `ChineseChar*` | 成语、词语、字音字形 |
| `ChinesePoetry*` / `ChinesePoet*` | 诗词练习、诗人速览 |
| `Chinese*CommonSense*` / `ChineseParty*` / `ChineseTheory*` / `ChineseLegal*` / `ChineseEconomy*` | 常识类 |
| `ChineseClassical*` / `ChineseRhetoric*` / `ChineseReading*` | 文言、修辞、阅读 |
| `ChineseCurrentAffairs*` / `ChineseKeyQuestions*` | 时政、关键题 |
| `*RelatedLearningDialog.vue` | 词语/汉字关联学习弹层 |
| `MemorizationWrongBookPanel.vue` | 识记错题本 |

出题与错题逻辑在 `src/composables/chinese/`，不要把 AI prompt 写进这些 Vue 文件。
