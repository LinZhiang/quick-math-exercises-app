/**
 * 其他运算 · 日期问题
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。简单 / 普通 / 困难。
 *
 * 教材公式/方法：
 * 【平闰年】能被 4 整除为闰年；整百年须能被 400 整除。平年 365=52 周余 1，闰年 366=52 周余 2。
 * 【星期推算】日期间隔 n，n÷7 余数 r；未来加 r，过去减 r。
 * 【月历出现次数】每月至少 4 次；大月 1～3 号对应星期可出现 5 次；小月 1～2 号；闰二月仅 1 号；平二月恰 4 次。
 * 【轮值】周期取模。
 *
 * 【简单】对齐示例 1/2/3
 * 【普通】对齐经典真题 1（跨年星期）、真题 2（轮值）
 * 【困难】高于全部例题；≥6 种变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type DateDifficulty = 'easy' | 'medium' | 'hard'

export const DATE_QUESTION_COUNT = 6

export const DATE_MODES: {
  id: DateDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '日期 · 简单',
    desc: '每轮 6 题 · 对齐示例 1/2/3（同年推算、月历次数、休息日反推）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '日期 · 普通',
    desc: '每轮 6 题 · 对齐真题 1（跨年闰日）、真题 2（轮值周期）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '日期 · 困难',
    desc: '每轮 6 题 · 高于书中例题的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

/** 困难变式（≥6） */
export const DATE_HARD_EXAM_TYPES = [
  { id: 'century-leap', name: '整百年闰年判定', note: '400 年规则跨世纪' },
  { id: 'long-span-weekday', name: '长跨度同日星期', note: '多年份 + 多闰日累加' },
  { id: 'duty-cycle-plus', name: '轮值周期加强', note: '真题 2 变式：人数/跨月更复杂' },
  { id: 'rest-and-weekday', name: '休息日与星期综合', note: '由休息日个数反推 + 再推另一日' },
  { id: 'leap-feb-freq', name: '二月星期次数', note: '平/闰二月出现次数规则' },
  { id: 'nth-weekday-date', name: '第 n 个某星期几', note: '由月初星期求具体日期' },
  { id: 'workday-count', name: '工作日计数', note: '区间内去掉六日求工作日' },
  { id: 'cross-year-month', name: '跨年跨月综合推算', note: '先跨年再跨月或含二月' },
] as const

export type DateHardTypeId = (typeof DATE_HARD_EXAM_TYPES)[number]['id']

export type DateQuestion = {
  id: string
  topic: 'date'
  difficulty: DateDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: DateHardTypeId
}

export function dateTopicLabel(): string {
  return '日期问题'
}

