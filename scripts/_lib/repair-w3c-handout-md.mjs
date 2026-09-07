/**
 * 把 Word 入库后被拆碎的代码围栏、挤在一起的语句、OCR 错字修回可读代码。
 * 只处理讲义 Markdown，不改目录/增删改接口。
 */
import { tidyJsFencesInMarkdown } from '../../server/tidy-js-code.mjs'
import { fixHandoutText } from './w3c-docx-to-md.mjs'

const FENCE_OPEN = /^```([\w+-]*)[ \t]*$/

function cjkRatio(s) {
  const t = String(s || '')
  if (!t) return 0
  return (t.match(/[\u4e00-\u9fff]/g) || []).length / t.length
}

function netBraces(s) {
  let curly = 0
  let square = 0
  let paren = 0
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch
      i += 1
      while (i < s.length && s[i] !== q) {
        if (s[i] === '\\') i += 1
        i += 1
      }
      continue
    }
    if (ch === '{') curly += 1
    else if (ch === '}') curly -= 1
    else if (ch === '[') square += 1
    else if (ch === ']') square -= 1
    else if (ch === '(') paren += 1
    else if (ch === ')') paren -= 1
  }
  return { curly, square, paren }
}

function tagDelta(s, tag) {
  let delta = 0
  for (const line of String(s || '').split('\n')) {
    if ((line.match(/[\u4e00-\u9fff]/g) || []).length >= 3) continue
    const open = (line.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) || []).length
    const close = (line.match(new RegExp(`</${tag}>`, 'gi')) || []).length
    delta += open - close
  }
  return delta
}

function looksComplete(body) {
  const t = String(body || '').trim()
  if (!t) return false
  if (/^<(script|template|style)([^>]*)?>\s*$/i.test(t)) return false
  if (['script', 'template', 'style'].some((tag) => tagDelta(t, tag) > 0)) return false
  const n = netBraces(t)
  return n.curly <= 0 && n.square <= 0 && n.paren <= 0
}

function looksLikeCodeFragment(t) {
  const s = String(t || '').trim()
  if (!s) return false
  if (/^\/\//.test(s) || /^<!--/.test(s)) return false
  if (/^(abstract|props|max|const |let |var |function |export |import |return |if |else |this\.|vnode\.|cache|name:|data\(|methods:|components:|provide\(|inject:)/.test(s)) {
    return true
  }
  if (/[{};=]|=>/.test(s) && !/^[\u4e00-\u9fff]/.test(s)) return true
  return false
}

function hasCodeToken(s) {
  return /[{};=<>]|=>|function\b|const |let |var |import |export |return |this\.|<\/?[a-zA-Z]/i.test(s)
}

function isProseLine(line) {
  const t = String(line || '').trim().replace(/^\/\/\s*/, '')
  if (!t) return true
  const cjk = (t.match(/[\u4e00-\u9fff]/g) || []).length
  if (cjk < 4) return false
  if (/^[（(]?\d+[）).、.]/.test(t) || /^- /.test(t) || /[。；]$/.test(t)) return true
  return cjk / t.length >= 0.35 && !/^\s*(import |export |function |const |let |var |class )/i.test(t)
}

function isProseOnlyFence(body) {
  const t = String(body || '').trim()
  if (!t) return true
  const lines = t.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length && lines.every(isProseLine)) return true
  const plain = t.replace(/^\/\/\s*/gm, '')
  const cjk = (plain.match(/[\u4e00-\u9fff]/g) || []).length
  if (cjk >= 6 && /[。；]$/.test(plain) && !/[{}]/.test(plain) && !/^(import |export |function |const |let )/m.test(plain)) {
    return true
  }
  if (/^<\w/.test(plain) || /<\/\w/.test(plain)) return false
  if (hasCodeToken(plain) && cjkRatio(plain) < 0.45) return false
  return cjk >= 6 && cjkRatio(plain) >= 0.35
}

function unwrapProseFence(body) {
  return String(body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const t = line.replace(/^\/\/\s*/, '').trim()
      if (!t) return ''
      if (/^[-*] /.test(t) || /^[（(]?\d+[）).、.]/.test(t)) return t.startsWith('- ') ? t : `- ${t}`
      return `- ${t}`
    })
    .filter(Boolean)
    .join('\n')
}

function classifyLooseLine(line) {
  const raw = String(line || '')
  if (!raw.trim()) return { type: 'blank' }
  const hasTick = raw.includes('`')
  const stripped = raw.replace(/`/g, '').replace(/[ \t]+/g, ' ').trim()
  if (!stripped) return { type: 'blank' }
  if (/^\/\//.test(stripped) && (hasTick || /^\/\//.test(raw.trim()))) {
    return { type: 'comment', text: stripped }
  }
  if (hasTick && looksLikeCodeFragment(stripped)) {
    return { type: 'fence', lang: 'js', body: stripped }
  }
  return null
}

function pickLang(fences) {
  const bodies = fences.map((f) => f.body).join('\n')
  const langs = fences.map((f) => f.lang).filter(Boolean)
  if (/<template[\s>]/.test(bodies) && /<script[\s>]/.test(bodies)) return 'html'
  if (langs.includes('vue')) return 'vue'
  if (langs.includes('html') && (langs.includes('js') || /export default|from ['"]vue['"]/.test(bodies))) {
    return 'html'
  }
  if (langs.includes('html')) return 'html'
  if (langs.includes('css')) return 'css'
  return langs.find(Boolean) || 'js'
}

function shouldMerge(prevBody, next) {
  const prev = String(prevBody || '')
  const nb = String(next.body || '').trim()
  if (!looksComplete(prev)) return true
  if (!looksComplete(nb) && /^<(script|style)/i.test(nb)) return true
  if (/<\/template>\s*$/i.test(prev.trim()) && /<script|export default|from ['"]vue['"]/.test(nb)) return true
  if (/^<\//.test(nb) || /^[}\]),.]/.test(nb)) return true
  if (/^\s+/.test(String(next.body || '').split('\n')[0] || '') && /^(}|]|\)|,)/.test(nb)) return true
  return false
}

function indentComment(text, parts) {
  const lines = parts.join('\n').split('\n')
  let last = ''
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i].trim()) {
      last = lines[i]
      break
    }
  }
  const indent = (last.match(/^(\s*)/) || ['', ''])[1]
  const extra = /\{\s*$/.test(last) ? '  ' : ''
  const body = text.startsWith('//') ? text : `// ${text}`
  return `${indent}${extra}${body}`
}

