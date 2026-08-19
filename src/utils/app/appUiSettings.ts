/**
 * 应用界面偏好（本机持久化）
 */
import { ref } from 'vue'

const STORAGE_KEY = 'wengu-app-ui-settings-v1'

export type AppUiSettings = {
  /** 是否允许浏览器/PWA 下拉（上滑边缘）手势刷新页面；默认关闭防误触 */
  pullToRefreshEnabled: boolean
}

const DEFAULTS: AppUiSettings = {
  pullToRefreshEnabled: false,
}

export const appUiSettingsTick = ref(0)

function readSettings(): AppUiSettings {
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULTS }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<AppUiSettings>
    return {
      pullToRefreshEnabled:
        typeof parsed.pullToRefreshEnabled === 'boolean'
          ? parsed.pullToRefreshEnabled
          : DEFAULTS.pullToRefreshEnabled,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

function writeSettings(next: AppUiSettings) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  appUiSettingsTick.value += 1
}

export function getAppUiSettings(): AppUiSettings {
  void appUiSettingsTick.value
  return readSettings()
}

export function isPullToRefreshEnabled(): boolean {
  return getAppUiSettings().pullToRefreshEnabled
}

export function setPullToRefreshEnabled(enabled: boolean) {
  const cur = readSettings()
  writeSettings({ ...cur, pullToRefreshEnabled: enabled })
  applyPullToRefreshPreference()
}

/**
 * 关闭时禁止页面级 overscroll 触发浏览器刷新；开启时恢复默认。
 */
export function applyPullToRefreshPreference() {
  if (typeof document === 'undefined') return
  const enabled = readSettings().pullToRefreshEnabled
  const value = enabled ? 'auto' : 'none'
  document.documentElement.style.overscrollBehaviorY = value
  document.body.style.overscrollBehaviorY = value
  // 同步 class，方便全局样式兜底
  document.documentElement.classList.toggle('app-pull-refresh-on', enabled)
  document.documentElement.classList.toggle('app-pull-refresh-off', !enabled)
  document.body.classList.toggle('app-pull-refresh-on', enabled)
  document.body.classList.toggle('app-pull-refresh-off', !enabled)
}
