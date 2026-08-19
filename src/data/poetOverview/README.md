# 诗人速览资料

每个文件是一位诗人（或乐府专题）的应试背诵卡片。

- **登记入口**：`bank.ts`（按唐朝 / 宋朝 / 其它朝代汇总）
- **类型**：`@/utils/chinese/poetOverviewTypes`
- **时期列表**：`tangGuide.ts` / `songGuide.ts` / `otherGuide.ts`

新增诗人：复制现有档案 → 在 `bank.ts` 对应朝代数组里登记。不要改练习 UI，面板读的是 `POET_OVERVIEW_BANK`。
