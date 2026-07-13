import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { deepseekChatConversation, type DeepSeekChatTurn } from '@/services/deepseek'

export type DeepSeekDisplayTurn = DeepSeekChatTurn & {
  label?: string
}

export function useDeepseekConversation(options: {
  resetKey: ComputedRef<string> | Ref<string>
}) {
  const apiHistory = ref<DeepSeekChatTurn[]>([])
  const displayTurns = ref<DeepSeekDisplayTurn[]>([])
  const systemPrompt = ref('')
  const loading = ref(false)
  const error = ref('')

  const hasStarted = computed(() => apiHistory.value.length > 0)

  function reset() {
    apiHistory.value = []
    displayTurns.value = []
    systemPrompt.value = ''
    error.value = ''
  }

  watch(
    () => options.resetKey.value,
    () => reset(),
  )

  async function start(input: {
    initialUser: string
    displayUser?: string
    system: string
    fetch: () => Promise<string>
    displayUserLabel?: string
    displayAssistantLabel?: string
  }) {
    error.value = ''
    loading.value = true
    try {
      systemPrompt.value = input.system
      const raw = (await input.fetch()).trim()
      if (!raw) throw new Error('DeepSeek 未返回有效内容')

      apiHistory.value = [
        { role: 'user', content: input.initialUser },
        { role: 'assistant', content: raw },
      ]

      const assistantTurn: DeepSeekDisplayTurn = {
        role: 'assistant',
        content: raw,
        label: input.displayAssistantLabel ?? '讲解',
      }
      const displayUser = input.displayUser?.trim()
      displayTurns.value = displayUser
        ? [
            {
              role: 'user',
              content: displayUser,
              label: input.displayUserLabel ?? '你的提问',
            },
            assistantTurn,
          ]
        : [assistantTurn]
    } catch (e) {
      error.value = e instanceof Error ? e.message : '请求失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function followup(userMessage: string, labels?: { user?: string; assistant?: string }) {
    const trimmed = userMessage.trim()
    if (!trimmed) throw new Error('请输入追问内容')
    if (!hasStarted.value) throw new Error('请先发起讲解')

    error.value = ''
    loading.value = true
    const prior = apiHistory.value.slice()
    try {
      const raw = await deepseekChatConversation({
        system: systemPrompt.value,
        history: prior,
        userMessage: trimmed,
      })
      const content = raw.trim()
      if (!content) throw new Error('DeepSeek 未返回有效内容')

      apiHistory.value = [
        ...prior,
        { role: 'user', content: trimmed },
        { role: 'assistant', content },
      ]
      displayTurns.value = [
        ...displayTurns.value,
        { role: 'user', content: trimmed, label: labels?.user ?? '你的追问' },
        { role: 'assistant', content, label: labels?.assistant ?? '回答' },
      ]
    } catch (e) {
      error.value = e instanceof Error ? e.message : '请求失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    apiHistory,
    displayTurns,
    loading,
    error,
    hasStarted,
    reset,
    start,
    followup,
  }
}
