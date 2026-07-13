import { onMounted, ref } from 'vue'
import { probeAiHealth, type AiProxyHealth } from '@/services/deepseek'

const health = ref<AiProxyHealth | null>(null)
const checking = ref(false)

export function useAiProxyHealth() {
  async function refresh(force = false) {
    checking.value = true
    try {
      health.value = await probeAiHealth(force)
    } finally {
      checking.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  return {
    health,
    checking,
    refresh,
  }
}
