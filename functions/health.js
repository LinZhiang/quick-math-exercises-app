import { isAuthConfigured, json } from './_lib/wenguCloudAuth.js'

export async function onRequestGet(context) {
  const env = context.env
  return json({
    ok: true,
    hasApiKey: Boolean(String(env.DEEPSEEK_API_KEY || '').trim()),
    authEnabled: isAuthConfigured(env),
    hosting: 'cloudflare-pages',
  })
}
