/**
 * 生成修辞手法题库：每种手法 30 题，共 300 题
 * node scripts/generate-rhetoric-device-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEVICES, SENTENCES } from './rhetoric-device-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../src/utils/rhetoricDeviceBank.ts')

const TIPS = {
  对比: '把两种相反或相对的事物放在一起对照，突出差异。',
  衬托: '用相近或相反的事物作陪衬，突出主要对象（主次分明）。',
  比喻: '用相似事物打比方，常见「像、似、如同、是」等，或暗喻。',
  借代: '不直接说本名，而用相关特征/部分/材料等指代。',
  通感: '打通不同感官，以声写色、以香写声等。',
  比拟: '把物当人写（拟人）或把人当物写（拟物）。',
  排比: '三个或以上结构相似、语气一致的短语或句子并列。',
  设问: '自问自答，或明知故问后随即作答，以提领下文。',
  反问: '用疑问形式表示确定意思，答案寓于问中，不必另答。',
  夸张: '故意夸大或缩小事物特征，以突出印象。',
}

function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pickDistractors(correct, salt) {
  const others = DEVICES.filter((d) => d !== correct)
  const ordered = [...others].sort((a, b) => hash(`${salt}|${a}`) - hash(`${salt}|${b}`))
  return ordered.slice(0, 5)
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

const stems = new Set()
const items = []

for (const device of DEVICES) {
  const list = SENTENCES[device]
  list.forEach((sentence, i) => {
    const stem = `下列句子主要运用的修辞手法是？\n${sentence}`
    const norm = stem.replace(/\s+/g, '')
    if (stems.has(norm)) throw new Error(`duplicate stem: ${device}#${i + 1} ${sentence}`)
    stems.add(norm)
    const key = `rhetoric-device:${device}-${String(i + 1).padStart(2, '0')}`
    const distractors = pickDistractors(device, key)
    const explanation = [
      `修辞：${device}`,
      `例句：${sentence}`,
      `要点：${TIPS[device]}`,
      '来源取向：古诗词名句或政论/求是网风格表述（教学用例）。',
    ].join('\n')
    items.push({ stem, correct: device, distractors, explanation, key })
  })
}

if (items.length !== 300) throw new Error(`want 300, got ${items.length}`)

const body = items
  .map(
    (it) => `  {
    difficulty: 'normal',
    stem: \`${esc(it.stem)}\`,
    correct: ${JSON.stringify(it.correct)},
    distractors: ${JSON.stringify(it.distractors)},
    explanation: \`${esc(it.explanation)}\`,
    key: ${JSON.stringify(it.key)},
  }`,
  )
  .join(',\n')

fs.writeFileSync(
  OUT,
  `/**
 * 快判·修辞手法本地题库（普通难度，恰好 300 题：10 种×30）
 * 由 scripts/generate-rhetoric-device-bank.mjs 生成；原料见 rhetoric-device-data.mjs。
 */
import type { RhetoricDeviceBankItem } from '@/utils/rhetoricDeviceBankTypes'

export const RHETORIC_DEVICE_BANK: RhetoricDeviceBankItem[] = [
${body},
]
`,
  'utf8',
)

const counts = Object.fromEntries(DEVICES.map((d) => [d, items.filter((x) => x.correct === d).length]))
console.log('wrote', OUT, 'items=', items.length, counts)
