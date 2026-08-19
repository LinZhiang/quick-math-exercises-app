# src/composables

每个 `useXxxTest` 对应一种练习面板的出题/提交/错题逻辑。目录与 `src/utils` 对齐：

- `app/` 壳层（标题栏、PWA、拖拽、对话）
- `chinese/` `data-analysis/` `logic/` `math/` `computer/`

页面不要把出题流程写在超长 `index.vue` 里，优先改对应 composable。
