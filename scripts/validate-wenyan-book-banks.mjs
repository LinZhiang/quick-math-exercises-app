import fs from 'node:fs'

function keys(file) {
  const t = fs.readFileSync(file, 'utf8')
  return [...t.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1])
}

const xuci = keys('src/utils/chinese/wenyanXuciBank.ts')
const jushi = keys('src/utils/chinese/wenyanJushiBank.ts')
const hanzi = keys('src/utils/chinese/hanziPatternBank.ts')

console.log('xuci', xuci.length, 'uniq', new Set(xuci).size)
console.log('jushi', jushi.length, 'uniq', new Set(jushi).size)
console.log('hanzi', hanzi.length, 'uniq', new Set(hanzi).size)

const words = [...'而何乎乃其且若所为焉也以因于与则者之']
for (const w of words) {
  const n = xuci.filter((k) => k.startsWith(`wenyan-xuci:${w}-`)).length
  if (n !== 10) console.log('BAD word', w, n)
}
console.log('xuci words ok (all 10)')

const cats = {}
for (const k of jushi) {
  const m = k.match(/^wenyan-jushi:(.+)-\d+$/)
  if (!m) {
    console.log('bad key', k)
    continue
  }
  cats[m[1]] = (cats[m[1]] || 0) + 1
}
console.log('jushi cats', cats)
const bad = Object.entries(cats).filter(([, n]) => n !== 4)
if (bad.length) console.log('BAD cats', bad)
else console.log('jushi cats ok (all 4)')

// book examples presence
const xt = fs.readFileSync('src/utils/chinese/wenyanXuciBank.ts', 'utf8')
const jt = fs.readFileSync('src/utils/chinese/wenyanJushiBank.ts', 'utf8')
const mustX = [
  '扣而聆之',
  '大王来何操',
  '宁有种乎',
  '乃不知有汉',
  '各爱其地',
  '咳且笑',
  '年相若',
  '为人所杀',
  '以俭为美德',
  '何加焉',
  '昼夜事也',
  '不以物喜',
  '因持璧却立',
  '取之于蓝',
  '三闾大夫与',
  '岳阳楼之大观',
  '陈涉者',
  '夜驰之沛公',
]
const mustJ = [
  '廉颇者，赵之良将也',
  '此乃臣效命之秋也',
  '非兵不利',
  '见笑于大方之家',
  '皆为戮没',
  '大王来何操',
  '不余欺也',
  '句读之不知',
  '籍何以至此',
  '蚓无爪牙之利',
  '何陋之有',
  '马之千里者',
  '语于富者',
  '甚矣，汝之不惠',
  '一鼓作气',
  '可烧而走',
  '掩户',
  '置水中',
]
for (const s of mustX) {
  if (!xt.includes(s)) console.log('MISSING xuci example', s)
}
for (const s of mustJ) {
  if (!jt.includes(s)) console.log('MISSING jushi example', s)
}
console.log('book example check done')
