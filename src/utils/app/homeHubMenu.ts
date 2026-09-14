/**
 * 首页卡片显示习惯：未登录写本机缓存；登录后随 user-kv 进 Node。
 */
import {
  HOME_HUB_DEFAULT_HIDDEN,
  HOME_HUB_PINNED_ID,
  isHomeHubModuleId,
  type HomeHubModuleId,
} from '@/constants/home-hub-modules'
import { readUserJson, userJsonEpoch, writeUserJson } from '@/utils/app/syncedUserJson'

export const HOME_HUB_MENU_KEY = 'home-hub-menu-v1'

export type HomeHubMenuState = {
  hidden: HomeHubModuleId[]
}

const DEFAULT_STATE: HomeHubMenuState = {
  hidden: [...HOME_HUB_DEFAULT_HIDDEN],
}

function normalizeMenu(raw: unknown): HomeHubMenuState {
  const hidden: HomeHubModuleId[] = []
  const seen = new Set<string>()
  const list =
    raw && typeof raw === 'object' && Array.isArray((raw as HomeHubMenuState).hidden)
      ? (raw as HomeHubMenuState).hidden
      : DEFAULT_STATE.hidden
  for (const id of list) {
    if (!isHomeHubModuleId(id) || id === HOME_HUB_PINNED_ID || seen.has(id)) continue
    seen.add(id)
    hidden.push(id)
  }
  return { hidden }
}

export function readHomeHubMenu(): HomeHubMenuState {
  void userJsonEpoch.value
  return normalizeMenu(readUserJson<HomeHubMenuState>(HOME_HUB_MENU_KEY, DEFAULT_STATE))
}

export function isHomeHubModuleVisible(id: HomeHubModuleId): boolean {
  if (id === HOME_HUB_PINNED_ID) return true
  return !readHomeHubMenu().hidden.includes(id)
}

export function setHomeHubModuleVisible(id: HomeHubModuleId, visible: boolean) {
  if (id === HOME_HUB_PINNED_ID) return
  const hidden = new Set(readHomeHubMenu().hidden)
  if (visible) hidden.delete(id)
  else hidden.add(id)
  writeUserJson(HOME_HUB_MENU_KEY, { hidden: [...hidden] } satisfies HomeHubMenuState)
}
