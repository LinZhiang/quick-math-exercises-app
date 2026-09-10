/** 界面已展示「正确答案」时，去掉解析开头重复的那句。 */

function stripTags(html: string): string {
  return String(html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function compact(s: string): string {
  return stripTags(s).replace(/[「」『』“”"'‘’：:\s。．.、，,；;]/g, '')
}

function dropLeadTags(s: string): string {
  return s
    .replace(/^(?:<(?:p|div|span|strong|b)[^>]*>\s*)+/i, '')
    .replace(/^(?:<\/(?:p|div|span|strong|b)>\s*)+/i, '')
}

function cutPlainPrefix(html: string, prefix: string): string {
  const want = stripTags(prefix)
  if (!want) return html
  const plain = stripTags(html)
  if (!plain.startsWith(want) && !compact(plain).startsWith(compact(want))) return html
  const after = plain.slice(want.length).replace(/^[」』”"'‘’\s。．.：:；;]+/, '')
  return after
}

/**
 * 解析若以「正确答案是…」或整段复述 correctText 开头，删掉这段，只留后面的说明。
 */
export function stripLeadingAnswerEcho(explanation: string, correctText: string): string {
  const raw = String(explanation || '').trim()
  if (!raw) return raw
  const ansPlain = stripTags(correctText)
  const ansCompact = compact(correctText)
  let next = dropLeadTags(raw)

  const lead = /^(?:正确答案是|正确选项是|答案是|参考答案是|正确答案为|答案为|正确选项为)[：:\s]*/i
  if (lead.test(stripTags(next))) {
    next = dropLeadTags(next.replace(lead, ''))
    next = next.replace(/^[「『“"']/, '')
    if (ansPlain) {
      const cut = cutPlainPrefix(next, ansPlain)
      if (cut !== next) {
        next = cut
      } else {
        next = next.replace(/^[\s\S]*?[」』”"']?\s*[。．.]\s*/, '')
      }
    } else {
      next = next.replace(/^[\s\S]*?[」』”"']?\s*[。．.]\s*/, '')
    }
    next = dropLeadTags(next)
  } else if (ansCompact.length >= 8 && compact(next).startsWith(ansCompact)) {
    next = cutPlainPrefix(next, ansPlain)
  }

  next = dropLeadTags(next).replace(/^(?:<(?:p|div)[^>]*>)?\s*正确答案[：:]\s*/i, '')
  next = next.replace(/^(?:<(?:p|div)[^>]*>)?\s+/i, '').trim()
  if (!stripTags(next) || (ansCompact && compact(next) === ansCompact)) return ''
  return next
}
