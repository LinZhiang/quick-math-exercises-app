import { handleCsVocab } from '../../_lib/csVocabCloud.js'

export async function onRequest(context) {
  try {
    return await handleCsVocab(context.env, context.request, context.params.path)
  } catch (e) {
    const message = e instanceof Error ? e.message : '计算机单词题库接口失败'
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    })
  }
}
