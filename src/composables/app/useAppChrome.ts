import { computed, onUnmounted, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'

const overrideTitle = ref('')
const chromeHidden = ref(false)

export const appChromeTitleOverride = computed(() => overrideTitle.value)
export const appChromeHidden = computed(() => chromeHidden.value)

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

export function useAppChromeHidden(hidden: MaybeRefOrGetter<boolean>) {
  watch(
    () => toValue(hidden),
    (next) => {
      chromeHidden.value = Boolean(next)
    },
    { immediate: true },
  )
  onUnmounted(() => {
    chromeHidden.value = false
  })
}
