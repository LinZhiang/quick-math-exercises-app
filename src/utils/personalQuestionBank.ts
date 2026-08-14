/**
 * 个人题库：大类 / 小类 / 题目 本地存储。
 */
import {
  plainTextToRichHtml,
  richHtmlIsEmpty,
  richHtmlPlainText,
  sanitizeRichHtml,
} from '@/utils/richTextHtml'

export const PERSONAL_BANK_STORAGE_KEY = 'personal-question-bank-v1'

export const PERSONAL_BANK_QUESTION_TYPES = [
  { id: 'short-answer', label: '简答题' },
  { id: 'choice', label: '选择题' },
] as const

export type PersonalBankQuestionType = (typeof PERSONAL_BANK_QUESTION_TYPES)[number]['id']

export type PersonalBankQuestion = {
  id: string
  title: string
  type: PersonalBankQuestionType
  score: number
  stemHtml: string
  /** 简答题纯文本答案；选择题为正确项纯文本快照 */
  answer: string
  /** 选择题正确选项（富文本）；简答题可为空 */
  answerHtml: string
  explanationHtml: string
  /** 进入测验并完成本题的次数 */
  quizCount: number
  createdAt: number
  updatedAt: number
}

export type PersonalBankQuestionInput = {
  title: string
  type: PersonalBankQuestionType
  score: number
  stemHtml: string
  answer: string
  answerHtml: string
  explanationHtml: string
}

export type PersonalBankQuizScope = 'short-answer' | 'choice' | 'all'

export type PersonalBankSubCategory = {
  id: string
  name: string
  createdAt: number
  questions: PersonalBankQuestion[]
}

export type PersonalBankCategory = {
  id: string
  name: string
  createdAt: number
  subs: PersonalBankSubCategory[]
}

export type PersonalBankStore = {
  categories: PersonalBankCategory[]
}

export const DEFAULT_PERSONAL_BANK_SCORE = 2

