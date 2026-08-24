export type DsaTestCase = {
  args: unknown[]
  expect: unknown
  label: string
}

export type DsaComplexityStep = {
  label: string
  expr: string
}

export type DsaComplexity = {
  steps: DsaComplexityStep[]
  total: string
  time: string
  spaceSteps: DsaComplexityStep[]
  spaceTotal: string
  space: string
  note?: string
}

export type DsaProblem = {
  id: string
  index: number
  title: string
  intro: string[]
  fileName: string
  functionName: string
  starter: string
  solution: string
  tests: DsaTestCase[]
  complexity: DsaComplexity
}

export type DsaSubCategory = {
  id: string
  name: string
  lead: string
  problems: DsaProblem[]
}

export type DsaCategory = {
  id: string
  name: string
  subs: DsaSubCategory[]
}
