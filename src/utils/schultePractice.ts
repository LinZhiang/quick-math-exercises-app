/**
 * 快判·舒尔特：先在方格上按序高亮目标字，熄灭后再点选。
 * 简单 4×5 / 40 秒；复杂 5×7 / 80 秒。
 */

import { SCHULTE_BANK } from '@/utils/schulteBank'
import type { SchulteBankItem, SchulteWordKind } from '@/utils/schulteBankTypes'

export type SchulteMode = 'schulte-easy' | 'schulte-hard'

export type SchulteModeConfig = {
  id: SchulteMode
  label: string
  durationSec: number
  rows: number
  cols: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
  /** 预览总时长（毫秒），不计时 */
  previewMs: number
}

export const SCHULTE_MODES: SchulteModeConfig[] = [
  {
    id: 'schulte-easy',
    label: '简单题',
    durationSec: 40,
    rows: 4,
    cols: 5,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    previewMs: 2000,
    desc: '40 秒 · 4×5 格 · 先在格上按序高亮 2 秒再点选 · 对 +10 / 错 -20 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'schulte-hard',
    label: '复杂题',
    durationSec: 80,
    rows: 5,
    cols: 7,
    correctDelta: 15,
    wrongDelta: -30,
    maxScore: 100,
    previewMs: 2000,
    desc: '80 秒 · 5×7 格 · 先在格上按序高亮 2 秒再点选 · 对 +15 / 错 -30 · 对 +1 秒 / 错 -1 秒',
  },
]

export type SchulteCell = {
  id: number
  char: string
  /** 目标字序（0-based）；干扰项为 null */
  orderIndex: number | null
}

export type SchulteQuestion = {
  id: number
  key: string
  kind: SchulteWordKind
  word: string
  meaning: string
  chars: string[]
  rows: number
  cols: number
  cells: SchulteCell[]
  expression: string
  correctAnswer: string
  explanation: string
}

const USED_KEYS_STORAGE = 'mental-schulte-used-keys-v1'

type UsedMap = { easy: string[]; hard: string[] }

function emptyUsedMap(): UsedMap {
  return { easy: [], hard: [] }
}

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

function readUsedMap(): UsedMap {
  try {
    const raw = localStorage.getItem(USED_KEYS_STORAGE)
    if (!raw) return emptyUsedMap()
    const parsed = JSON.parse(raw) as Partial<UsedMap>
    const out = emptyUsedMap()
    for (const k of ['easy', 'hard'] as const) {
      if (Array.isArray(parsed[k])) {
        out[k] = parsed[k]!
          .map((t) => (typeof t === 'string' ? normalizeKey(t) : ''))
          .filter(Boolean)
      }
    }
    return out
  } catch {
    return emptyUsedMap()
  }
}

