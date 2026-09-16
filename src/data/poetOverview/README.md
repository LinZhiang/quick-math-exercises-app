# 诗人速览资料（本机档案，正文不进公开仓库）

每个文件是一位诗人（或乐府专题）的应试背诵卡片。仓库只保留登记入口和时期 ID。

- **登记入口**：`bank.ts`（用 glob 加载本机 `*.ts` 档案）
- **类型**：`@/utils/chinese/poetOverviewTypes`
- **时期列表**：`tangGuide.ts` / `songGuide.ts` / `otherGuide.ts`

新增诗人：在本机新增档案文件即可，`bank.ts` 会自动收进。不要改练习 UI。
