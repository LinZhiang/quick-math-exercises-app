# src/services

- `ai.ts` 统一走 DeepSeek / 豆包
- `deepseek.ts` **对外入口**（re-export），页面只从这里 import
- `aiQuizCore.ts` 登录检测、对话、讲义测验
- `quiz/` 按学科拆开的出题 prompt 与解析
