import { requireAdmin } from '../../_lib/wenguCloudAuth.js'

/** 项目管理源码只放本机 server/data，不进仓库、不进 Pages。 */
export async function onRequest(context) {
  const gate = await requireAdmin(context.env, context.request)
  if (gate.error) return gate.error
  return new Response(
    JSON.stringify({
      ok: false,
      message: '项目管理源码只在本机保存，云端不提供查阅。请用 npm run dev:full 以管理员登录后查看。',
    }),
    {
      status: 404,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    },
  )
}
