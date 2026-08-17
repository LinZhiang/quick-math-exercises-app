import { computed, onUnmounted, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'

const overrideTitle = ref('')

export const appChromeTitleOverride = computed(() => overrideTitle.value)

export function setAppChromeTitle(title: string) {
  overrideTitle.value = title
}

export function useAppChromeTitle(title: MaybeRefOrGetter<string>) {
  watch(
    () => toValue(title),
    (next) => {
      overrideTitle.value = next
    },
    { immediate: true },
  )
  onUnmounted(() => {
    overrideTitle.value = ''
  })
}
