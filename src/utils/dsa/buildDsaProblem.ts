import type { DsaComplexity, DsaProblem, DsaTestCase } from '@/utils/dsa/dsaTypes'

/** 编辑区只留签名 + 目的；方法体清空，光标落在函数体缩进处。 */
export const DSA_BODY_INDENT = '    '

export function buildDsaProblem(input: {
  id: string
  title: string
  intro: string[]
  fileName: string
  functionName: string
  header: string
  signature: string
  purpose: string
  solution: string
  tests: DsaTestCase[]
  complexity: DsaComplexity
}): Omit<DsaProblem, 'index'> {
  const { header, signature, purpose, ...rest } = input
  return {
    ...rest,
    starter: `${header}\n${signature} {\n${DSA_BODY_INDENT}// 目的：${purpose}\n${DSA_BODY_INDENT}\n}\n`,
  }
}

/** 光标停在目的注释下一行的缩进之后，方便直接写实现。 */
export function starterBodyCursor(starter: string) {
  const hit = /\/\/[^\n]*\n/.exec(starter)
  if (!hit || hit.index == null) return starter.length
  const lineStart = hit.index + hit[0].length
  const indent = starter.slice(lineStart).match(/^[ \t]*/)?.[0] ?? ''
  return lineStart + indent.length
}

export function indexProblems(list: Omit<DsaProblem, 'index'>[]): DsaProblem[] {
  return list.map((p, i) => ({ ...p, index: i + 1 }))
}

export function casesFrom<T>(
  values: T[],
  expect: (value: T) => unknown,
  label: (value: T) => string,
  args: (value: T) => unknown[] = (value) => [value],
): DsaTestCase[] {
  return values.map((value) => ({
    args: args(value),
    expect: expect(value),
    label: label(value),
  }))
}
