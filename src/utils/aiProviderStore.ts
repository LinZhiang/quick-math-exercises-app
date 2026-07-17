/**
 * 手动切换 AI 上游：deepseek（默认）/ doubao
 * 不做自动降级，偏好持久化到 localStorage。
 */
import { ref } from 'vue'

export type AiProvider = 'doubao' | 'deepseek'
export type AiCapability = 'text' | 'vision'

const STORAGE_KEY = 'wengu-ai-provider-v1'
const DEFAULT_PROVIDER: AiProvider = 'deepseek'

export const AI_VISION_UNSUPPORTED_HINT = '当前模型不支持图像生成/识图'

export const aiProviderTick = ref(0)

function notify() {
  aiProviderTick.value += 1
}

function isProvider(v: unknown): v is AiProvider {
  return v === 'doubao' || v === 'deepseek'
}

export function getAiProvider(): AiProvider {
  void aiProviderTick.value
  if (typeof localStorage === 'undefined') return DEFAULT_PROVIDER
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (isProvider(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_PROVIDER
}

export function setAiProvider(provider: AiProvider): void {
  if (!isProvider(provider)) return
  try {
    localStorage.setItem(STORAGE_KEY, provider)
  } catch {
    /* ignore */
  }
  notify()
}

export function getAiProviderLabel(provider: AiProvider = getAiProvider()): string {
  return provider === 'doubao' ? '豆包 Seed-2.1-pro' : 'DeepSeek V4-Flash'
}

/** 进度条/短文案用短名 */
export function getAiProviderShortName(provider: AiProvider = getAiProvider()): string {
  return provider === 'doubao' ? '豆包' : 'DeepSeek'
}

/** 出题进度文案：正在向 xxx 请求… */
export function aiRequestProgressText(topic: string, provider?: AiProvider): string {
  return `正在向 ${getAiProviderShortName(provider)} 请求${topic}…`
}

/** vision 能力仅 doubao；deepseek 调用前应拦截并提示 */
export function providerSupportsVision(provider: AiProvider = getAiProvider()): boolean {
  return provider === 'doubao'
}

export function assertVisionAllowed(provider: AiProvider = getAiProvider()): void {
  if (!providerSupportsVision(provider)) {
    throw new Error(AI_VISION_UNSUPPORTED_HINT)
  }
}
