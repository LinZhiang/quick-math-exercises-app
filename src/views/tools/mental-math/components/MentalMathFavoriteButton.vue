<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  isMentalMathFavoriteByInput,
  mentalMathFavoriteBookTick,
  toggleMentalMathFavorite,
} from '@/utils/mentalMathFavoriteBook'

const props = defineProps<{
  modeId: string
  expression: string
  correctAnswer: string | number
  options?: Array<string | number>
  explanation?: string
  /** 未提交前也可显示，默认仅建议在提交后使用 */
  disabled?: boolean
}>()

const favorited = ref(false)

function sync() {
  void mentalMathFavoriteBookTick.value
  favorited.value = isMentalMathFavoriteByInput({
    modeId: props.modeId,
    expression: props.expression,
    correctAnswer: props.correctAnswer,
  })
}

watch(
  () =>
    [
      props.modeId,
      props.expression,
      String(props.correctAnswer),
      mentalMathFavoriteBookTick.value,
    ] as const,
  sync,
  { immediate: true },
)

function onToggle() {
  if (props.disabled) return
  const r = toggleMentalMathFavorite({
    modeId: props.modeId,
    expression: props.expression,
    correctAnswer: props.correctAnswer,
    options: props.options,
    explanation: props.explanation,
  })
  if (r === 'skipped') {
    ElMessage.warning('当前题型暂不支持收藏')
    return
  }
  favorited.value = r === 'added'
  ElMessage.success(r === 'added' ? '已加入收藏' : '已取消收藏')
}

const label = computed(() => (favorited.value ? '已收藏' : '收藏'))
</script>

<template>
  <el-button size="small" plain :disabled="disabled" @click="onToggle">
    {{ label }}
  </el-button>
</template>