export function dateDifficultyLabel(d: DateDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'] as const

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

function daysInMonth(y: number, m: number): number {
  if ([1, 3, 5, 7, 8, 10, 12].includes(m)) return 31
  if ([4, 6, 9, 11].includes(m)) return 30
  return isLeap(y) ? 29 : 28
}

function weekdayLabel(w: number): string {
  return `星期${WEEKDAY_NAMES[((w % 7) + 7) % 7]!}`
}

function shiftWeekday(base: number, delta: number): number {
  return ((base + delta) % 7 + 7) % 7
}

function daysBetween(
  y1: number,
  m1: number,
  d1: number,
  y2: number,
  m2: number,
  d2: number,
): number {
  const a = Date.UTC(y1, m1 - 1, d1)
  const b = Date.UTC(y2, m2 - 1, d2)
  return Math.round((b - a) / 86400000)
}

function sameYearSpanDays(y: number, m1: number, d1: number, m2: number, d2: number): number {
  return daysBetween(y, m1, d1, y, m2, d2)
}

/** 闰日计入：该年 2/29 严格落在 (起点, 终点] 内 */
function leapDaysCrossed(
  y0: number,
  m0: number,
  d0: number,
  y1: number,
  m1: number,
  d1: number,
): number {
  let count = 0
  for (let y = y0; y <= y1; y++) {
    if (!isLeap(y)) continue
    const afterStart = y > y0 || (y === y0 && (m0 < 2 || (m0 === 2 && d0 < 29)))
    const onOrBeforeEnd = y < y1 || (y === y1 && (m1 > 2 || (m1 === 2 && d1 >= 29)))
    if (afterStart && onOrBeforeEnd) count++
  }
  return count
}

function anniversaryShift(y0: number, y1: number, month: number, day: number): number {
  const years = y1 - y0
  const leaps = leapDaysCrossed(y0, month, day, y1, month, day)
  return years + leaps
}

function uniqueStr(correct: string, cands: string[]): string[] {
  const out: string[] = []
  const seen = new Set([correct])
  for (const c of cands) {
    if (!c || seen.has(c)) continue
    seen.add(c)
    out.push(c)
    if (out.length >= 3) break
  }
  let g = 0
  while (out.length < 3 && g < 20) {
    const w = weekdayLabel(g % 7)
    g++
    if (seen.has(w)) continue
    seen.add(w)
    out.push(w)
  }
  return out.slice(0, 3)
}

function buildQuestion(input: {
  difficulty: DateDifficulty
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: DateHardTypeId
}): DateQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct,
    uniqueStr(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'date',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `date-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'date',
    difficulty: input.difficulty,
    term: input.term,
    passage: input.passage.trim(),
    stem: input.stem.trim(),
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method: input.method.trim(),
    explanation: input.explanation.trim(),
    fingerprint,
    hardTypeId: input.hardTypeId,
  }
}

function weekdayDistractors(ans: number): string[] {
  return [0, 1, 2, 3, 4, 5, 6]
    .filter((w) => w !== ans)
    .map(weekdayLabel)
    .slice(0, 3)
}

function genEasySameYearWeekday(seq: number): DateQuestion | null {
  for (let t = 0; t < 40; t++) {
    const y = pickOne([2018, 2019, 2021, 2022, 2023])
    const m1 = pickOne([1, 2, 3, 4])
    const d1 = pickOne([15, 20, 28, 31].filter((d) => d <= daysInMonth(y, m1)))
    const m2 = m1 + pickOne([2, 3])
    if (m2 > 12) continue
    const d2 = pickOne([5, 8, 12, 18, 25].filter((d) => d <= daysInMonth(y, m2)))
    const span = sameYearSpanDays(y, m1, d1, m2, d2)
    if (span <= 0 || span > 120) continue
    const base = pickOne([0, 1, 2, 3, 4, 5, 6])
    const ans = shiftWeekday(base, span)
    const r = span % 7
    return buildQuestion({
      difficulty: 'easy',
      term: '同年跨月推星期（示例 1）',
      passage: `某年 ${m1} 月 ${d1} 日是${weekdayLabel(base)}。`,
      stem: `问该年 ${m2} 月 ${d2} 日是星期几？`,
      correct: weekdayLabel(ans),
      distractors: weekdayDistractors(ans),
      method: [
        `间隔天数：从 ${m1} 月 ${d1} 日到 ${m2} 月 ${d2} 日共 ${span} 天。`,
        `${span}÷7=${Math.floor(span / 7)}……${r}。`,
        `${weekdayLabel(base)}再加 ${r} 天 → ${weekdayLabel(ans)}。`,
      ].join('\n'),
      explanation: `答案：${weekdayLabel(ans)}。`,
      seq,
    })
  }
  return null
}

function genEasyMonthFreq(seq: number): DateQuestion | null {
  const days = pickOne([28, 29, 30, 31])
  const firstW = pickOne([0, 1, 2, 3, 4, 5, 6])
  const targetW = pickOne([0, 1, 2, 3, 4, 5, 6])
  const firstOcc = 1 + ((targetW - firstW + 7) % 7)
  let count = 0
  for (let d = firstOcc; d <= days; d += 7) count++
  const monthHint =
    days === 31
      ? '某大月（31 天）'
      : days === 30
        ? '某小月（30 天）'
        : days === 29
          ? '某闰年二月（29 天）'
          : '某平年二月（28 天）'
  return buildQuestion({
    difficulty: 'easy',
    term: '月历星期出现次数（示例 2）',
    passage: `${monthHint}，且该月 1 日是${weekdayLabel(firstW)}。`,
    stem: `该月共有几个${weekdayLabel(targetW)}？`,
    correct: String(count),
    distractors: [String(count === 4 ? 5 : 4), String(count + 1), '3', '6'].filter(
      (x, i, a) => x !== String(count) && a.indexOf(x) === i,
    ),
    method: [
      `1 日是${weekdayLabel(firstW)}，则第一个${weekdayLabel(targetW)}是 ${firstOcc} 日。`,
      `日期 ${firstOcc}、${firstOcc + 7}… 不超过 ${days}，共 ${count} 个。`,
      '口诀：每月至少 4 次；大月可有 3 个「五日星期」，小月 2 个，闰二月 1 个，平二月全是 4 次。',
    ].join('\n'),
    explanation: `共 ${count} 个。`,
    seq,
  })
}

function genEasyRestDays(seq: number): DateQuestion | null {
  const isSmall = pickOne([true, false])
  const days = isSmall ? 30 : 31
  const extra = days - 28
  const firstW = isSmall ? 6 : pickOne([5, 6])
  let rest = 0
  for (let d = 1; d <= days; d++) {
    const w = shiftWeekday(firstW, d - 1)
    if (w === 0 || w === 6) rest++
  }
  const prevW = shiftWeekday(firstW, -1)
  const monthName = isSmall ? '十一月' : '七月'
  const prevMonth = isSmall ? '十月' : '六月'
  const prevDay = isSmall ? 31 : 30
  return buildQuestion({
    difficulty: 'easy',
    term: '休息日反推（示例 3）',
    passage: `某年 ${monthName} 有 ${rest} 个休息日（周六、周日）。`,
    stem: `问该年 ${prevMonth} ${prevDay} 日是星期几？`,
    correct: weekdayLabel(prevW),
    distractors: weekdayDistractors(prevW),
    method: [
      `${days} 天 = 4 整周 + ${extra} 天；4 整周含 8 个休息日。`,
      `现有 ${rest} 个休息日，说明多出的 ${extra} 天中有 ${rest - 8} 天是六/日。`,
      `由此可定 ${monthName} 1 日为${weekdayLabel(firstW)}，故前一日${prevMonth}${prevDay}日为${weekdayLabel(prevW)}。`,
    ].join('\n'),
    explanation: `答案：${weekdayLabel(prevW)}。`,
    seq,
  })
}

function genEasyLeapJudge(seq: number): DateQuestion | null {
  const cases = [
    { y: 2000, leap: true, why: '能被 400 整除' },
    { y: 1900, leap: false, why: '整百年不能被 400 整除' },
    { y: 2016, leap: true, why: '能被 4 整除且非整百' },
    { y: 2018, leap: false, why: '不能被 4 整除' },
    { y: 2024, leap: true, why: '能被 4 整除且非整百' },
    { y: 2100, leap: false, why: '整百年不能被 400 整除' },
  ] as const
  const c = pickOne(cases)
  const ans = c.leap ? '闰年' : '平年'
  return buildQuestion({
    difficulty: 'easy',
    term: '平闰年判定',
    passage: `已知公历年份 ${c.y} 年。`,
    stem: '该年是平年还是闰年？',
    correct: ans,
    distractors: [c.leap ? '平年' : '闰年', '无法判断', c.y % 4 === 0 ? '一定是闰年' : '一定是平年'],
    method: ['规则：能被 4 整除为闰年；整百年须能被 400 整除。', `${c.y}：${c.why} → ${ans}。`].join(
      '\n',
    ),
    explanation: `${c.y} 年是${ans}。`,
    seq,
  })
}

function genEasyYearShift(seq: number): DateQuestion | null {
  const leap = pickOne([false, true])
  const base = pickOne([0, 1, 2, 3, 4, 5, 6])
  const delta = leap ? 2 : 1
  const ans = shiftWeekday(base, delta)
  const y = leap ? pickOne([2016, 2020, 2024]) : pickOne([2017, 2018, 2019, 2021])
  return buildQuestion({
    difficulty: 'easy',
    term: '平闰年星期位移',
    passage: `${y} 年 3 月 1 日是${weekdayLabel(base)}（${leap ? '该年为闰年' : '该年为平年'}）。`,
    stem: `${y + 1} 年 3 月 1 日是星期几？`,
    correct: weekdayLabel(ans),
    distractors: weekdayDistractors(ans),
    method: [
      leap
        ? '闰年 366=52 周余 2，过完该年同日星期前进 2 天。'
        : '平年 365=52 周余 1，过完该年同日星期前进 1 天。',
      `${weekdayLabel(base)}+${delta} → ${weekdayLabel(ans)}。`,
    ].join('\n'),
    explanation: `答案：${weekdayLabel(ans)}。`,
    seq,
  })
}

function genEasyDayOfMonth(seq: number): DateQuestion | null {
  const days = pickOne([30, 31])
  const firstW = pickOne([0, 1, 2, 3, 4, 5, 6])
  const d = pickOne([8, 12, 15, 20, 25, 28].filter((x) => x <= days))
  const ans = shiftWeekday(firstW, d - 1)
  return buildQuestion({
    difficulty: 'easy',
    term: '月初推某日星期',
    passage: `某月有 ${days} 天，且 1 日是${weekdayLabel(firstW)}。`,
    stem: `该月 ${d} 日是星期几？`,
    correct: weekdayLabel(ans),
    distractors: weekdayDistractors(ans),
    method: [
      `从 1 日到 ${d} 日间隔 ${d - 1} 天。`,
      `${weekdayLabel(firstW)}+${(d - 1) % 7} → ${weekdayLabel(ans)}。`,
    ].join('\n'),
    explanation: `答案：${weekdayLabel(ans)}。`,
    seq,
  })
}

function genMediumMultiYear(seq: number): DateQuestion | null {
  const y0 = pickOne([2015, 2016, 2017, 2018, 2019])
  const spanY = pickOne([8, 10, 12])
  const y1 = y0 + spanY
  const month = pickOne([1, 3, 5, 7])
  const day = pickOne([6, 8, 10, 15])
  const shift = anniversaryShift(y0, y1, month, day)
  const base = pickOne([0, 1, 2, 3, 4, 5, 6])
  const ans = shiftWeekday(base, shift)
  const leaps = leapDaysCrossed(y0, month, day, y1, month, day)
  return buildQuestion({
    difficulty: 'medium',
    term: '跨年同日推星期（经典真题 1）',
    passage: `${y0} 年 ${month} 月 ${day} 日是${weekdayLabel(base)}。`,
    stem: `${y1} 年 ${month} 月 ${day} 日是星期几？`,
    correct: weekdayLabel(ans),
    distractors: weekdayDistractors(ans),
    method: [
      `共跨 ${spanY} 年，其间闰日 ${leaps} 个。`,
      `星期前进量 = ${spanY}+${leaps}=${shift}，${shift}÷7 余 ${shift % 7}。`,
      `${weekdayLabel(base)}+${shift % 7} → ${weekdayLabel(ans)}。`,
    ].join('\n'),
    explanation: `答案：${weekdayLabel(ans)}。`,
    seq,
  })
}

function genMediumDutyCycle(seq: number): DateQuestion | null {
  const names = ['甲', '乙', '丙', '丁', '戊'] as const
  const n = names.length
  for (let t = 0; t < 30; t++) {
    const y = 2020
    const startM = 5
    const startD = pickOne([5, 8, 9, 12])
    const targetM = 10
    const daysToOct1 = daysBetween(y, startM, startD, y, targetM, 1)
    if (daysToOct1 <= 0) continue
    const oct1Idx = daysToOct1 % n
    const yiDays: number[] = []
    for (let d = 1; d <= 7; d++) {
      if ((oct1Idx + (d - 1)) % n === 1) yiDays.push(d)
    }
    if (yiDays.length === 0) continue
    const correct = yiDays.map((d) => `${targetM}月${d}日`).join('、')
    const alt: string[] = []
    for (let offset = 0; offset < n; offset++) {
      if (offset === 1) continue
      const days: number[] = []
      for (let d = 1; d <= 7; d++) {
        if ((oct1Idx + (d - 1)) % n === offset) days.push(d)
      }
      if (days.length) alt.push(days.map((d) => `${targetM}月${d}日`).join('、'))
    }
    alt.push(`${targetM}月3日`)
    return buildQuestion({
      difficulty: 'medium',
      term: '轮值周期（经典真题 2）',
      passage: `单位 ${n} 人按「${names.join('→')}」轮流值夜班。已知 ${startM} 月 ${startD} 日甲值班。`,
      stem: `${targetM} 月 1 日至 7 日，乙值班的日期是？`,
      correct,
      distractors: alt.slice(0, 3),
      method: [
        `从 ${startM} 月 ${startD} 日到 ${targetM} 月 1 日共 ${daysToOct1} 天，余 ${daysToOct1 % n}。`,
        `故 ${targetM} 月 1 日值班者是 ${names[oct1Idx]}。`,
        `乙对应序号 1，该窗口内日期：${correct}。`,
      ].join('\n'),
      explanation: `乙值班：${correct}。`,
      seq,
    })
  }
  return null
}

function genMediumCountLeaps(seq: number): DateQuestion | null {
  const y0 = pickOne([2000, 2005, 2010, 2015])
  const y1 = y0 + pickOne([10, 15, 20])
  let count = 0
  const leaps: number[] = []
  for (let y = y0; y <= y1; y++) {
    if (isLeap(y)) {
      count++
      leaps.push(y)
    }
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '区间闰年计数',
    passage: `考虑公历 ${y0} 年至 ${y1} 年（含首尾）。`,
    stem: '其中共有几个闰年？',
    correct: String(count),
    distractors: [String(count + 1), String(Math.max(0, count - 1)), String(count + 2), '0'],
    method: [
      '闰年：能被 4 整除；整百年须能被 400 整除。',
      `列举：${leaps.join('、') || '无'}，共 ${count} 个。`,
    ].join('\n'),
    explanation: `共 ${count} 个闰年。`,
    seq,
  })
}

function genMediumCrossFeb(seq: number): DateQuestion | null {
  const leap = pickOne([true, false])
  const y = leap ? pickOne([2016, 2020, 2024]) : pickOne([2017, 2018, 2019, 2021])
  const base = pickOne([0, 1, 2, 3, 4, 5, 6])
  const span = sameYearSpanDays(y, 1, 20, 3, 5)
  const ans = shiftWeekday(base, span)
  return buildQuestion({
    difficulty: 'medium',
    term: '跨二月推星期',
    passage: `${y} 年（${leap ? '闰年' : '平年'}）1 月 20 日是${weekdayLabel(base)}。`,
    stem: '该年 3 月 5 日是星期几？',
    correct: weekdayLabel(ans),
    distractors: weekdayDistractors(ans),
    method: [
      `1/20→3/5：1 月剩余 ${31 - 20} 天 + 2 月 ${daysInMonth(y, 2)} 天 + 3 月 5 天 = ${span} 天。`,
      `${span}÷7 余 ${span % 7}，${weekdayLabel(base)}+${span % 7} → ${weekdayLabel(ans)}。`,
    ].join('\n'),
    explanation: `答案：${weekdayLabel(ans)}。`,
    seq,
  })
}

function genMediumRestForward(seq: number): DateQuestion | null {
  const days = 30
  const firstW = pickOne([0, 1, 2, 3, 4, 5, 6])
  let rest = 0
  for (let d = 1; d <= days; d++) {
    const w = shiftWeekday(firstW, d - 1)
    if (w === 0 || w === 6) rest++
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '由月初推休息日个数',
    passage: `某小月（30 天），1 日是${weekdayLabel(firstW)}。`,
    stem: '该月共有多少个休息日（周六、周日）？',
    correct: String(rest),
    distractors: [String(8), String(9), String(10), String(rest + 1)].filter(
      (x, i, a) => x !== String(rest) && a.indexOf(x) === i,
    ),
    method: [
      '30=4×7+2。整 4 周固定 8 个休息日；多出的 2 天（1 日、2 日）若为六/日则再加。',
      `1 日${weekdayLabel(firstW)}、2 日${weekdayLabel(shiftWeekday(firstW, 1))}，故休息日共 ${rest}。`,
    ].join('\n'),
    explanation: `共 ${rest} 个休息日。`,
    seq,
  })
}

function genMediumNthWeekday(seq: number): DateQuestion | null {
  const days = 31
  const firstW = pickOne([0, 1, 2, 3, 4, 5, 6])
  const targetW = pickOne([0, 1, 2, 3, 4, 5, 6])
  const firstOcc = 1 + ((targetW - firstW + 7) % 7)
  const n = pickOne([3, 4, 5])
  const date = firstOcc + (n - 1) * 7
  if (date > days) return null
  return buildQuestion({
    difficulty: 'medium',
    term: '第 n 个某星期几',
    passage: `某大月 1 日是${weekdayLabel(firstW)}。`,
    stem: `该月第 ${n} 个${weekdayLabel(targetW)}是几号？`,
    correct: `${date} 日`,
    distractors: [`${firstOcc} 日`, `${date - 7} 日`, `${date + 7} 日`, `${firstOcc + 7} 日`].filter(
      (x, i, a) => x !== `${date} 日` && a.indexOf(x) === i,
    ),
    method: [
      `第一个${weekdayLabel(targetW)}是 ${firstOcc} 日。`,
      `第 ${n} 个：${firstOcc}+(${n}-1)×7=${date} 日。`,
    ].join('\n'),
    explanation: `是 ${date} 日。`,
    seq,
  })
}

function genHardCenturyLeap(seq: number): DateQuestion | null {
  const pairs = [
    { years: [1800, 1900, 2000, 2100] },
    { years: [1600, 1700, 1800, 2000] },
    { years: [1900, 2000, 2100, 2200] },
  ]
  const p = pickOne(pairs)
  const leapOnes = p.years.filter(isLeap)
  const ans = String(leapOnes.length)
  return buildQuestion({
    difficulty: 'hard',
    term: '整百年闰年判定',
    hardTypeId: 'century-leap',
    passage: `下列年份：${p.years.join('、')}。`,
    stem: '其中闰年共有几个？',
    correct: ans,
    distractors: [String(leapOnes.length + 1), String(Math.max(0, leapOnes.length - 1)), '0', '4'],
    method: [
      '整百年须能被 400 整除才是闰年。',
      `闰年：${leapOnes.join('、') || '无'}，共 ${ans} 个。`,
    ].join('\n'),
    explanation: `共 ${ans} 个闰年。`,
    seq,
  })
}

function genHardLongSpan(seq: number): DateQuestion | null {
  const y0 = pickOne([1995, 1998, 2001, 2003])
  const y1 = y0 + pickOne([15, 18, 20, 24])
  const month = pickOne([1, 4, 8, 11])
  const day = pickOne([1, 5, 12, 20])
  const shift = anniversaryShift(y0, y1, month, day)
  const base = pickOne([0, 1, 2, 3, 4, 5, 6])
  const ans = shiftWeekday(base, shift)
  const leaps = leapDaysCrossed(y0, month, day, y1, month, day)
  return buildQuestion({
    difficulty: 'hard',
    term: '长跨度同日星期',
    hardTypeId: 'long-span-weekday',
    passage: `${y0} 年 ${month} 月 ${day} 日是${weekdayLabel(base)}。`,
    stem: `${y1} 年 ${month} 月 ${day} 日是星期几？`,
    correct: weekdayLabel(ans),
    distractors: weekdayDistractors(ans),
    method: [
      `跨度 ${y1 - y0} 年，其间闰日 ${leaps} 个。`,
      `前进量 ${(y1 - y0) + leaps}，对 7 取余 ${shift % 7} → ${weekdayLabel(ans)}。`,
    ].join('\n'),
    explanation: `答案：${weekdayLabel(ans)}。`,
    seq,
  })
}

function genHardDutyPlus(seq: number): DateQuestion | null {
  const names = ['甲', '乙', '丙', '丁', '戊', '己'] as const
  const n = names.length
  const startD = pickOne([1, 4, 10])
  const askName = pickOne(['丙', '丁', '戊'] as const)
  const askIdx = names.indexOf(askName)
  const daysTo = daysBetween(2021, 3, startD, 2021, 9, 1)
  const t1 = daysTo % n
  const hits: number[] = []
  for (let d = 1; d <= 10; d++) {
    if ((t1 + d - 1) % n === askIdx) hits.push(d)
  }
  if (hits.length < 1) return null
  const correct = hits.map((d) => `9月${d}日`).join('、')
  const distractors: string[] = []
  for (const other of names) {
    if (other === askName) continue
    const oi = names.indexOf(other)
    const ds: number[] = []
    for (let d = 1; d <= 10; d++) {
      if ((t1 + d - 1) % n === oi) ds.push(d)
    }
    if (ds.length) distractors.push(ds.map((d) => `9月${d}日`).join('、'))
    if (distractors.length >= 3) break
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '轮值周期加强',
    hardTypeId: 'duty-cycle-plus',
    passage: `6 人按「${names.join('→')}」轮流值班。已知 3 月 ${startD} 日甲值班。`,
    stem: `9 月 1～10 日，${askName} 值班的日期是？`,
    correct,
    distractors: distractors.slice(0, 3),
    method: [
      `3 月 ${startD} 日→9 月 1 日间隔 ${daysTo} 天，余 ${daysTo % n}。`,
      `9 月 1 日为 ${names[t1]}；${askName} 对应日：${correct}。`,
    ].join('\n'),
    explanation: `${askName}：${correct}。`,
    seq,
  })
}

function genHardRestAndWeekday(seq: number): DateQuestion | null {
  const firstW = 6
  const d = 15
  const ans = shiftWeekday(firstW, d - 1)
  return buildQuestion({
    difficulty: 'hard',
    term: '休息日与星期综合',
    hardTypeId: 'rest-and-weekday',
    passage: '某年十一月有 10 个休息日（周六、周日）。',
    stem: '该年十一月 15 日是星期几？',
    correct: weekdayLabel(ans),
    distractors: weekdayDistractors(ans),
    method: [
      '30=28+2。休息日 10=8+2 ⇒ 多出的 1、2 日恰为六、日 ⇒ 1 日周六。',
      `15 日 = 1 日 +14 天，星期不变 → ${weekdayLabel(ans)}。`,
    ].join('\n'),
    explanation: `答案：${weekdayLabel(ans)}。`,
    seq,
  })
}

function genHardLeapFebFreq(seq: number): DateQuestion | null {
  const leap = pickOne([true, false])
  const days = leap ? 29 : 28
  const firstW = pickOne([0, 1, 2, 3, 4, 5, 6])
  let count = 0
  for (let d = 1; d <= days; d += 7) count++
  return buildQuestion({
    difficulty: 'hard',
    term: '二月星期次数',
    hardTypeId: 'leap-feb-freq',
    passage: `某${leap ? '闰' : '平'}年二月，1 日是${weekdayLabel(firstW)}。`,
    stem: '该月与 1 日相同的星期几一共出现几次？',
    correct: String(count),
    distractors: ['4', '5', '3', String(count === 4 ? 5 : 4)].filter(
      (x, i, a) => x !== String(count) && a.indexOf(x) === i,
    ),
    method: [
      leap
        ? '闰二月 29 天：仅 1 号对应的星期可出现 5 次，其余 4 次。'
        : '平二月 28 天：每个星期几都恰好出现 4 次。',
      `本题与 1 日相同 → ${count} 次。`,
    ].join('\n'),
    explanation: `出现 ${count} 次。`,
    seq,
  })
}

function genHardNthWeekday(seq: number): DateQuestion | null {
  const firstW = pickOne([1, 2, 3, 4, 5])
  const targetW = pickOne([0, 1, 2, 3, 4, 5, 6])
  const firstOcc = 1 + ((targetW - firstW + 7) % 7)
  const days = 31
  let last = firstOcc
  while (last + 7 <= days) last += 7
  return buildQuestion({
    difficulty: 'hard',
    term: '月末某星期几日期',
    hardTypeId: 'nth-weekday-date',
    passage: `某大月 1 日是${weekdayLabel(firstW)}。`,
    stem: `该月最后一个${weekdayLabel(targetW)}是几号？`,
    correct: `${last} 日`,
    distractors: [
      `${last - 7} 日`,
      `${firstOcc} 日`,
      `${last + 7 > 31 ? last - 14 : last + 7} 日`,
      '31 日',
    ].filter((x, i, a) => x !== `${last} 日` && a.indexOf(x) === i),
    method: [
      `第一个${weekdayLabel(targetW)}为 ${firstOcc} 日，之后每 7 天一次。`,
      `不超过 31 的最大项为 ${last} 日。`,
    ].join('\n'),
    explanation: `是 ${last} 日。`,
    seq,
  })
}

function genHardWorkdayCount(seq: number): DateQuestion | null {
  const firstW = pickOne([0, 1, 2, 3, 4, 5, 6])
  const len = pickOne([10, 12, 14, 15])
  let work = 0
  for (let i = 0; i < len; i++) {
    const w = shiftWeekday(firstW, i)
    if (w >= 1 && w <= 5) work++
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '工作日计数',
    hardTypeId: 'workday-count',
    passage: `从某${weekdayLabel(firstW)}起连续 ${len} 天（含当天）。`,
    stem: '其中工作日（周一至周五）共有多少天？',
    correct: String(work),
    distractors: [String(len - 2), String(work + 1), String(Math.max(0, work - 1)), String(Math.floor((len * 5) / 7))],
    method: [`逐日看星期：共 ${len} 天，六日不计。`, `工作日 = ${work}。`].join('\n'),
    explanation: `共 ${work} 个工作日。`,
    seq,
  })
}

function genHardCrossYearMonth(seq: number): DateQuestion | null {
  const y0 = pickOne([2018, 2019, 2020])
  const y1 = y0 + 1
  const base = pickOne([0, 1, 2, 3, 4, 5, 6])
  const span = daysBetween(y0, 11, 20, y1, 2, 10)
  const ans = shiftWeekday(base, span)
  return buildQuestion({
    difficulty: 'hard',
    term: '跨年跨月综合推算',
    hardTypeId: 'cross-year-month',
    passage: `${y0} 年 11 月 20 日是${weekdayLabel(base)}。`,
    stem: `${y1} 年 2 月 10 日是星期几？`,
    correct: weekdayLabel(ans),
    distractors: weekdayDistractors(ans),
    method: [
      `间隔 ${span} 天（含跨年及 ${y1} 年 2 月天数 ${daysInMonth(y1, 2)}）。`,
      `${span}÷7 余 ${span % 7} → ${weekdayLabel(ans)}。`,
    ].join('\n'),
    explanation: `答案：${weekdayLabel(ans)}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<DateHardTypeId, (seq: number) => DateQuestion | null> = {
  'century-leap': genHardCenturyLeap,
  'long-span-weekday': genHardLongSpan,
  'duty-cycle-plus': genHardDutyPlus,
  'rest-and-weekday': genHardRestAndWeekday,
  'leap-feb-freq': genHardLeapFebFreq,
  'nth-weekday-date': genHardNthWeekday,
  'workday-count': genHardWorkdayCount,
  'cross-year-month': genHardCrossYearMonth,
}

function tryBuild(factory: () => DateQuestion | null, maxTry = 40): DateQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

type DateFactory = {
  key: string
  build: (seq: number) => DateQuestion | null
}

export function generateDatePaper(difficulty: DateDifficulty): DateQuestion[] {
  const out: DateQuestion[] = []
  const seen = new Set<string>()
  const usedKeys = new Set<string>()
  const push = (q: DateQuestion | null, typeKey: string) => {
    if (!q || seen.has(q.fingerprint) || usedKeys.has(typeKey)) return false
    seen.add(q.fingerprint)
    usedKeys.add(typeKey)
    out.push(q)
    return true
  }

  const fillFromFactories = (factories: DateFactory[]) => {
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= DATE_QUESTION_COUNT) break
      push(tryBuild(() => f.build(out.length)), f.key)
    }
    let guard = 0
    const remain = () => factories.filter((f) => !usedKeys.has(f.key))
    while (out.length < DATE_QUESTION_COUNT && guard++ < 60) {
      const pool = remain()
      if (!pool.length) break
      const f = pickOne(pool)
      push(tryBuild(() => f.build(out.length)), f.key)
    }
  }

  if (difficulty === 'easy') {
    fillFromFactories([
      { key: 'same-year', build: genEasySameYearWeekday },
      { key: 'month-freq', build: genEasyMonthFreq },
      { key: 'rest-days', build: genEasyRestDays },
      { key: 'leap-judge', build: genEasyLeapJudge },
      { key: 'year-shift', build: genEasyYearShift },
      { key: 'day-of-month', build: genEasyDayOfMonth },
    ])
  } else if (difficulty === 'medium') {
    fillFromFactories([
      { key: 'multi-year', build: genMediumMultiYear },
      { key: 'duty-cycle', build: genMediumDutyCycle },
      { key: 'count-leaps', build: genMediumCountLeaps },
      { key: 'cross-feb', build: genMediumCrossFeb },
      { key: 'rest-forward', build: genMediumRestForward },
      { key: 'nth-weekday', build: genMediumNthWeekday },
    ])
  } else {
    const used = new Set<DateHardTypeId>()
    const types = shuffleInPlace([...DATE_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= DATE_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40), typeId)
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = DATE_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < DATE_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : DATE_HARD_EXAM_TYPES.map((x) => x.id)
      const typeId = pickOne(pool)
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30), typeId)
      if (out.length > before) {
        used.add(typeId)
        const idx = remain.indexOf(typeId)
        if (idx >= 0) remain.splice(idx, 1)
      }
    }
  }

  return out.slice(0, DATE_QUESTION_COUNT)
}
