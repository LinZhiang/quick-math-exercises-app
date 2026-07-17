/**
 * 必须在读取 process.env 之前加载 server/.env（ESM 下 import 会提升执行顺序）
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env'), override: true })
