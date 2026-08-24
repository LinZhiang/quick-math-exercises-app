import { ITERATION_PROBLEMS } from '@/utils/dsa/problems/iteration'
import { RECURSION_PROBLEMS } from '@/utils/dsa/problems/recursion'
import type { DsaCategory, DsaProblem, DsaSubCategory, DsaTestCase } from '@/utils/dsa/dsaTypes'

export type { DsaCategory, DsaProblem, DsaSubCategory, DsaTestCase }

export const DSA_CATEGORIES: DsaCategory[] = [
  {
    id: 'complexity',
    name: '复杂度分析',
    subs: [
      {
        id: 'iteration',
        name: '迭代',
        lead: '用循环反复执行同一段逻辑。编辑区只保留函数签名和目的，请自己补全方法体。',
        problems: ITERATION_PROBLEMS,
      },
      {
        id: 'recursion',
        name: '递归',
        lead: '函数调用自身：先递到终止条件，再归并结果。编辑区只保留函数签名和目的，请自己补全方法体。',
        problems: RECURSION_PROBLEMS,
      },
    ],
  },
]

const SUB_ALIASES: Record<string, string> = {
  'iteration-recursion': 'iteration',
}

export const DSA_LANG_TABS = ['TS'] as const

export function findDsaCategory(id: string) {
  return DSA_CATEGORIES.find((c) => c.id === id) ?? null
}

export function findDsaSub(categoryId: string, subId: string) {
  const cat = findDsaCategory(categoryId)
  if (!cat) return null
  const resolved = SUB_ALIASES[subId] ?? subId
  const sub = cat.subs.find((s) => s.id === resolved) ?? null
  if (!sub) return null
  return { cat, sub }
}

export function findDsaProblem(categoryId: string, subId: string, problemId: string) {
  const hit = findDsaSub(categoryId, subId)
  if (!hit) return null
  const problem = hit.sub.problems.find((p) => p.id === problemId) ?? null
  if (problem) return { ...hit, problem }
  if (subId === 'iteration-recursion') {
    const recursion = findDsaSub(categoryId, 'recursion')
    const fromRecursion = recursion?.sub.problems.find((p) => p.id === problemId) ?? null
    if (recursion && fromRecursion) return { ...recursion, problem: fromRecursion }
  }
  return null
}
