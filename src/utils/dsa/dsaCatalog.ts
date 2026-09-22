import { ref } from 'vue'
import { pickGlobExport } from '@/utils/app/loadOptionalModule'
import { readWenguJsonResponse, wenguApiFetch } from '@/utils/computer/wenguApiFetch'
import type { DsaCategory, DsaComplexity, DsaProblem, DsaSubCategory, DsaTestCase } from '@/utils/dsa/dsaTypes'

export type { DsaCategory, DsaProblem, DsaSubCategory, DsaTestCase }

export const DSA_MODULE_TITLE = '编程题练习'

export const dsaCatalogTick = ref(0)
export const dsaCatalogReady = ref(false)
export const dsaCatalogHint = ref('')

const packed = import.meta.glob('./problems/*.ts', { eager: true })

function isTest(row: unknown): row is DsaTestCase {
  if (!row || typeof row !== 'object') return false
  const o = row as Record<string, unknown>
  return Array.isArray(o.args) && typeof o.label === 'string' && 'expect' in o
}

function isComplexity(row: unknown): row is DsaComplexity {
  if (!row || typeof row !== 'object') return false
  const o = row as Record<string, unknown>
  return (
    Array.isArray(o.steps) &&
    typeof o.total === 'string' &&
    typeof o.time === 'string' &&
    Array.isArray(o.spaceSteps) &&
    typeof o.spaceTotal === 'string' &&
    typeof o.space === 'string'
  )
}

function isProblem(row: unknown): row is DsaProblem {
  if (!row || typeof row !== 'object') return false
  const o = row as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    Array.isArray(o.intro) &&
    typeof o.fileName === 'string' &&
    typeof o.functionName === 'string' &&
    typeof o.starter === 'string' &&
    typeof o.solution === 'string' &&
    Array.isArray(o.tests) &&
    o.tests.every(isTest) &&
    isComplexity(o.complexity)
  )
}

export function normalizeDsaProblems(raw: unknown): DsaProblem[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(isProblem).map((p, i) => ({
    ...p,
    index: Number(p.index) > 0 ? Number(p.index) : i + 1,
    intro: p.intro.map((s) => String(s)),
  }))
}

function makeCategories(iteration: DsaProblem[], recursion: DsaProblem[]): DsaCategory[] {
  return [
    {
      id: 'complexity',
      name: '复杂度分析',
      subs: [
        {
          id: 'iteration',
          name: '迭代',
          lead: '用循环反复执行同一段逻辑。编辑区只保留函数签名和目的，请自己补全方法体。',
          problems: iteration,
        },
        {
          id: 'recursion',
          name: '递归',
          lead: '函数调用自身：先递到终止条件，再归并结果。编辑区只保留函数签名和目的，请自己补全方法体。',
          problems: recursion,
        },
      ],
    },
  ]
}

export function countDsaProblems(cats: DsaCategory[] = DSA_CATEGORIES) {
  return cats.reduce((n, c) => n + c.subs.reduce((m, s) => m + s.problems.length, 0), 0)
}

export const DSA_CATEGORIES: DsaCategory[] = makeCategories(
  pickGlobExport<DsaProblem[]>(packed, 'ITERATION_PROBLEMS', []),
  pickGlobExport<DsaProblem[]>(packed, 'RECURSION_PROBLEMS', []),
)

function problemsOf(subId: string): DsaProblem[] {
  return DSA_CATEGORIES.flatMap((c) => c.subs).find((s) => s.id === subId)?.problems ?? []
}

function applyProblems(iteration: DsaProblem[], recursion: DsaProblem[]) {
  const next = makeCategories(iteration, recursion)
  const nextCount = countDsaProblems(next)
  if (!nextCount) return
  if (nextCount < countDsaProblems() && countDsaProblems()) return
  DSA_CATEGORIES.splice(0, DSA_CATEGORIES.length, ...next)
  dsaCatalogTick.value += 1
}

type Pack = {
  ok?: boolean
  iteration?: unknown
  recursion?: unknown
  count?: number
  message?: string
}

let hydratePromise: Promise<void> | null = null

export function hydrateDsaCatalog(): Promise<void> {
  if (hydratePromise) return hydratePromise
  hydratePromise = (async () => {
    try {
      const res = await wenguApiFetch('/api/dsa/bank', { cacheBust: true })
      const data = await readWenguJsonResponse<Pack>(res)
      const iteration = normalizeDsaProblems(data.iteration)
      const recursion = normalizeDsaProblems(data.recursion)
      if (iteration.length || recursion.length) {
        applyProblems(
          iteration.length ? iteration : problemsOf('iteration'),
          recursion.length ? recursion : problemsOf('recursion'),
        )
        dsaCatalogHint.value = ''
      } else if (!countDsaProblems()) {
        dsaCatalogHint.value =
          data.message ||
          '云端还没有编程题。在已保存题目的电脑上执行 npm run sync:cf-dsa，刷新后即可练习。'
      }
    } catch {
      if (!countDsaProblems()) {
        dsaCatalogHint.value = '暂时读不到云端题目，请稍后刷新。'
      }
    } finally {
      dsaCatalogReady.value = true
      dsaCatalogTick.value += 1
    }
  })().finally(() => {
    hydratePromise = null
  })
  return hydratePromise
}

const SUB_ALIASES: Record<string, string> = {
  'iteration-recursion': 'iteration',
}

export const DSA_LANG_TABS = ['TS'] as const

export function findDsaCategory(id: string) {
  void dsaCatalogTick.value
  return DSA_CATEGORIES.find((c) => c.id === id) ?? null
}

export function findDsaSub(categoryId: string, subId: string) {
  void dsaCatalogTick.value
  const cat = findDsaCategory(categoryId)
  if (!cat) return null
  const resolved = SUB_ALIASES[subId] ?? subId
  const sub = cat.subs.find((s) => s.id === resolved) ?? null
  if (!sub) return null
  return { cat, sub }
}

export function findDsaProblem(categoryId: string, subId: string, problemId: string) {
  void dsaCatalogTick.value
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
