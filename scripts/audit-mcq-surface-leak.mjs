/**
 * 自检：字数/标点泄题样本是否被 mcqOptionSurfaceLeakFailure 拦住
 * 运行：node scripts/audit-mcq-surface-leak.mjs
 */

function mcqOptionVisibleLength(s) {
  return String(s ?? '')
    .trim()
    .replace(/\s+/g, '')
    .length
}

function mcqOptionPunctCount(s) {
  const m = String(s ?? '').match(/[，,；;、：:。.！!？?（）()《》「」""''—…·]/g)
  return m?.length ?? 0
}

function mcqOptionSurfaceLeakFailure(options, correctIndex) {
  if (!Array.isArray(options) || options.length !== 4) return '结构不完整'
  if (correctIndex < 0 || correctIndex > 3) return 'correctIndex 非法'

  const lengths = options.map(mcqOptionVisibleLength)
  const puncts = options.map(mcqOptionPunctCount)
  const cLen = lengths[correctIndex]
  const cPunct = puncts[correctIndex]
  const otherLens = lengths.filter((_, i) => i !== correctIndex)
  const otherPuncts = puncts.filter((_, i) => i !== correctIndex)
  const maxOtherLen = Math.max(...otherLens)
  const minOtherLen = Math.min(...otherLens)
  const maxOtherPunct = Math.max(...otherPuncts)
  const minOtherPunct = Math.min(...otherPuncts)
  const maxLen = Math.max(...lengths)
  const minLen = Math.min(...lengths)
  const span = maxLen - minLen
  const sortedLens = [...lengths].sort((a, b) => a - b)
  const medianLen = sortedLens[1]
  const longForm = maxLen >= 7

  const uniqueLongest =
    cLen === maxLen && lengths.filter((n) => n === maxLen).length === 1
  if (uniqueLongest && cLen > maxOtherLen) {
    return '正确项独最长，可凭字数蒙对'
  }
  if (cLen === maxLen && span >= (longForm ? 5 : 3)) {
    return '选项长短跨度过大且正确项处于最长档'
  }
  if (cLen === maxLen && cLen - medianLen >= 2) {
    return '正确项相对中位明显偏长，可凭字数偏向蒙对'
  }
  if (cPunct > maxOtherPunct) {
    return '正确项标点多于其它项，可凭标点蒙对'
  }
  {
    const heavy = (s) => /[，,；;、]/.test(s)
    const correctHeavy = heavy(options[correctIndex])
    const othersHeavyCount = options.filter(
      (_, i) => i !== correctIndex && heavy(options[i]),
    ).length
    if (correctHeavy && othersHeavyCount === 0) {
      return '仅正确项含逗号/顿号/分号，可凭标点蒙对'
    }
  }
  if (cLen > maxOtherLen && cPunct >= maxOtherPunct && cLen - minOtherLen >= 2) {
    return '正确项同时更长且标点不少于干扰项，表面特征泄题'
  }
  if (cPunct >= 1 && maxOtherPunct === 0 && minOtherPunct === 0 && cLen >= 4) {
    return '仅正确项含标点，可凭标点蒙对'
  }
  return null
}

const cases = [
  {
    name: '释义独最长+独逗号',
    expectFail: true,
    options: ['顾全爱惜，珍惜', '回顾珍惜过往', '可惜遗憾情绪', '照顾怜惜弱者'],
    ci: 0,
  },
  {
    name: '释义独最长带逗号（砥砺类）',
    expectFail: true,
    options: ['磨炼意志，相互勉励', '抵抗外部压力', '严格监督下属', '打磨石材器具'],
    ci: 0,
  },
  {
    name: '正确独最长 1 字',
    expectFail: true,
    options: [
      '产业振兴是乡村振兴的重点任务啊',
      '完善乡村基础设施应作为着力点',
      '吸引人才回流带动产业升级',
      '组织建设应重排工作次序',
    ],
    ci: 0,
  },
  {
    name: '两长两短正确在长档',
    expectFail: true,
    options: [
      '产业振兴是乡村振兴的重点任务',
      '完善乡村基础设施应作为着力点',
      '吸引人才回流带动产业升级',
      '组织建设应重排工作次序',
    ],
    ci: 0,
  },
  {
    name: '标点独多（字数接近）',
    expectFail: true,
    options: [
      '既要抓产业，又要抓人才',
      '完善乡村基础设施为首要',
      '吸引人才回流带动产业',
      '组织建设应重排工作序',
    ],
    ci: 0,
  },
  {
    name: '仅正确有标点',
    expectFail: true,
    options: ['重点是产业，同时兼顾人才', '完善乡村基础设施', '吸引人才回流即可', '组织建设统领一切'],
    ci: 0,
  },
  {
    name: '齐整近义释义（应通过）',
    expectFail: false,
    options: ['顾全爱惜', '顾念爱护', '怜惜体恤', '眷顾思念'],
    ci: 0,
  },
  {
    name: '干扰项更长（应通过）',
    expectFail: false,
    options: [
      '产业振兴是乡村振兴的重点',
      '完善乡村基础设施应作为当前首要着力点',
      '吸引人才回流即可自然带动全面升级',
      '组织建设应重新排定产业与人才次序',
    ],
    ci: 0,
  },
  {
    name: '并列最长且跨度小（应通过）',
    expectFail: false,
    options: [
      '产业振兴是乡村振兴的重点任务',
      '完善乡村基础设施是当前首要任务',
      '吸引人才回流带动乡村产业升级',
      '组织建设应重排产业人才工作',
    ],
    ci: 0,
  },
]

let failed = 0
for (const c of cases) {
  const reason = mcqOptionSurfaceLeakFailure(c.options, c.ci)
  const gotFail = reason != null
  const ok = gotFail === c.expectFail
  if (!ok) failed += 1
  console.log(
    `${ok ? 'OK' : 'FAIL'} | ${c.name} | expectFail=${c.expectFail} got=${gotFail ? reason : 'pass'}`,
  )
}
if (failed) {
  console.error(`\n${failed} case(s) mismatched`)
  process.exit(1)
}
console.log(`\n全部 ${cases.length} 例符合预期`)
