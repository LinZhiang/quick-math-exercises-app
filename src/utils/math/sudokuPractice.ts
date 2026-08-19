export type SudokuMode = 'sudoku-easy' | 'sudoku-hard'

export type SudokuModeConfig = {
  id: SudokuMode
  label: string
  durationSec: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  timeCorrectBonusSec: number
  timeWrongPenaltySec: number
  size: 5 | 9
  blankCount: number
  desc: string
}

export type SudokuQuestion = {
  id: number
  size: 5 | 9
  puzzle: number[][]
  solution: number[][]
  blankCells: { row: number; col: number }[]
  prompt: string
}

export const SUDOKU_MODES: SudokuModeConfig[] = [
  {
    id: 'sudoku-easy',
    label: '简单模式',
    durationSec: 90,
    correctDelta: 40,
    wrongDelta: -60,
    maxScore: 100,
    timeCorrectBonusSec: 10,
    timeWrongPenaltySec: 20,
    size: 5,
    blankCount: 8,
    desc: '1 分 30 秒 · 5×5 格、挖 8 空 · 拖拽填数 · 对 +40 / 错 -60 · 对 +10 秒 / 错 -20 秒',
  },
  {
    id: 'sudoku-hard',
    label: '高难模式',
    durationSec: 150,
    correctDelta: 40,
    wrongDelta: -60,
    maxScore: 100,
    timeCorrectBonusSec: 10,
    timeWrongPenaltySec: 20,
    size: 9,
    blankCount: 13,
    desc: '2 分 30 秒 · 9×9 格、挖 13 空 · 拖拽填数 · 对 +40 / 错 -60 · 对 +10 秒 / 错 -20 秒',
  },
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row])
}

function generateLatinSquare(size: number): number[][] {
  let grid = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => ((row + col) % size) + 1),
  )

  const symbols = shuffle(Array.from({ length: size }, (_, i) => i + 1))
  grid = grid.map((row) => row.map((v) => symbols[v - 1]))

  const rowOrder = shuffle(Array.from({ length: size }, (_, i) => i))
  grid = rowOrder.map((r) => grid[r])

  const colOrder = shuffle(Array.from({ length: size }, (_, i) => i))
  grid = grid.map((row) => colOrder.map((c) => row[c]))

  return grid
}

function isValidSudokuPlacement(grid: number[][], row: number, col: number, n: number): boolean {
  const size = grid.length
  const box = Math.sqrt(size)

  for (let c = 0; c < size; c++) {
    if (grid[row][c] === n) return false
  }
  for (let r = 0; r < size; r++) {
    if (grid[r][col] === n) return false
  }
  const br = Math.floor(row / box) * box
  const bc = Math.floor(col / box) * box
  for (let r = br; r < br + box; r++) {
    for (let c = bc; c < bc + box; c++) {
      if (grid[r][c] === n) return false
    }
  }
  return true
}

function fillSudokuGrid(grid: number[][]): boolean {
  const size = grid.length

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] !== 0) continue

      const nums = shuffle(Array.from({ length: size }, (_, i) => i + 1))
      for (const n of nums) {
        if (!isValidSudokuPlacement(grid, row, col, n)) continue
        grid[row][col] = n
        if (fillSudokuGrid(grid)) return true
        grid[row][col] = 0
      }
      return false
    }
  }
  return true
}

function generateCompleteGrid(size: 5 | 9): number[][] {
  if (size === 5) {
    return generateLatinSquare(size)
  }
  const grid = Array.from({ length: size }, () => Array(size).fill(0))
  fillSudokuGrid(grid)
  return grid
}

function pickBlankCells(size: number, blankCount: number): { row: number; col: number }[] {
  const all = Array.from({ length: size * size }, (_, i) => ({
    row: Math.floor(i / size),
    col: i % size,
  }))
  return shuffle(all).slice(0, blankCount)
}

/** 某行/列/宫只有 1 个空时可直接填出，过于简单 */
function hasSingletonLineBlanks(
  blankCells: { row: number; col: number }[],
  size: number,
): boolean {
  const rowCounts = new Array(size).fill(0)
  const colCounts = new Array(size).fill(0)
  for (const { row, col } of blankCells) {
    rowCounts[row]++
    colCounts[col]++
  }
  if (rowCounts.some((c) => c === 1) || colCounts.some((c) => c === 1)) return true

  if (size === 9) {
    const boxCounts = new Array(9).fill(0)
    for (const { row, col } of blankCells) {
      boxCounts[Math.floor(row / 3) * 3 + Math.floor(col / 3)]++
    }
    if (boxCounts.some((c) => c === 1)) return true
  }

  return false
}

const lineCountVectorCache = new Map<string, number[][]>()

function validLineCountVectors(size: number, total: number): number[][] {
  const key = `${size}:${total}`
  const cached = lineCountVectorCache.get(key)
  if (cached) return cached

  const out: number[][] = []
  const dfs = (idx: number, remaining: number, cur: number[]) => {
    if (idx === size) {
      if (remaining === 0) out.push([...cur])
      return
    }
    const maxHere = Math.min(size, remaining)
    for (let n = 0; n <= maxHere; n++) {
      if (n === 1) continue
      dfs(idx + 1, remaining - n, [...cur, n])
    }
  }
  dfs(0, total, [])
  lineCountVectorCache.set(key, out)
  return out
}

function boxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3)
}

