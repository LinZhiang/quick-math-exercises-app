import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { upsertFrontendLearningBranch } from '../server/frontend-learning-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = 'G:\\考编\\es6-tutorial-master\\es6-tutorial-master\\docs'
const seedFile = path.join(root, 'server', 'seeds', 'frontend-learning-seed.json')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')

const GROUPS = [
  {
    id: 'fl-es6-intro',
    name: '入门与变量',
    chapters: [
      { id: 'fl-es6-intro-overview', title: 'ECMAScript 6 简介', file: 'intro.md' },
      { id: 'fl-es6-let-const', title: 'let 和 const 命令', file: 'let.md' },
      { id: 'fl-es6-destructuring', title: '变量的解构赋值', file: 'destructuring.md' },
    ],
  },
  {
    id: 'fl-es6-syntax',
    name: '语法扩展',
    chapters: [
      { id: 'fl-es6-string', title: '字符串的扩展', file: 'string.md' },
      { id: 'fl-es6-string-methods', title: '字符串的新增方法', file: 'string-methods.md' },
      { id: 'fl-es6-regex', title: '正则的扩展', file: 'regex.md' },
      { id: 'fl-es6-number', title: '数值的扩展', file: 'number.md' },
      { id: 'fl-es6-function', title: '函数的扩展', file: 'function.md' },
      { id: 'fl-es6-array', title: '数组的扩展', file: 'array.md' },
      { id: 'fl-es6-object', title: '对象的扩展', file: 'object.md' },
      { id: 'fl-es6-object-methods', title: '对象的新增方法', file: 'object-methods.md' },
      { id: 'fl-es6-operator', title: '运算符的扩展', file: 'operator.md' },
    ],
  },
  {
    id: 'fl-es6-primitives',
    name: '新类型与元编程',
    chapters: [
      { id: 'fl-es6-symbol', title: 'Symbol', file: 'symbol.md' },
      { id: 'fl-es6-set-map', title: 'Set 和 Map 数据结构', file: 'set-map.md' },
      { id: 'fl-es6-proxy', title: 'Proxy', file: 'proxy.md' },
      { id: 'fl-es6-reflect', title: 'Reflect', file: 'reflect.md' },
    ],
  },
  {
    id: 'fl-es6-async',
    name: '异步与迭代',
    chapters: [
      { id: 'fl-es6-promise', title: 'Promise 对象', file: 'promise.md' },
      { id: 'fl-es6-iterator', title: 'Iterator 和 for...of 循环', file: 'iterator.md' },
      { id: 'fl-es6-generator', title: 'Generator 函数的语法', file: 'generator.md' },
      { id: 'fl-es6-generator-async', title: 'Generator 函数的异步应用', file: 'generator-async.md' },
      { id: 'fl-es6-async-fn', title: 'async 函数', file: 'async.md' },
    ],
  },
  {
    id: 'fl-es6-class-module',
    name: 'Class 与 Module',
    chapters: [
      { id: 'fl-es6-class', title: 'Class 的基本语法', file: 'class.md' },
      { id: 'fl-es6-class-extends', title: 'Class 的继承', file: 'class-extends.md' },
      { id: 'fl-es6-module', title: 'Module 的语法', file: 'module.md' },
      { id: 'fl-es6-module-loader', title: 'Module 的加载实现', file: 'module-loader.md' },
    ],
  },
  {
    id: 'fl-es6-advanced',
    name: '进阶专题',
    chapters: [
      { id: 'fl-es6-style', title: '编程风格', file: 'style.md' },
      { id: 'fl-es6-spec', title: '读懂规格', file: 'spec.md' },
      { id: 'fl-es6-async-iterator', title: '异步遍历器', file: 'async-iterator.md' },
      { id: 'fl-es6-arraybuffer', title: 'ArrayBuffer', file: 'arraybuffer.md' },
      { id: 'fl-es6-proposals', title: '最新提案', file: 'proposals.md' },
      { id: 'fl-es6-decorator', title: 'Decorator', file: 'decorator.md' },
    ],
  },
]

function tidyMarkdown(raw, title) {
  let s = String(raw ?? '').replace(/\r\n/g, '\n').trim()
  s = s.replace(/\n## 参考[链连][\s\S]*$/u, '').trim()
  s = s.replace(/^# .+$/m, `# ${title}`)
  s = s.replace(/```javascript/g, '```js')
  s = s.replace(/[ \t]+\n/g, '\n')
  s = s.replace(/\n{3,}/g, '\n\n')
  return `${s.trim()}\n`
}

function syncSeedFromLive() {
  const catalog = JSON.parse(fs.readFileSync(path.join(dataRoot, 'catalog.json'), 'utf8'))
  const itemsDir = path.join(dataRoot, 'items')
  const items = {}
  for (const name of fs.readdirSync(itemsDir)) {
    if (!name.endsWith('.json')) continue
    const item = JSON.parse(fs.readFileSync(path.join(itemsDir, name), 'utf8'))
    if (item?.id) items[item.id] = item
  }
  fs.writeFileSync(seedFile, `${JSON.stringify({ tree: catalog.tree, items }, null, 2)}\n`, 'utf8')
}

const children = GROUPS.map((group) => ({
  id: group.id,
  name: group.name,
  items: group.chapters.map((ch) => {
    const file = path.join(srcDir, ch.file)
    if (!fs.existsSync(file)) throw new Error(`找不到源文件 ${ch.file}`)
    if (ch.file === 'reference.md') throw new Error('参考链接不应入库')
    const md = tidyMarkdown(fs.readFileSync(file, 'utf8'), ch.title)
    if (!md.startsWith(`# ${ch.title}`)) throw new Error(`${ch.file} 标题整理失败`)
    if (/## 参考[链连]/.test(md)) throw new Error(`${ch.file} 参考链接未剔除`)
    if (/^\d+(?:\.\d+)*\.?\s+/.test(ch.title)) throw new Error(`${ch.file} 标题带了序号`)
    return {
      id: ch.id,
      title: ch.title,
      type: 'handout',
      learningPath: ['ES6 前端', group.name],
      tags: ['讲义', 'ES6', group.name, ch.title],
      content: md,
    }
  }),
}))

const result = upsertFrontendLearningBranch({
  id: 'fl-es6',
  name: 'ES6 前端',
  afterId: 'fl-frontend-basics',
  children,
})
syncSeedFromLive()

console.log(
  JSON.stringify(
    {
      branch: result.branch.name,
      itemCount: result.itemCount,
      groups: result.branch.children.map((c) => ({
        name: c.name,
        entries: c.entries.map((e) => ({ title: e.title, ready: e.ready })),
      })),
    },
    null,
    2,
  ),
)
