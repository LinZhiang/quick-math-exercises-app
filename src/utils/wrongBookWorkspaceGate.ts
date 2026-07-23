import { computed, ref } from 'vue'

/** 错题本沉浸工作区是否打开（用于隐藏侧栏/其它模块，对齐四则运算答题态） */
const activeCount = ref(0)

export const wrongBookWorkspaceActive = computed(() => activeCount.value > 0)

export function enterWrongBookWorkspace() {
  activeCount.value += 1
}

export function leaveWrongBookWorkspace() {
  activeCount.value = Math.max(0, activeCount.value - 1)
}

export function resetWrongBookWorkspaceGate() {
  activeCount.value = 0
}