function greedyMatchBlanks(
  rowTargets: number[],
  colTargets: number[],
  size: number,
): { row: number; col: number }[] | null {
  const total = rowTargets.reduce((sum, n) => sum + n, 0)
  if (total !== colTargets.reduce((sum, n) => sum + n, 0)) return null

  const colRemaining = [...colTargets]
  const cells: { row: number; col: number }[] = []
  const rowOrder = shuffle(Array.from({ length: size }, (_, i) => i))

  for (const row of rowOrder) {
    let need = rowTargets[row]
    const colOrder = shuffle(Array.from({ length: size }, (_, i) => i))
    for (const col of colOrder) {
      if (need <= 0) break
      if (colRemaining[col] <= 0) continue
      cells.push({ row, col })
      colRemaining[col]--
      need--
    }
    if (need > 0) return null
  }

  return colRemaining.every((n) => n === 0) ? cells : null
}

function pickNonObviousBlankCells(size: number, blankCount: number): { row: number; col: number }[] {
  const rowOptions = validLineCountVectors(size, blankCount)
  const colOptions = validLineCountVectors(size, blankCount)

  if (rowOptions.length > 0 && colOptions.length > 0) {
    for (let attempt = 0; attempt < 96; attempt++) {
      const rowTargets = shuffle(rowOptions)[0]
      const colTargets = shuffle(colOptions)[0]
      const cells = greedyMatchBlanks(rowTargets, colTargets, size)
      if (cells && !hasSingletonLineBlanks(cells, size)) return cells
    }
  }

  for (let i = 0; i < 320; i++) {
    const cells = pickBlankCells(size, blankCount)
    if (!hasSingletonLineBlanks(cells, size)) return cells
  }
  return pickBlankCells(size, blankCount)
}

function makePuzzle(solution: number[][], blanks: { row: number; col: number }[]): number[][] {
  const puzzle = cloneGrid(solution)
  for (const { row, col } of blanks) {
    puzzle[row][col] = 0
  }
  return puzzle
}

export function isSudokuMode(mode: string): mode is SudokuMode {
  return mode === 'sudoku-easy' || mode === 'sudoku-hard'
}

export function getSudokuModeConfig(mode: SudokuMode): SudokuModeConfig {
  const cfg = SUDOKU_MODES.find((m) => m.id === mode)
  if (!cfg) throw new Error(`unknown sudoku mode: ${mode}`)
  return cfg
}

export function clampSudokuScore(score: number, max = 100): number {
  return Math.max(0, Math.min(max, score))
}

export function formatSudokuGrid(grid: number[][]): string {
  return grid.map((row) => row.map((n) => (n === 0 ? '·' : String(n))).join(' ')).join(' | ')
}

export function formatSudokuPrompt(size: number, blankCount: number): string {
  if (size === 5) {
    return `${size}×${size} 数独，每行每列 1～${size} 各出现一次，补全 ${blankCount} 个空格`
  }
  return `${size}×${size} 数独，每行每列及每个 3×3 宫 1～${size} 各出现一次，补全 ${blankCount} 个空格`
}

export function getSudokuQuestionFingerprint(q: SudokuQuestion): string {
  return q.puzzle.map((row) => row.join(',')).join(';')
}

export function generateSudokuPuzzle(
  mode: SudokuMode,
  id: number,
  avoidFingerprint?: string | null,
): SudokuQuestion {
  const cfg = getSudokuModeConfig(mode)

  for (let attempt = 0; attempt < 96; attempt++) {
    const solution = generateCompleteGrid(cfg.size)
    const blankCells = pickNonObviousBlankCells(cfg.size, cfg.blankCount)
    if (hasSingletonLineBlanks(blankCells, cfg.size)) continue
    const puzzle = makePuzzle(solution, blankCells)
    const prompt = formatSudokuPrompt(cfg.size, cfg.blankCount)
    const fingerprint = puzzle.map((row) => row.join(',')).join(';')
    if (avoidFingerprint && fingerprint === avoidFingerprint) continue

    return {
      id,
      size: cfg.size,
      puzzle,
      solution,
      blankCells,
      prompt,
    }
  }

  const solution = generateCompleteGrid(cfg.size)
  const blankCells = pickNonObviousBlankCells(cfg.size, cfg.blankCount)
  const puzzle = makePuzzle(solution, blankCells)
  return {
    id,
    size: cfg.size,
    puzzle,
    solution,
    blankCells,
    prompt: formatSudokuPrompt(cfg.size, cfg.blankCount),
  }
}

export function validateSudokuAnswer(
  q: SudokuQuestion,
  fills: number[][],
): { ok: boolean; message?: string } {
  if (fills.length !== q.size || fills.some((row) => row.length !== q.size)) {
    return { ok: false, message: '格子数量不对' }
  }

  for (const { row, col } of q.blankCells) {
    const v = fills[row][col]
    if (!Number.isFinite(v) || v <= 0) {
      return { ok: false, message: '还有空格未填' }
    }
    if (v !== q.solution[row][col]) {
      return { ok: false, message: '有格子填错' }
    }
  }

  for (let row = 0; row < q.size; row++) {
    for (let col = 0; col < q.size; col++) {
      if (q.puzzle[row][col] !== 0) {
        if (fills[row][col] !== q.puzzle[row][col]) {
          return { ok: false, message: '已知格被改动' }
        }
        continue
      }
      const v = fills[row][col]
      if (!Number.isFinite(v) || v <= 0) {
        return { ok: false, message: '还有空格未填' }
      }
      if (v !== q.solution[row][col]) {
        return { ok: false, message: '有格子填错' }
      }
    }
  }

  return { ok: true }
}
