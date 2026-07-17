import { isAuthConfigured, json } from './_lib/wenguCloudAuth.js'

export async function onRequestGet(context) {
  const env = context.env
  const hasDeepseek = Boolean(String(env.DEEPSEEK_API_KEY || '').trim())
  const hasDoubao = Boolean(
    String(env.DOUBAO_API_KEY || '').trim() && String(env.DOUBAO_MODEL_ID || '').trim(),
  )
  return json({
    ok: true,
    hasApiKey: hasDeepseek || hasDoubao,
    hasDeepseekApiKey: hasDeepseek,
    hasDoubaoApiKey: hasDoubao,
    authEnabled: isAuthConfigured(env),
    hosting: 'cloudflare-pages',
    providers: ['deepseek', 'doubao'],
  })
}