function parseBlocks(md) {
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const open = FENCE_OPEN.exec(lines[i].trim())
    if (open) {
      const lang = open[1] || ''
      const body = []
      i += 1
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        body.push(lines[i])
        i += 1
      }
      if (i < lines.length && /^```/.test(lines[i].trim())) i += 1
      blocks.push({ type: 'fence', lang, body: body.join('\n') })
      continue
    }
    const loose = classifyLooseLine(lines[i])
    if (loose) {
      blocks.push(loose)
      i += 1
      continue
    }
    const prose = [lines[i]]
    i += 1
    while (i < lines.length) {
      if (FENCE_OPEN.test(lines[i].trim())) break
      if (classifyLooseLine(lines[i])) break
      prose.push(lines[i])
      i += 1
    }
    blocks.push({ type: 'prose', text: prose.join('\n') })
  }
  return blocks
}

function isClusterish(block) {
  return block.type === 'fence' || block.type === 'comment' || block.type === 'blank'
}

function collapseCluster(cluster) {
  const out = []
  let acc = null
  const pending = []
  const flush = () => {
    if (!acc) {
      for (const text of pending) out.push({ type: 'prose', text: `\`${text}\`` })
      pending.length = 0
      return
    }
    const body = acc.parts.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '').replace(/\n+$/, '')
    if (body.trim()) out.push({ type: 'fence', lang: acc.lang, body })
    acc = null
  }
  const startAcc = (block) => {
    acc = {
      lang: block.lang || 'js',
      parts: [...pending.map((text) => (text.startsWith('//') ? text : `// ${text}`)), block.body],
      dirty: pending.length > 0 || !looksComplete(block.body),
    }
    pending.length = 0
  }
  for (const block of cluster) {
    if (block.type === 'blank') continue
    if (block.type === 'comment') {
      if (!acc) {
        pending.push(block.text)
        continue
      }
      acc.parts.push(indentComment(block.text, acc.parts))
      acc.dirty = true
      continue
    }
    if (!acc) {
      startAcc(block)
      continue
    }
    const prevBody = acc.parts.join('\n')
    if (acc.dirty || shouldMerge(prevBody, block)) {
      acc.parts.push(block.body)
      acc.lang = pickLang([
        { lang: acc.lang, body: acc.parts.join('\n') },
        block,
      ])
      acc.dirty = !looksComplete(acc.parts.join('\n'))
      continue
    }
    flush()
    acc = {
      lang: block.lang || 'js',
      parts: [block.body],
      dirty: !looksComplete(block.body),
    }
  }
  flush()
  return out
}

