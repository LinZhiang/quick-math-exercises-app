import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { importComputerBasicsFromBankPack } from '../computer-basics-store.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packPath =
  process.argv[2] ||
  path.resolve('G:/计算机学习/题库json/wengu-zhixuewang-bank-pack-1786994533820.json')

const result = importComputerBasicsFromBankPack(packPath)
console.log(JSON.stringify(result.tree.map((n) => ({ id: n.id, name: n.name, children: n.children.length, entries: n.entries.length })), null, 2))
