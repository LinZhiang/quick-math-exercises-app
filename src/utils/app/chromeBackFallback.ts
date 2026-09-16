import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import { omitQueryKey } from '@/utils/app/appNavigation'

/**
 * 顶栏「返回」在没有历史记录时的落点。
 * 按当前路由把「编辑 / 拍照 / 子页」收回到上一级，避免直接跳出模块。
 */
export function chromeBackFallback(route: RouteLocationNormalizedLoaded): RouteLocationRaw {
  const name = String(route.name ?? '')

  if (name === 'train' && route.query.play === '1') {
    return {
      name: 'train',
      params: route.params,
      query: omitQueryKey(route.query, 'play'),
    }
  }

  if (name === 'bank-sub') {
    const view = String(route.query.view ?? '')
    const photoTarget = String(route.query.photoTarget ?? 'full')
    const photoIntent = String(route.query.photoIntent ?? 'recognize')
    if (view === 'photo' && (photoTarget !== 'full' || photoIntent === 'upload')) {
      const qid = route.query.qid
      return {
        name: 'bank-sub',
        params: route.params,
        query: qid ? { view: 'edit', qid: String(qid) } : { view: 'new' },
      }
    }
    if (view) return { name: 'bank-sub', params: route.params }
    return { name: 'bank' }
  }

  if (name === 'computer-item' || name === 'frontend-item') {
    const parent = name === 'computer-item' ? 'computer' : 'frontend'
    const photo = String(route.query.photo ?? '')
    if (photo === 'recognize' || photo === 'upload') {
      return {
        name,
        params: route.params,
        query: omitQueryKey(route.query, 'photo'),
      }
    }
    if (route.query.edit === '1') return { name, params: route.params }
    return { name: parent }
  }

  if (name === 'computer-book-node') return { name: 'computer-book' }
  if (name === 'computer-book' || name === 'computer-log') return { name: 'computer' }
  if (name === 'frontend-book-node') return { name: 'frontend-book' }
  if (name === 'frontend-book' || name === 'frontend-log') return { name: 'frontend' }

  if (name === 'dsa-problem') {
    return {
      name: 'dsa-sub',
      params: {
        categoryId: String(route.params.categoryId ?? ''),
        subId: String(route.params.subId ?? ''),
      },
    }
  }
  if (name === 'dsa-log' || name === 'dsa-sub') return { name: 'dsa' }
  if (name === 'project-code-file') return { name: 'project-code' }

  return { name: 'home' }
}
