import { highlightTs } from '@/utils/dsa/highlightTs'

export function highlightProjectCode(source: string): string {
  return highlightTs(source || '')
}

export function countProjectCodeLines(source: string): number {
  if (!source) return 1
  let n = 1
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === '\n') n += 1
  }
  return n
}