function mergeSplitFences(md) {
  const blocks = parseBlocks(md)
  const out = []
  let i = 0
  while (i < blocks.length) {
    if (!isClusterish(blocks[i])) {
      out.push(blocks[i])
      i += 1
      continue
    }
    const cluster = []
    while (i < blocks.length && isClusterish(blocks[i])) {
      cluster.push(blocks[i])
      i += 1
    }
    out.push(...collapseCluster(cluster))
  }
  return out
}

function unglueCode(code) {
  let s = String(code || '')
  s = s.replace(/(['"]\s*\))(const |import |export |function )/g, '$1\n$2')
  s = s.replace(/(\.vue['"];?)(const |import |export )/g, '$1\n$2')
  s = s.replace(/(from\s+['"][^'"]+['"];?)(export |const |import |function )/g, '$1\n$2')
  s = s.replace(/(new Vue\(\))(export )/g, '$1\n$2')
  s = s.replace(/((?:'vue'|"vue"))(export )/g, '$1\n$2')
  s = s.replace(/(<\/div>)(<\/template>)/g, '$1\n$2')
  s = s.replace(/(<\/template>)(<script[\s>])/g, '$1\n$2')
  s = s.replace(/(<\/script>)(\/\/|<template)/g, '$1\n$2')
  s = s.replace(/(<script[^>]*>)(import |export )/g, '$1\n$2')
  s = s.replace(/(\['app'\])(console\.)/g, '$1\n$2')
  s = s.replace(/(\/\/[^\n]*[\u4e00-\u9fff][^\n]*?)(const |let |function |export |import )/g, '$1\n$2')
  s = s.replace(/(\/\/[^\n]*resolve)(const )/gi, '$1\n$2')
  s = s.replace(/(\/\/[^\n]*时间戳版)(function )/g, '$1\n$2')
  s = s.replace(/(\/\/[^\n]*懒加载 )(const )/g, '$1\n$2')
  s = s.replace(/(\/>)\s*(\/\/)/g, '$1\n$2')
  s = s.replace(/([>])\s*(\/\/)/g, '$1\n$2')
  s = s.replace(/;[ \t]*(\/\/)/g, ';\n$1')
  s = s.replace(/\)[ \t]*(\/\/)/g, ')\n$1')
  s = s.replace(/(['"`])(const |let |var |function |export |import )/g, '$1\n$2')
  s = s.replace(/(\/\/ 缓存数组原型)(const )/g, '$1\n$2')
  s = s.replace(/(\/\/ 实现 arrayMethods[^\n]*)(export )/g, '$1\n$2')
  s = s.replace(/(\/\/ 需要进行功能拓展的方法)(const )/g, '$1\n$2')
  s = s.replace(/(\/\/ 将模板编译为render函数)(const )/g, '$1\n$2')
  s = s.replace(/(\/\/ core\/instance\/lifecycle)(function )/g, '$1\n$2')
  s = s.replace(/(\/\/\s*)\n(function )/g, '$1\n$2')
  return s
}

function commentizeLectureLines(code) {
  return String(code || '')
    .split('\n')
    .map((line) => {
      const t = line.trim()
      if (!t || /^\/\//.test(t) || /^<!--/.test(t) || /^[*#]/.test(t)) return line
      if (/^<\w/.test(t) || /<\/\w/.test(t) || /^\s*[{}\])],?$/.test(t)) return line
      if (/^[\w$"'`@./[\]-].*[:=({]/.test(t)) return line
      if (/^(abstract|props|max|export |import |const |let |var |function |return |if |else |this\.|name:|include:|exclude:)/.test(t)) {
        return line
      }
      const cjk = (t.match(/[\u4e00-\u9fff]/g) || []).length
      if (cjk >= 8 && cjk / t.length > 0.4) {
        return line.replace(t, `// ${t}`)
      }
      return line
    })
    .join('\n')
}

function fixBrokenSyntax(code) {
  let s = String(code || '')
  s = s.replace(/\bname:\s*father\b/g, "name: 'father'")
  s = s.replace(
    /^([ \t]*)data\(\)\s*\{\s*([A-Za-z_$][\w$]*)\s*:\s*("[^"]*"|'[^']*')\s*;?\s*\}/gm,
    (_, ind, key, val) =>
      `${ind}data() {\n${ind}  return {\n${ind}    ${key}: ${val}\n${ind}  }\n${ind}}`,
  )
  s = s.replace(/addObjB\s*\(\)\s*\(/g, 'addObjB () {')
  s = s.replace(/<child ref="child"><\/component-a>/g, '<child ref="child"></child>')
  s = s.replace(/<input v-bind:value="aa" v-on:input="onmessage"><\/aa-input>/g, '<input v-bind:value="aa" v-on:input="onmessage">')
  s = s.replace(/props:\s*\{\s*value:\s*aa,?\s*\}/g, "props: ['value']")
  s = s.replace(/\$emit\('input'/g, "this.$emit('input'")
  s = s.replace(/this\.this\.\$emit/g, 'this.$emit')
  if (/require\.ensure/.test(s)) s = s.replace(/(\]\s*\n\s*\}\))\s*\)/g, '$1')
  s = s.replace(/Set、delete/g, 'set、delete')
  return s
}

function renderBlocks(blocks) {
  const parts = []
  for (const block of blocks) {
    if (block.type === 'prose') {
      if (block.text) parts.push(block.text)
      continue
    }
    if (block.type === 'comment') {
      parts.push(`\`${block.text}\``)
      continue
    }
    let body = unglueCode(block.body)
    body = fixBrokenSyntax(body)
    body = body.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '').replace(/\n+$/, '')
    if (isProseOnlyFence(body)) {
      parts.push(unwrapProseFence(body))
      continue
    }
    body = commentizeLectureLines(body)
    const lang = block.lang || 'js'
    parts.push(`\`\`\`${lang}\n${body}\n\`\`\``)
  }
  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n')
}

function extraTextFixes(s) {
  return String(s || '')
    .replace(/通过prop和\$emit/g, '通过 prop 和 $emit')
    .replace(/prop和名为 input/g, 'prop 和名为 input')
    .replace(/cid \+"∶∶"\+ tag/g, 'cid + "::" + tag')
    .replace(/cid \+"::"\+ tag/g, 'cid + "::" + tag')
    .replace(/\bSet、delete\b/g, 'set、delete')
    .replace(/\bbox-sizeing\b/g, 'box-sizing')
    .replace(/写在headr中/g, '写在 head 中')
}

export function repairW3cHandoutMarkdown(md) {
  let s = extraTextFixes(fixHandoutText(String(md || '').replace(/\r\n/g, '\n')))
  s = renderBlocks(mergeSplitFences(s))
  s = tidyJsFencesInMarkdown(s)
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  return `${s}\n`
}
