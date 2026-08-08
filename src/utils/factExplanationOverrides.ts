/**
 * 生活常识 / 这是什么 / 经济学常识 / 体制管理 / 文言实词：用户可编辑的解析覆盖（按题库 key 持久化）。
 */
import { ref } from 'vue'

export type FactBankKind =
  | 'life-sense'
  | 'what-is-this'
  | 'economy-sense'
  | 'system-mgmt'
  | 'wenyan-shici'
  | 'wenyan-xuci'
  | 'wenyan-jushi'
  | 'rhetoric-device'

const STORAGE_KEY = 'fact-explanation-overrides-v1'
const MAX_ENTRIES = 800

export type FactExplanationOverrideStore = {
  v: 1
  /** kind\u001ekey → 用户解析 */
  entries: Record<string, string>
}

/** 变更时递增，驱动界面刷新 */
export const factExplanationOverrideTick = ref(0)

function storageKey(kind: FactBankKind, bankKey: string): string {
  return `${kind}\u001e${bankKey.trim()}`
}

function readStore(): FactExplanationOverrideStore {
  try {
    if (typeof localStorage === 'undefined') return { v: 1, entries: {} }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { v: 1, entries: {} }
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return { v: 1, entries: {} }
    const entries = (parsed as FactExplanationOverrideStore).entries
    if (!entries || typeof entries !== 'object') return { v: 1, entries: {} }
    return { v: 1, entries: entries as Record<string, string> }
  } catch {
    return { v: 1, entries: {} }
  }
}

function writeStore(store: FactExplanationOverrideStore) {
  if (typeof localStorage === 'undefined') return
  const keys = Object.keys(store.entries)
  if (keys.length > MAX_ENTRIES) {
    // 无时间戳时按 key 名粗暴裁剪；优先保留较新写入靠后的近似：删前面一半
    const drop = keys.length - MAX_ENTRIES
    for (let i = 0; i < drop; i++) {
      const k = keys[i]
      if (k) delete store.entries[k]
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  factExplanationOverrideTick.value += 1
}

/** 读取覆盖后的解析；无覆盖则返回题库原文 */
export function resolveFactExplanation(
  kind: FactBankKind,
  bankKey: string,
  baseExplanation: string,
): string {
  void factExplanationOverrideTick.value
  const k = String(bankKey ?? '').trim()
  if (!k) return String(baseExplanation ?? '').trim()
  const hit = readStore().entries[storageKey(kind, k)]
  if (hit == null) return String(baseExplanation ?? '').trim()
  return String(hit).trim()
}

export function getFactExplanationOverride(
  kind: FactBankKind,
  bankKey: string,
): string | null {
  void factExplanationOverrideTick.value
  const k = String(bankKey ?? '').trim()
  if (!k) return null
  const hit = readStore().entries[storageKey(kind, k)]
  return hit == null ? null : String(hit)
}

/** 写入用户解析；空字符串表示恢复题库原文 */
export function setFactExplanationOverride(
  kind: FactBankKind,
  bankKey: string,
  explanation: string,
  baseExplanation?: string,
): void {
  const k = String(bankKey ?? '').trim()
  if (!k) return
  const next = String(explanation ?? '').trim()
  const base = String(baseExplanation ?? '').trim()
  const store = readStore()
  const sk = storageKey(kind, k)
  if (!next || (base && next === base)) {
    if (sk in store.entries) {
      delete store.entries[sk]
      writeStore(store)
    }
    return
  }
  store.entries[sk] = next
  writeStore(store)
}

export function clearFactExplanationOverride(kind: FactBankKind, bankKey: string): void {
  setFactExplanationOverride(kind, bankKey, '')
}

export const FACT_EXPLANATION_OVERRIDES_STORAGE_KEY = STORAGE_KEY
