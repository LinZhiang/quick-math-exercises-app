/**
 * 前端调用示例（演示用，不参与业务打包入口）。
 * 复制到组件 / 控制台即可试验；切勿把真实图片 URL 提交进仓库。
 */
import {
  aiChatCompletion,
  aiChatCompletionStream,
  assertVisionAllowed,
  getAiProvider,
  setAiProvider,
  type AiMessage,
} from '@/services/ai'

/** ① DeepSeek 文本出题（默认 provider，或显式指定） */
export async function exampleDeepseekTextMcq(): Promise<string> {
  setAiProvider('deepseek')
  return aiChatCompletion(
    [
      {
        role: 'system',
        content: '你是语文出题助手，只输出合法 JSON。',
      },
      {
        role: 'user',
        content: '出一道「下列词语有错别字的是」四选一，返回 stem/correct/distractors/explanation。',
      },
    ],
    { provider: 'deepseek', capability: 'text', temperature: 0.35 },
  )
}

/** ② 豆包文本（复用同一套 messages / prompt，仅换 provider） */
export async function exampleDoubaoTextMcq(): Promise<string> {
  setAiProvider('doubao')
  return aiChatCompletion(
    [
      {
        role: 'system',
        content: '你是语文出题助手，只输出合法 JSON。',
      },
      {
        role: 'user',
        content: '出一道「下列词语有错别字的是」四选一，返回 stem/correct/distractors/explanation。',
      },
    ],
    { provider: 'doubao', capability: 'text', temperature: 0.35 },
  )
}

/**
 * ③ 豆包图形推理 / 识图（vision）
 * DeepSeek 下会抛「当前模型不支持图像生成/识图」
 */
export async function exampleDoubaoVisionGraphic(imageDataUrlOrHttps: string): Promise<string> {
  const provider = getAiProvider()
  assertVisionAllowed(provider) // deepseek → 抛错，前端可 ElMessage.warning

  const messages: AiMessage[] = [
    {
      role: 'system',
      content: '你是图形推理教练。根据图片说明规律，并给出最可能选项（A/B/C/D）。',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: '请分析这道图形推理题，说明规律与答案。' },
        {
          type: 'image_url',
          image_url: { url: imageDataUrlOrHttps },
        },
      ],
    },
  ]

  return aiChatCompletion(messages, {
    provider: 'doubao',
    capability: 'vision',
    temperature: 0.2,
    maxTokens: 2048,
  })
}

/** ④ 流式（透传 SSE，需自行读 body） */
export async function exampleDoubaoStream(): Promise<void> {
  const res = await aiChatCompletionStream(
    [{ role: 'user', content: '用一句话介绍变本加厉。' }],
    { provider: 'doubao', capability: 'text' },
  )
  // eslint-disable-next-line no-console
  console.log('stream content-type', res.headers.get('content-type'))
  // const reader = res.body?.getReader() ...
}
