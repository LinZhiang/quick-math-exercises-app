import { handleComputerBasics } from '../../_lib/computerBasicsCloud.js'

export async function onRequest(context) {
  try {
    return await handleComputerBasics(context.env, context.request, context.params.path)
  } catch (e) {
    const message = e instanceof Error ? e.message : '计算机基础接口失败'
    const status = e?.code === 'HANDOUT_TOO_LARGE' ? 413 : 500
    return new Response(JSON.stringify({ ok: false, message }), {
      status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    })
  }
}