function writeUsedMap(map: UsedMap) {
  try {
    localStorage.setItem(USED_KEYS_STORAGE, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function usedBucket(mode: SchulteMode): 'easy' | 'hard' {
  return mode === 'schulte-hard' ? 'hard' : 'easy'
}

function markUsedKey(mode: SchulteMode, key: string) {
  const k = normalizeKey(key)
  if (!k) return
  const map = readUsedMap()
  const bucket = usedBucket(mode)
  const merged = map[bucket].filter((x) => x !== k)
  merged.push(k)
  map[bucket] = merged
  writeUsedMap(map)
}

export function clearSchulteUsedKeys(mode?: SchulteMode) {
  if (!mode) {
    writeUsedMap(emptyUsedMap())
    return
  }
  const map = readUsedMap()
  map[usedBucket(mode)] = []
  writeUsedMap(map)
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

/** 形近 / 易混字组（公考识记向） */
const SIMILAR_GROUPS: string[] = [
  '己已巳',
  '戊戌戍戎',
  '未末本术',
  '日曰目且',
  '人入八',
  '土士干千',
  '杨扬场伤',
  '清晴情请',
  '辨辩辫瓣',
  '像象橡',
  '拆折析诉',
  '刺剌辣赖',
  '茶荼',
  '管菅',
  '粱梁',
  '盲肓',
  '徒徙',
  '暗黯',
  '欧殴',
  '竞竟',
  '侯候',
  '厉历励',
  '籍藉',
  '暑署',
  '载裁栽戴',
  '祟崇',
  '毫豪',
  '壶壹',
  '蓝篮',
  '幕墓慕募',
  '宵霄',
  '菅管',
  '祟崇',
  '毋母每',
  '叨叼',
  '灸炙',
  '肆肄',
  '赢嬴羸',
  '壶壹',
  '戍戌戊戎',
  '茶荼',
  '拆折析',
  '唯惟维',
  '即既',
  '度渡镀',
  '带戴',
  '坐座',
  '做作',
  '再在',
  '的地得',
  '象像',
  '需须',
  '反应映',
  '权利力',
  '截止至',
  '制定订',
  '凑奏',
  '防妨',
  '坚艰',
  '合和',
  '纪记',
  '练炼',
  '查察',
  '须需',
  '长常',
  '部布',
  '辨辩',
  '绝决',
  '贡供',
  '厉励',
  '佳嘉',
  '叠迭',
  '份分',
  '幅付副',
  '竟竞',
  '燥躁澡藻',
  '躁燥',
  '泄泻',
  '暄喧',
  '暄暄',
  '诡鬼',
  '诡鬼',
  '戍戎',
  '赢盈',
  '卑碑',
  '讳违',
  '讳纬',
  '诣脂',
  '诣指',
  '赡瞻',
  '戮戳',
  '戮戳',
  '掣掣',
  '掣制',
  '掣掣',
]

const FALLBACK_POOL =
  '东南西北中上下左右大小多少好坏真假新旧快慢高低远近' +
  '天地人手足口耳目心木水火土金石风云雨雪春秋冬夏' +
  '一二三四五六七八九十百千万亿甲乙丙丁戊己庚辛' +
  '红黄蓝绿青白黑紫灰银铜铁钢铅锡锌铝' +
  '想看听说读写走跑跳飞开关进出前后内外' +
  '公检法司政军民学工农商学兵' +
  '改革发展稳定安全创新协调绿色开放共享' +
  '法治德治自治智治廉政勤政问责监督审计巡视'

function similarFor(ch: string, exclude: Set<string>): string[] {
  const out: string[] = []
  for (const g of SIMILAR_GROUPS) {
    if (!g.includes(ch)) continue
    for (const c of g) {
      if (c === ch || exclude.has(c)) continue
      out.push(c)
    }
  }
  return out
}

function pickDistractors(need: number, targetChars: string[]): string[] {
  const exclude = new Set(targetChars)
  const bag: string[] = []

  // 1) 优先每个目标字的形近字
  for (const ch of targetChars) {
    for (const s of shuffle(similarFor(ch, exclude))) {
      if (bag.length >= need) break
      if (exclude.has(s) || bag.includes(s)) continue
      bag.push(s)
      exclude.add(s)
    }
  }

  // 2) 题库其他字拆开补充（保持汉字语境）
  const bankChars = shuffle(
    SCHULTE_BANK.flatMap((it) => Array.from(it.word)).filter((c) => !exclude.has(c)),
  )
  for (const c of bankChars) {
    if (bag.length >= need) break
    if (exclude.has(c) || bag.includes(c)) continue
    bag.push(c)
    exclude.add(c)
  }

  // 3) 兜底字库
  for (const c of shuffle(Array.from(FALLBACK_POOL))) {
    if (bag.length >= need) break
    if (exclude.has(c) || bag.includes(c)) continue
    bag.push(c)
    exclude.add(c)
  }

  // 4) 仍不足则允许重复形近（极少发生）
  let guard = 0
  while (bag.length < need && guard < need * 4) {
    guard++
    const ch = pickOne(targetChars)
    const sims = similarFor(ch, new Set())
    const c = sims.length ? pickOne(sims) : pickOne(Array.from(FALLBACK_POOL))
    bag.push(c)
  }

  return bag.slice(0, need)
}

function pickItem(mode: SchulteMode, avoidFingerprints: Set<string>): SchulteBankItem {
  const bucket = usedBucket(mode)
  const used = new Set(readUsedMap()[bucket])
  const pool = SCHULTE_BANK.filter((it) => {
    const fp = `schulte:${it.key}`
    if (avoidFingerprints.has(fp)) return false
    return true
  })
  const fresh = pool.filter((it) => !used.has(normalizeKey(it.key)))
  let chosen: SchulteBankItem
  if (fresh.length > 0) {
    chosen = pickOne(fresh)
  } else {
    // 出完一轮后重置
    const map = readUsedMap()
    map[bucket] = []
    writeUsedMap(map)
    chosen = pickOne(pool.length ? pool : SCHULTE_BANK)
  }
  markUsedKey(mode, chosen.key)
  return chosen
}

function buildCells(word: string, rows: number, cols: number): SchulteCell[] {
  const chars = Array.from(word)
  const total = rows * cols
  if (chars.length >= total) {
    throw new Error(`词「${word}」字数(${chars.length})超过格子数(${total})`)
  }
  const distractors = pickDistractors(total - chars.length, chars)
  const cells: SchulteCell[] = [
    ...chars.map((char, orderIndex) => ({ id: -1, char, orderIndex })),
    ...distractors.map((char) => ({ id: -1, char, orderIndex: null as number | null })),
  ]
  const shuffled = shuffle(cells)
  return shuffled.map((c, i) => ({ ...c, id: i }))
}

export function isSchulteMode(mode: string): mode is SchulteMode {
  return mode === 'schulte-easy' || mode === 'schulte-hard'
}

export function getSchulteModeConfig(mode: SchulteMode): SchulteModeConfig {
  const hit = SCHULTE_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知舒尔特模式: ${mode}`)
  return hit
}

export function generateSchulteQuestion(
  mode: SchulteMode,
  id: number,
  avoidFingerprints: Set<string> = new Set(),
): SchulteQuestion {
  const cfg = getSchulteModeConfig(mode)
  const item = pickItem(mode, avoidFingerprints)
  const chars = Array.from(item.word)
  const cells = buildCells(item.word, cfg.rows, cfg.cols)
  const kindLabel = item.kind === 'idiom' ? '成语' : '词语'
  return {
    id,
    key: item.key,
    kind: item.kind,
    word: item.word,
    meaning: item.meaning,
    chars,
    rows: cfg.rows,
    cols: cfg.cols,
    cells,
    expression: `${kindLabel}：${item.word}`,
    correctAnswer: item.word,
    explanation: `【${kindLabel}】${item.word}\n释义：${item.meaning}`,
  }
}

export function getSchulteQuestionFingerprint(q: SchulteQuestion): string {
  return `schulte:${q.key}`
}

export function clampSchulteScore(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function validateSchulteClick(
  q: SchulteQuestion,
  cellId: number,
  nextOrder: number,
): { ok: boolean; done: boolean } {
  const cell = q.cells.find((c) => c.id === cellId)
  if (!cell || cell.orderIndex == null) return { ok: false, done: false }
  if (cell.orderIndex !== nextOrder) return { ok: false, done: false }
  const done = nextOrder + 1 >= q.chars.length
  return { ok: true, done }
}
