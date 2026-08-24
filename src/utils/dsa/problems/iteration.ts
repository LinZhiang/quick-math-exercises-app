import { buildDsaProblem, casesFrom, indexProblems } from '@/utils/dsa/buildDsaProblem'

function sumToN(n: number) {
  if (!Number.isInteger(n) || n <= 0) return 0
  return (n * (n + 1)) / 2
}

function whileLoopII(n: number) {
  let res = 0
  let i = 1
  while (i <= n) {
    res += i
    i++
    i *= 2
  }
  return res
}

function nestedForLoop(n: number) {
  let res = ''
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      res += `(${i}, ${j}), `
    }
  }
  return res
}

const SUM_NS = [
  0, -1, -3, -10, 1, 2, 3, 4, 6, 8, 9, 11, 12, 13, 15, 16, 18, 21, 24, 25, 32, 42, 50, 64, 75, 99, 100, 128, 150, 200,
]

const WHILE_II_NS = [
  0, -1, -5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 21, 22, 45, 46, 93, 94, 100, 189, 190, 200, 381, 382, 500, 1000,
]

const NESTED_NS = [0, -1, -2, 1, 2, 3, 4, 5, 6, 7, 8]

export const ITERATION_PROBLEMS = indexProblems([
  buildDsaProblem({
    id: 'for-loop',
    title: 'for 循环',
    intro: [
      'for 循环适合在预先知道循环次数时使用，代码也更紧凑。',
      '请用 for 循环完成 1 到 n 的求和。',
    ],
    fileName: 'iteration.ts',
    functionName: 'forLoop',
    header: '/* for 循环 */',
    signature: 'function forLoop(n: number): number',
    purpose: '返回 1 + 2 + … + n；n 不是正整数时返回 0',
    solution: `/* for 循环 */
function forLoop(n: number): number {
    let res = 0;
    for (let i = 1; i <= n; i++) {
        res += i;
    }
    return res;
}
`,
    tests: casesFrom(SUM_NS, sumToN, (n) => `n = ${n}`),
    complexity: {
      steps: [
        { label: '初始化 i = 1', expr: '1' },
        { label: '判断 i ≤ n', expr: 'n+1' },
        { label: '更新 i++', expr: 'n' },
        { label: '循环体', expr: 'n' },
      ],
      total: '3n+2',
      time: 'O(n)',
      spaceSteps: [
        { label: '变量 res、i', expr: '1' },
      ],
      spaceTotal: '1',
      space: 'O(1)',
    },
  }),
  buildDsaProblem({
    id: 'while-loop',
    title: 'while 循环',
    intro: [
      'while 循环每次执行前先判断条件，条件不成立就结束。',
      '请用 while 循环完成 1 到 n 的求和。',
    ],
    fileName: 'iteration.ts',
    functionName: 'whileLoop',
    header: '/* while 循环 */',
    signature: 'function whileLoop(n: number): number',
    purpose: '用 while 循环返回 1 + 2 + … + n；n 不是正整数时返回 0',
    solution: `/* while 循环 */
function whileLoop(n: number): number {
    let res = 0;
    let i = 1;
    while (i <= n) {
        res += i;
        i++;
    }
    return res;
}
`,
    tests: casesFrom(SUM_NS, sumToN, (n) => `n = ${n}`),
    complexity: {
      steps: [
        { label: '初始化 i = 1', expr: '1' },
        { label: '判断 i ≤ n', expr: 'n+1' },
        { label: '循环体', expr: 'n' },
        { label: '更新 i++', expr: 'n' },
      ],
      total: '3n+2',
      time: 'O(n)',
      spaceSteps: [
        { label: '变量 res、i', expr: '1' },
      ],
      spaceTotal: '1',
      space: 'O(1)',
    },
  }),
  buildDsaProblem({
    id: 'while-loop-ii',
    title: 'while 循环（两次更新）',
    intro: [
      'while 循环比 for 循环的自由度更高，可以自由设计条件变量的初始化和更新步骤。',
      '下面这个例子里，条件变量 i 每轮更新两次，这种情况不太方便用 for 循环实现。请对序列 1, 4, 10, 22, … 中不超过 n 的项求和。',
    ],
    fileName: 'iteration.ts',
    functionName: 'whileLoopII',
    header: '/* while 循环（两次更新） */',
    signature: 'function whileLoopII(n: number): number',
    purpose: '对序列 1, 4, 10, 22, …（下一轮 i = (i + 1) * 2）中所有不超过 n 的项求和',
    solution: `/* while 循环（两次更新） */
function whileLoopII(n: number): number {
    let res = 0;
    let i = 1; // 初始化条件变量
    // 循环求和 1, 4, 10, ...
    while (i <= n) {
        res += i;
        // 更新条件变量
        i++;
        i *= 2;
    }
    return res;
}
`,
    tests: casesFrom(WHILE_II_NS, whileLoopII, (n) => `n = ${n}`),
    complexity: {
      steps: [
        { label: '初始化 i = 1', expr: '1' },
        { label: '每轮 i 约翻倍', expr: 'i = 2(i+1)' },
        { label: '循环次数', expr: 'log_2 n' },
      ],
      total: 'log_2 n',
      time: 'O(log n)',
      spaceSteps: [
        { label: '变量 res、i', expr: '1' },
      ],
      spaceTotal: '1',
      space: 'O(1)',
      note: '条件变量每轮大约乘 2，循环次数是对数级。',
    },
  }),
  buildDsaProblem({
    id: 'nested-for-loop',
    title: '嵌套循环',
    intro: [
      '可以在一个循环结构内再嵌套另一个循环结构。下面以双层 for 循环为例。',
      '请按行优先拼出从 (1, 1) 到 (n, n) 的所有坐标对字符串。',
    ],
    fileName: 'iteration.ts',
    functionName: 'nestedForLoop',
    header: '/* 双层 for 循环 */',
    signature: 'function nestedForLoop(n: number): string',
    purpose: '拼出 "(1, 1), (1, 2), …, (n, n), " 形式的字符串（每项都含逗号和空格）；n < 1 时返回空字符串',
    solution: `/* 双层 for 循环 */
function nestedForLoop(n: number): string {
    let res = '';
    // 循环 i = 1, 2, ..., n-1, n
    for (let i = 1; i <= n; i++) {
        // 循环 j = 1, 2, ..., n-1, n
        for (let j = 1; j <= n; j++) {
            res += \`(\${i}, \${j}), \`;
        }
    }
    return res;
}
`,
    tests: casesFrom(NESTED_NS, nestedForLoop, (n) => `n = ${n}`),
    complexity: {
      steps: [
        { label: '外层循环', expr: 'n' },
        { label: '内层循环（每轮）', expr: 'n' },
        { label: '循环体总次数', expr: 'n^2' },
      ],
      total: 'n^2',
      time: 'O(n^2)',
      spaceSteps: [
        { label: '辅助变量 i、j', expr: '1' },
        { label: '结果字符串', expr: 'n^2' },
      ],
      spaceTotal: 'n^2',
      space: 'O(n^2)',
    },
  }),
])
