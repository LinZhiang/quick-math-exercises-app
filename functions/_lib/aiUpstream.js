/**
 * 双上游解析（Cloudflare Pages Functions）
 * 与 server/ai-upstream.mjs 保持同语义
 */
export function normalizeAiProvider(providerRaw) {
  const p = String(providerRaw ?? '')
    .trim()
    .toLowerCase()
  if (p === 'doubao') return 'doubao'
  return 'deepseek'
}

export function resolveAiUpstream(env, provider, clientModel) {
  if (provider === 'doubao') {
    const apiKey = String(env.DOUBAO_API_KEY || '')
      .trim()
      .replace(/^["']|["']$/g, '')
    const base = String(env.DOUBAO_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3')
      .trim()
      .replace(/\/$/, '')
    let model = String(env.DOUBAO_MODEL_ID || '').trim().replace(/^["']|["']$/g, '')
    if (model === 'doubao-seed-2-1-pro-240628') {
      model = 'doubao-seed-2-1-pro-260628'
    }
    let missingHint = ''
    if (!apiKey) {
      missingHint = '服务端未配置 DOUBAO_API_KEY'
    } else if (/^api-key-/i.test(apiKey) || !apiKey.startsWith('ark-')) {
      missingHint =
        'DOUBAO_API_KEY 格式不正确：请填写方舟控制台「复制」出的密钥（以 ark- 开头），不要填密钥名称（api-key-…）'
    } else if (!model) {
      missingHint = '服务端未配置 DOUBAO_MODEL_ID（模型 ID 或接入点 ep-…）'
    }

    return {
      provider: 'doubao',
      apiKey,
      base,
      model,
      configured: !missingHint,
      missingHint,
    }
  }

  const apiKey = String(env.DEEPSEEK_API_KEY || '').trim()
  const base = String(env.DEEPSEEK_API_BASE || 'https://api.deepseek.com')
    .trim()
    .replace(/\/$/, '')
  const model = String(clientModel || '').trim() || 'deepseek-v4-flash'
  return {
    provider: 'deepseek',
    apiKey,
    base,
    model,
    configured: Boolean(apiKey),
    missingHint: apiKey ? '' : '服务端未配置 DEEPSEEK_API_KEY',
  }
}

export function stripProxyOnlyFields(body) {
  const next = { ...body }
  delete next.provider
  delete next.capability
  return next
}

export function mapUpstreamErrorMeta(status, provider) {
  if (status === 429) {
    return {
      code: 'UPSTREAM_429',
      type: 'upstream_rate_limit',
      message: `${provider} 上游限流（429），请稍后重试。不会自动切换其他模型，请手动切换。`,
    }
  }
  if (status === 504 || status === 408) {
    return {
      code: 'UPSTREAM_504',
      type: 'upstream_timeout',
      message: `${provider} 上游超时（${status}），请稍后重试。不会自动切换其他模型，请手动切换。`,
    }
  }
  return null
}
