import { handleFrontendLearning } from '../../_lib/frontendLearningCloud.js'

export async function onRequest(context) {
  try {
    return await handleFrontendLearning(context.env, context.request, context.params.path)
  } catch (e) {
    const message = e instanceof Error ? e.message : '前端学习接口失败'
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
