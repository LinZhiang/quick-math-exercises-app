import { handleUserKv } from '../../_lib/userKvCloud.js'

export async function onRequest(context) {
  try {
    return await handleUserKv(context.env, context.request, context.params.path)
  } catch (e) {
    const message = e instanceof Error ? e.message : '用户数据接口失败'
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    })
  }
}
