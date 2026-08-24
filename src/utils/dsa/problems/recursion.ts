import { buildDsaProblem, casesFrom, indexProblems } from '@/utils/dsa/buildDsaProblem'

function sumToN(n: number) {
  if (!Number.isInteger(n) || n <= 0) return 0
  return (n * (n + 1)) / 2
}

function fibAt(n: number) {
  if (n === 1 || n === 2) return n - 1
  let a = 0
  let b = 1
  for (let i = 3; i <= n; i++) {
    const next = a + b
    a = b
    b = next
  }
  return b
}

const RECUR_NS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20, 24, 25, 30, 32, 40]
const TAIL_NS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 24, 30, 40, 50]
const FIB_NS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
const STACK_NS = [0, -1, -3, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20, 25, 32, 50, 64, 100]

export const RECURSION_PROBLEMS = indexProblems([
  buildDsaProblem({
    id: 'recur',
    title: '递归',
    intro: [
      '递归是一种通过函数调用自身来解决问题的方法：先递到终止条件，再逐层归并结果。',
      '请用递归计算 1 到 n 的和。n 为正整数。',
    ],
    fileName: 'recursion.ts',
    functionName: 'recur',
    header: '/* 递归 */',
    signature: 'function recur(n: number): number',
    purpose: '用递归返回 1 + 2 + … + n；终止条件为 n === 1',
    solution: `/* 递归 */
function recur(n: number): number {
    // 终止条件
    if (n === 1) return 1;
    // 递：递归调用
    const res = recur(n - 1);
    // 归：返回结果
    return n + res;
}
`,
    tests: casesFrom(RECUR_NS, sumToN, (n) => `n = ${n}`),
    complexity: {
      steps: [
        { label: '终止条件', expr: '1' },
        { label: '递归调用', expr: 'n-1' },
        { label: '每层归并', expr: 'n' },
      ],
      total: 'n',
      time: 'O(n)',
      spaceSteps: [
        { label: '调用栈深度', expr: 'n' },
      ],
      spaceTotal: 'n',
      space: 'O(n)',
    },
  }),
  buildDsaProblem({
    id: 'tail-recur',
    title: '尾递归',
    intro: [
      '尾递归指递归调用是函数返回前的最后一步。这样就不需要保存上一层调用的上下文，空间上可与迭代相当。',
      '请把累计和放到参数 res 里，用尾递归求 1 到 n 的和。初始调用为 tailRecur(n, 0)。',
    ],
    fileName: 'recursion.ts',
    functionName: 'tailRecur',
    header: '/* 尾递归 */',
    signature: 'function tailRecur(n: number, res: number): number',
    purpose: '用尾递归返回 res + n + (n-1) + … + 1；n === 0 时直接返回 res',
    solution: `/* 尾递归 */
function tailRecur(n: number, res: number): number {
    // 终止条件
    if (n === 0) return res;
    // 尾递归调用
    return tailRecur(n - 1, res + n);
}
`,
    tests: [
      ...casesFrom(TAIL_NS, (n) => sumToN(n), (n) => `n = ${n}, res = 0`, (n) => [n, 0]),
      { args: [3, 10], expect: 16, label: 'n = 3, res = 10' },
      { args: [5, 100], expect: 115, label: 'n = 5, res = 100' },
      { args: [0, 7], expect: 7, label: 'n = 0, res = 7' },
      { args: [7, 20], expect: 48, label: 'n = 7, res = 20' },
      { args: [1, 9], expect: 10, label: 'n = 1, res = 9' },
    ],
    complexity: {
      steps: [
        { label: '终止条件 n = 0', expr: '1' },
        { label: '尾递归调用', expr: 'n' },
      ],
      total: 'n+1',
      time: 'O(n)',
      spaceSteps: [
        { label: '理论（尾调用优化）', expr: '1' },
        { label: 'JavaScript 实际栈深', expr: 'n' },
      ],
      spaceTotal: 'n',
      space: 'O(n)',
      note: '尾递归理论上可优化成 O(1) 空间；JavaScript 不保证尾调用优化，实际仍是 O(n)。',
    },
  }),
  buildDsaProblem({
    id: 'fib',
    title: '递归树（斐波那契）',
    intro: [
      '给定斐波那契数列 0, 1, 1, 2, 3, 5, 8, 13, …，求该数列的第 n 个数字。',
      '设 f(1) = 0、f(2) = 1，其余 f(n) = f(n - 1) + f(n - 2)。请用递归实现。',
    ],
    fileName: 'recursion.ts',
    functionName: 'fib',
    header: '/* 斐波那契数列：递归 */',
    signature: 'function fib(n: number): number',
    purpose: '返回第 n 个斐波那契数（从 1 开始计数：f(1)=0，f(2)=1）',
    solution: `/* 斐波那契数列：递归 */
function fib(n: number): number {
    // 终止条件 f(1) = 0, f(2) = 1
    if (n === 1 || n === 2) return n - 1;
    // 递归调用 f(n) = f(n-1) + f(n-2)
    const res = fib(n - 1) + fib(n - 2);
    // 返回结果 f(n)
    return res;
}
`,
    tests: casesFrom(FIB_NS, fibAt, (n) => `n = ${n}`),
    complexity: {
      steps: [
        { label: '递归树节点数', expr: '2^n' },
      ],
      total: '2^n',
      time: 'O(2^n)',
      spaceSteps: [
        { label: '最深调用栈', expr: 'n' },
      ],
      spaceTotal: 'n',
      space: 'O(n)',
      note: '时间更精确是黄金分割比 φ 的 n 次方；栈上同时存活的帧只有一条路径，所以空间是 O(n)。',
    },
  }),
  buildDsaProblem({
    id: 'for-loop-recur',
    title: '迭代模拟递归',
    intro: [
      '函数调用会在系统调用栈上分配栈帧，「递」对应入栈，「归」对应出栈。因此可以用显式栈把递归改成迭代。',
      '请用栈模拟递归，计算 1 到 n 的和。',
    ],
    fileName: 'recursion.ts',
    functionName: 'forLoopRecur',
    header: '/* 使用迭代模拟递归 */',
    signature: 'function forLoopRecur(n: number): number',
    purpose: '用显式栈模拟递归的「递」与「归」，返回 1 + 2 + … + n；n <= 0 时返回 0',
    solution: `/* 使用迭代模拟递归 */
function forLoopRecur(n: number): number {
    // 使用一个显式的栈来模拟系统调用栈
    const stack: number[] = [];
    let res = 0;
    // 递：递归调用
    for (let i = n; i > 0; i--) {
        // 通过“入栈操作”模拟“递”
        stack.push(i);
    }
    // 归：返回结果
    while (stack.length) {
        // 通过“出栈操作”模拟“归”
        res += stack.pop()!;
    }
    // res = 1+2+3+...+n
    return res;
}
`,
    tests: casesFrom(STACK_NS, sumToN, (n) => `n = ${n}`),
    complexity: {
      steps: [
        { label: '入栈（递）', expr: 'n' },
        { label: '出栈（归）', expr: 'n' },
      ],
      total: '2n',
      time: 'O(n)',
      spaceSteps: [
        { label: '显式栈长度', expr: 'n' },
      ],
      spaceTotal: 'n',
      space: 'O(n)',
    },
  }),
])
