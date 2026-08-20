/** 安装页「检查并更新」期间的全屏提示，刷新前后都要显示，避免白屏被当成卡死。 */
const KEY = 'qmea-app-updating'

function maskEl() {
  return document.getElementById('app-update-mask')
}

export function showAppUpdatingMask() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* ignore */
  }
  maskEl()?.classList.add('is-on')
}

export function hideAppUpdatingMask() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  maskEl()?.classList.remove('is-on')
}