function emptyStore(): PersonalBankStore {
  return { categories: [] }
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function personalBankQuestionTypeLabel(type: string): string {
  return PERSONAL_BANK_QUESTION_TYPES.find((t) => t.id === type)?.label ?? type
}

export function personalBankModeId(subId: string): string {
  return `personal-bank-${subId}`
}

function isQuestionType(v: unknown): v is PersonalBankQuestionType {
  return PERSONAL_BANK_QUESTION_TYPES.some((t) => t.id === v)
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PERSONAL_BANK_SCORE
  const rounded = Math.round(n * 2) / 2
  return Math.min(100, Math.max(0.5, rounded))
}

function normalizeQuestion(raw: unknown): PersonalBankQuestion | null {
  if (!raw || typeof raw !== 'object') return null
  const q = raw as Record<string, unknown>
  const id = String(q.id ?? '')
  const title = String(q.title ?? '').trim()
  if (!id || !title || !isQuestionType(q.type)) return null
  const stemHtml = sanitizeRichHtml(String(q.stemHtml ?? ''))
  if (richHtmlIsEmpty(stemHtml)) return null
  const now = Date.now()
  let answer = String(q.answer ?? '').trim()
  let answerHtml = sanitizeRichHtml(String(q.answerHtml ?? ''))
  if (q.type === 'choice') {
    if (richHtmlIsEmpty(answerHtml)) {
      if (!answer) return null
      answerHtml = plainTextToRichHtml(answer)
    }
    if (richHtmlIsEmpty(answerHtml)) return null
    answer = richHtmlPlainText(answerHtml, 5000)
  } else if (!answer) {
    answer = richHtmlPlainText(answerHtml, 5000)
    answerHtml = ''
    if (!answer) return null
  } else {
    answerHtml = ''
  }
  return {
    id,
    title,
    type: q.type,
    score: clampScore(Number(q.score)),
    stemHtml,
    answer,
    answerHtml,
    explanationHtml: sanitizeRichHtml(String(q.explanationHtml ?? '')),
    quizCount: Math.max(0, Math.floor(Number(q.quizCount) || 0)),
    createdAt: Number(q.createdAt) || now,
    updatedAt: Number(q.updatedAt) || now,
  }
}

function normalizeInput(input: PersonalBankQuestionInput): PersonalBankQuestionInput {
  const title = input.title.trim()
  if (!title) throw new Error('请输入标题')
  if (!isQuestionType(input.type)) throw new Error('请选择题型')
  const stemHtml = sanitizeRichHtml(input.stemHtml ?? '')
  if (richHtmlIsEmpty(stemHtml)) throw new Error('请输入题目')
  if (input.type === 'choice') {
    const answerHtml = sanitizeRichHtml(input.answerHtml ?? '')
    if (richHtmlIsEmpty(answerHtml)) throw new Error('请输入正确答案（富文本）')
    return {
      title,
      type: input.type,
      score: clampScore(Number(input.score)),
      stemHtml,
      answer: richHtmlPlainText(answerHtml, 5000),
      answerHtml,
      explanationHtml: sanitizeRichHtml(input.explanationHtml ?? ''),
    }
  }
  const answer = String(input.answer ?? '').trim()
  if (!answer) throw new Error('请输入答案')
  return {
    title,
    type: input.type,
    score: clampScore(Number(input.score)),
    stemHtml,
    answer,
    answerHtml: '',
    explanationHtml: sanitizeRichHtml(input.explanationHtml ?? ''),
  }
}

function readStore(): PersonalBankStore {
  try {
    if (typeof localStorage === 'undefined') return emptyStore()
    const raw = localStorage.getItem(PERSONAL_BANK_STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as PersonalBankStore
    if (!parsed || !Array.isArray(parsed.categories)) return emptyStore()
    return {
      categories: parsed.categories
        .map((c) => ({
          id: String(c.id ?? ''),
          name: String(c.name ?? '').trim(),
          createdAt: Number(c.createdAt) || Date.now(),
          subs: Array.isArray(c.subs)
            ? c.subs
                .map((s) => ({
                  id: String(s.id ?? ''),
                  name: String(s.name ?? '').trim(),
                  createdAt: Number(s.createdAt) || Date.now(),
                  questions: Array.isArray(s.questions)
                    ? s.questions.map(normalizeQuestion).filter((q): q is PersonalBankQuestion => q != null)
                    : [],
                }))
                .filter((s) => s.id && s.name)
            : [],
        }))
        .filter((c) => c.id && c.name),
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(store: PersonalBankStore) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(PERSONAL_BANK_STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

export function listPersonalBankCategories(): PersonalBankCategory[] {
  return readStore().categories
}

export function getPersonalBankCategory(categoryId: string): PersonalBankCategory | null {
  return readStore().categories.find((c) => c.id === categoryId) ?? null
}

export function getPersonalBankSub(
  categoryId: string,
  subId: string,
): { category: PersonalBankCategory; sub: PersonalBankSubCategory } | null {
  const category = getPersonalBankCategory(categoryId)
  if (!category) return null
  const sub = category.subs.find((s) => s.id === subId)
  if (!sub) return null
  return { category, sub }
}

export function findPersonalBankSubById(
  subId: string,
): { category: PersonalBankCategory; sub: PersonalBankSubCategory } | null {
  for (const category of readStore().categories) {
    const sub = category.subs.find((s) => s.id === subId)
    if (sub) return { category, sub }
  }
  return null
}

function assertUniqueName(names: string[], name: string, exceptId?: string, idOf?: (i: number) => string) {
  const n = name.trim()
  const hit = names.findIndex((x, i) => x === n && (!exceptId || !idOf || idOf(i) !== exceptId))
  if (hit >= 0) throw new Error('已有同名分类')
}

export function createPersonalBankCategory(name: string): PersonalBankCategory {
  const n = name.trim()
  if (!n) throw new Error('请输入大类名称')
  const store = readStore()
  assertUniqueName(
    store.categories.map((c) => c.name),
    n,
  )
  const row: PersonalBankCategory = {
    id: createId('cat'),
    name: n,
    createdAt: Date.now(),
    subs: [],
  }
  store.categories.push(row)
  writeStore(store)
  return row
}

export function renamePersonalBankCategory(categoryId: string, name: string): void {
  const n = name.trim()
  if (!n) throw new Error('请输入大类名称')
  const store = readStore()
  const row = store.categories.find((c) => c.id === categoryId)
  if (!row) throw new Error('大类不存在')
  assertUniqueName(
    store.categories.map((c) => c.name),
    n,
    categoryId,
    (i) => store.categories[i]!.id,
  )
  row.name = n
  writeStore(store)
}

export function deletePersonalBankCategory(categoryId: string): void {
  const store = readStore()
  store.categories = store.categories.filter((c) => c.id !== categoryId)
  writeStore(store)
}

export function createPersonalBankSub(categoryId: string, name: string): PersonalBankSubCategory {
  const n = name.trim()
  if (!n) throw new Error('请输入小类名称')
  const store = readStore()
  const cat = store.categories.find((c) => c.id === categoryId)
  if (!cat) throw new Error('请先创建大类')
  assertUniqueName(
    cat.subs.map((s) => s.name),
    n,
  )
  const row: PersonalBankSubCategory = {
    id: createId('sub'),
    name: n,
    createdAt: Date.now(),
    questions: [],
  }
  cat.subs.push(row)
  writeStore(store)
  return row
}

export function renamePersonalBankSub(categoryId: string, subId: string, name: string): void {
  const n = name.trim()
  if (!n) throw new Error('请输入小类名称')
  const store = readStore()
  const cat = store.categories.find((c) => c.id === categoryId)
  if (!cat) throw new Error('大类不存在')
  const sub = cat.subs.find((s) => s.id === subId)
  if (!sub) throw new Error('小类不存在')
  assertUniqueName(
    cat.subs.map((s) => s.name),
    n,
    subId,
    (i) => cat.subs[i]!.id,
  )
  sub.name = n
  writeStore(store)
}

export function deletePersonalBankSub(categoryId: string, subId: string): void {
  const store = readStore()
  const cat = store.categories.find((c) => c.id === categoryId)
  if (!cat) return
  cat.subs = cat.subs.filter((s) => s.id !== subId)
  writeStore(store)
}

function requireSub(store: PersonalBankStore, categoryId: string, subId: string): PersonalBankSubCategory {
  const cat = store.categories.find((c) => c.id === categoryId)
  if (!cat) throw new Error('大类不存在')
  const sub = cat.subs.find((s) => s.id === subId)
  if (!sub) throw new Error('小类不存在')
  return sub
}

export function createPersonalBankQuestion(
  categoryId: string,
  subId: string,
  input: PersonalBankQuestionInput,
): PersonalBankQuestion {
  const body = normalizeInput(input)
  const store = readStore()
  const sub = requireSub(store, categoryId, subId)
  const now = Date.now()
  const row: PersonalBankQuestion = {
    id: createId('q'),
    ...body,
    quizCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  sub.questions.push(row)
  writeStore(store)
  return row
}

export function updatePersonalBankQuestion(
  categoryId: string,
  subId: string,
  questionId: string,
  input: PersonalBankQuestionInput,
): void {
  const body = normalizeInput(input)
  const store = readStore()
  const sub = requireSub(store, categoryId, subId)
  const row = sub.questions.find((q) => q.id === questionId)
  if (!row) throw new Error('题目不存在')
  Object.assign(row, body, { updatedAt: Date.now() })
  writeStore(store)
}

export function deletePersonalBankQuestion(categoryId: string, subId: string, questionId: string): void {
  const store = readStore()
  const sub = requireSub(store, categoryId, subId)
  sub.questions = sub.questions.filter((q) => q.id !== questionId)
  writeStore(store)
}

export function incrementPersonalBankQuestionQuizCount(
  categoryId: string,
  subId: string,
  questionId: string,
): number {
  const store = readStore()
  const sub = requireSub(store, categoryId, subId)
  const row = sub.questions.find((q) => q.id === questionId)
  if (!row) return 0
  row.quizCount = (row.quizCount || 0) + 1
  writeStore(store)
  return row.quizCount
}

export function filterPersonalBankQuestionsByScope(
  questions: PersonalBankQuestion[],
  scope: PersonalBankQuizScope,
): PersonalBankQuestion[] {
  if (scope === 'all') return [...questions]
  return questions.filter((q) => q.type === scope)
}
