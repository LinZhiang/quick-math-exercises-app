import fs from 'node:fs'
import path from 'node:path'

const MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  emf: 'image/emf',
  wmf: 'image/wmf',
}

const RADICAL_MAP = {
  '\u2EDA': '页',
  '\u2EC5': '见',
  '\u2ED3': '长',
  '\u2ECB': '车',
  '\u2ED8': '门',
  '\u2E9F': '母',
  '\u2ED1': '长',
}

const TEXT_FIXES = [
  [/project\s*\/\s*inject/gi, 'provide / inject'],
  [/project\/inject/gi, 'provide/inject'],
  [/依赖注入（project/g, '依赖注入（provide'],
  [/并且 project的/g, '并且 provide的'],
  [/`project\s*`\s*钩子/g, '`provide` 钩子'],
  [/project\s*钩子/g, 'provide 钩子'],
  [/进程之前的通信/g, '进程之间的通信'],
  [/如何解决跨越问题/g, '如何解决跨域问题'],
  [/requestAnimationframe/g, 'requestAnimationFrame'],
  [/如果解决死锁的问题/g, '如何解决死锁的问题'],
  [/有那些/g, '有哪些'],
  [/intanceof/g, 'instanceof'],
  [/它他/g, '它'],
  [/datatime/gi, 'datetime'],
  [/0bject\.defineProperty/g, 'Object.defineProperty'],
  [/0bject/g, 'Object'],
  [/\bProtal\b/g, 'Portal'],
  [/组建内容/g, '组件内容'],
  [/不需用使用/g, '不需要使用'],
  [/\bCompositon\b/g, 'Composition'],
  [/\bmessgae\b/g, 'message'],
  [/prop和\$\.emit/g, 'prop 和 $emit'],
  [/normalizelnject/g, 'normalizeInject'],
  [/componentlnstance/g, 'componentInstance'],
  [/声明周期/g, '生命周期'],
  [/必须必须保证/g, '必须保证'],
  [/带给开发者更多地灵活性/g, '带给开发者更多的灵活性'],
  [/可以显示定义/g, '可以显式定义'],
  [/也有不变之处/g, '也有不便之处'],
  [/立刻出发这个事件/g, '立刻触发这个事件'],
  [/Least rencently used/g, 'Least recently used'],
  [/\btamplate\b/g, 'template'],
  [/constast\b/g, 'const ast'],
  [/\bbox-sizeing\b/g, 'box-sizing'],
]

export const W3C_SOURCE = 'https://www.w3cschool.cn/'

function decodeXml(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

export function fixHandoutText(s) {
  let out = ''
  for (const ch of String(s || '')) {
    const cp = ch.codePointAt(0)
    if (cp === 0x200b || cp === 0x200c || cp === 0xfeff) continue
    if (cp >= 0x2f00 && cp <= 0x2fd5) out += ch.normalize('NFKC')
    else out += RADICAL_MAP[ch] || ch
  }
  for (const [re, to] of TEXT_FIXES) out = out.replace(re, to)
  return out
}

export function stripChapterPrefix(title) {
  return String(title || '')
    .replace(/^[一二三四五六七八九十百]+[、.．]\s*/, '')
    .replace(/^前言\s*$/, '前言')
    .trim()
}

export function clipTitle(title, max = 80) {
  const s = String(title || '').trim()
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

function parseRels(dir) {
  const relPath = path.join(dir, 'word', '_rels', 'document.xml.rels')
  const map = new Map()
  if (!fs.existsSync(relPath)) return map
  const xml = fs.readFileSync(relPath, 'utf8')
  for (const m of xml.matchAll(/<Relationship\b([^>]*)\/>/g)) {
    const attrs = m[1]
    const id = (attrs.match(/\bId="([^"]+)"/) || [])[1]
    const target = (attrs.match(/\bTarget="([^"]+)"/) || [])[1]
    const type = (attrs.match(/\bType="([^"]+)"/) || [])[1] || ''
    if (id && target) map.set(id, { target: target.replace(/\\/g, '/'), type })
  }
  return map
}

function readMediaDataUri(dir, relTarget) {
  const rel = String(relTarget || '').replace(/^\/+/, '')
  const abs = path.join(dir, 'word', rel)
  if (!fs.existsSync(abs)) return ''
  const ext = path.extname(abs).slice(1).toLowerCase()
  const mime = MIME[ext]
  if (!mime || mime.includes('emf') || mime.includes('wmf')) return ''
  const b64 = fs.readFileSync(abs).toString('base64')
  if (!b64) return ''
  return `data:${mime};base64,${b64}`
}

function pStyle(p) {
  return (p.match(/<w:pStyle\s[^>]*w:val="([^"]+)"/) || [])[1] || ''
}

function maxSz(p) {
  let max = 0
  for (const m of p.matchAll(/<w:sz(?:Cs)?\s[^>]*w:val="(\d+)"/g)) {
    max = Math.max(max, Number(m[1]))
  }
  return max
}

function isCodeComment(t) {
  return /^\s*\/\//.test(String(t || ''))
}

function isCodePara(p, text) {
  const t = String(text || '').trim()
  if (!t) return false
  const styled = /fill="201E2F"|fill="201e2f"|ascii="Consolas"|hAnsi="Consolas"/i.test(p)
  const tagged = /^</.test(t) && /(?:\/?>|<\/[a-zA-Z])/.test(t)
  const manifest = /^(CACHE MANIFEST|CACHE:|NETWORK:|FALLBACK:|#v\d)/.test(t)
  const attr = /^sizes=/.test(t) || /^srcset=/.test(t)
  if (!styled && !tagged && !manifest && !attr) return false
  if (styled) {
    if (isCodeComment(t)) return true
    const cjk = (t.match(/[\u4e00-\u9fff]/g) || []).length
    const hasCodeToken = /[{};<>]|=>|function\b|const |let |var |import |export |<\/?[a-zA-Z]|^\s*\/\//i.test(t)
    if (cjk >= 6 && cjk / t.length > 0.35 && !hasCodeToken) return false
  }
  return true
}

function looksLikeCodeHeading(t) {
  const s = String(t || '').trim()
  if (!s) return true
  if (/^</.test(s)) return true
  if (/[{};]|=>|function\s|const\s|let\s|var\s/.test(s) && !/[\u4e00-\u9fff]/.test(s)) return true
  return false
}

function headingLevel(p, text, mode = 'chapters') {
  if (isCodePara(p, text) || looksLikeCodeHeading(text)) return 0
  const style = pStyle(p)
  const sz = maxSz(p)
  const t = String(text || '').trim()
  const chapter = /^[一二三四五六七八九十百]+[、.．]/.test(t) || t === '前言'
  const numbered = /^\d+[、.．]/.test(t)
  const dotted = /^\d+\.\d+[、.]/.test(t)
  const paren = /^（\d+）/.test(t) || /^\(\d+\)/.test(t)
  if (style === '2' && sz >= 28) {
    if (chapter || sz >= 36 || !numbered) return 1
    return 2
  }
  if (style === '3' && sz >= 26) return mode === 'flat' ? 3 : 2
  if (style === '4' && sz >= 24 && t.length <= 72) {
    if (chapter || numbered || paren || dotted) return 3
  }
  if (style === '4' && dotted) return 3
  return 0
}

function hasNumPr(p) {
  return /<w:numPr[\s>]/.test(p)
}

function paraPlain(p) {
  const marked = p.replace(/<w:br\b[^/]*\/>/g, '{{BR}}').replace(/<w:tab\b[^/]*\/>/g, '  ')
  const text = [...marked.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((m) => decodeXml(m[1]))
    .join('')
  return text.replace(/\{\{BR\}\}/g, '\n')
}

function paraInline(p) {
  const runs = p.split(/<w:r[\s>]/).slice(1)
  if (!runs.length) return paraPlain(p).replace(/\n+/g, ' ').trim()
  let out = ''
  let allBold = true
  const parts = []
  for (const raw of runs) {
    const r = `<w:r ${raw}`
    const text = [...r.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
      .map((m) => decodeXml(m[1]))
      .join('')
      .replace(/\s+/g, ' ')
    if (!text) continue
    const bold = /<w:b\b/.test(r) && !/<w:b\s[^>]*w:val="0"/.test(r)
    const code = /Consolas/i.test(r)
    if (!bold) allBold = false
    parts.push({ text, bold, code })
  }
  if (!parts.length) return ''
  for (const part of parts) {
    let t = part.text
    if (part.code) t = `\`${part.text.replace(/`/g, '')}\``
    else if (part.bold && !allBold) t = `**${t}**`
    out += t
  }
  return out.replace(/[ \t]+\n/g, '\n').trim()
}

function drawingAlts(p) {
  const ids = []
  for (const m of p.matchAll(/r:embed="([^"]+)"/g)) ids.push(m[1])
  for (const m of p.matchAll(/r:id="([^"]+)"/g)) ids.push(m[1])
  return [...new Set(ids)]
}

function guessLang(code, hint) {
  const s = String(code || '').trim()
  if (/^(CACHE MANIFEST|CACHE:|NETWORK:|FALLBACK:)/.test(s)) return ''
  if (/^(GET |POST |PUT |DELETE |HEAD |OPTIONS |HTTP\/|Host:)/m.test(s)) return 'http'
  if (/v-if|v-for|v-show|v-model|:key=/.test(s) || /^\s*<template[\s>]/m.test(s)) return 'html'
  if (/^<\/?[a-zA-Z]/.test(s) || /<(div|span|ul|li|html|head|meta|img|video|label|canvas|script|style|input|form|audio)\b/i.test(s)) {
    return 'html'
  }
  if (hint === 'css' && /[{}:;]/.test(s) && !/\b(function|const |let |var |=>)\b/.test(s)) return 'css'
  if (/^\s*(\.|#|@media|@keyframes|body|html|div|span|ul|li)\b/.test(s) && /[{}:]/.test(s)) return 'css'
  if (hint === 'html') return 'html'
  return 'js'
}

function tableToMarkdown(tbl, dir, rels, hint) {
  const rows = []
  for (const trRaw of tbl.split(/<w:tr[\s>]/).slice(1)) {
    const cells = []
    for (const tcRaw of trRaw.split(/<w:tc[\s>]/).slice(1)) {
      const paras = tcRaw.split(/<w:p[ >]/).slice(1)
      const bits = []
      for (const raw of paras) {
        const p = `<w:p ${raw}`
        const t = paraPlain(p).replace(/\s+/g, ' ').trim()
        if (t) bits.push(t)
        for (const rid of drawingAlts(p)) {
          const rel = rels.get(rid)
          if (!rel) continue
          const uri = readMediaDataUri(dir, rel.target)
          if (uri) bits.push(`![](${uri})`)
        }
      }
      cells.push(bits.join(' ').replace(/\|/g, '\\|') || ' ')
    }
    if (cells.length) rows.push(cells)
  }
  if (!rows.length) return ''
  const width = Math.max(...rows.map((r) => r.length))
  const norm = rows.map((r) => {
    const next = r.slice()
    while (next.length < width) next.push(' ')
    return next
  })
  const head = norm[0]
  const sep = head.map(() => '---')
  const lines = [
    `| ${head.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...norm.slice(1).map((r) => `| ${r.join(' | ')} |`),
  ]
  return hint ? lines.join('\n') : lines.join('\n')
}

function iterBlocks(xml) {
  const bodyMatch = xml.match(/<w:body[^>]*>([\s\S]*?)(?:<w:sectPr[\s>])/)
  const body = bodyMatch ? bodyMatch[1] : xml
  const re = /<w:tbl[\s>][\s\S]*?<\/w:tbl>|<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g
  return body.match(re) || []
}

function detectHeadingMode(blocks) {
  let cnChapter = false
  let numberedStyle2 = false
  for (const block of blocks) {
    if (block.startsWith('<w:tbl')) continue
    const text = fixHandoutText(paraPlain(block)).replace(/\s+/g, ' ').trim()
    if (!text || pStyle(block) !== '2' || maxSz(block) < 28) continue
    if (isCodePara(block, text) || looksLikeCodeHeading(text)) continue
    if (/^[一二三四五六七八九十百]+[、.．]/.test(text) || text === '前言') cnChapter = true
    if (/^\d+[、.．]/.test(text)) numberedStyle2 = true
  }
  if (cnChapter) return 'chapters'
  if (numberedStyle2) return 'flat'
  return 'chapters'
}

function flushCode(buf, hint, lines) {
  if (!buf.length) return
  const code = buf.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()
  buf.length = 0
  if (!code.trim()) return
  const lang = guessLang(code, hint)
  lines.push(`\`\`\`${lang}\n${code}\n\`\`\``)
}

/**
 * @returns {{ title: string, markdown: string, questions: { title: string, markdown: string }[] }[]}
 */
export function convertDocxToChapters(dir, { langHint = 'js' } = {}) {
  const xmlPath = path.join(dir, 'word', 'document.xml')
  const xml = fs.readFileSync(xmlPath, 'utf8')
  const rels = parseRels(dir)
  const blocks = iterBlocks(xml)
  const headingMode = detectHeadingMode(blocks)

  const rawLines = []
  const codeBuf = []

  const pushPara = (p) => {
    const text = fixHandoutText(paraPlain(p).replace(/\u00a0/g, ' '))
    const trimmed = text.replace(/\s+/g, ' ').trim()
    const lv = headingLevel(p, trimmed, headingMode)
    const code = (isCodePara(p, trimmed) || (codeBuf.length && isCodeComment(trimmed))) && lv === 0
    const imgIds = drawingAlts(p)

    if (code) {
      if (trimmed) codeBuf.push(text.replace(/\n+$/g, ''))
      return
    }
    flushCode(codeBuf, langHint, rawLines)

    if (lv) {
      let heading = trimmed
      if (heading === '水平垂直居中的实现') heading = '5. 水平垂直居中的实现'
      rawLines.push({ type: 'h', lv, text: heading })
      return
    }

    for (const rid of imgIds) {
      const rel = rels.get(rid)
      if (!rel) continue
      const uri = readMediaDataUri(dir, rel.target)
      if (uri) rawLines.push(`![](${uri})`)
    }

    if (!trimmed) return
    let inline = fixHandoutText(paraInline(p).replace(/\u00a0/g, ' '))
    if (hasNumPr(p) && !/^\s*([-*+]|\d+[.)])\s/.test(inline)) inline = `- ${inline}`
    rawLines.push(inline)
  }

  for (const block of blocks) {
    if (block.startsWith('<w:tbl')) {
      flushCode(codeBuf, langHint, rawLines)
      const md = tableToMarkdown(block, dir, rels, langHint)
      if (md) rawLines.push(md)
      continue
    }
    pushPara(block)
  }
  flushCode(codeBuf, langHint, rawLines)

  const chapters = []
  let current = { title: '', lines: [], questions: [] }
  let q = null

  const pushChapter = () => {
    if (!current.title && !current.lines.length && !current.questions.length) return
    if (q) {
      current.questions.push(q)
      q = null
    }
    const markdown = tidyMarkdown(current.lines.join('\n\n'))
    const questions = current.questions.map((item) => ({
      title: item.title,
      markdown: tidyMarkdown(item.lines.join('\n\n')),
    }))
    chapters.push({
      title: current.title || '概述',
      markdown,
      questions,
    })
  }

  const appendLine = (line) => {
    const s = typeof line === 'string' ? line : ''
    if (!s && line && line.type !== 'h') return
    current.lines.push(s)
    if (q) q.lines.push(s)
  }

  for (const line of rawLines) {
    if (line && line.type === 'h') {
      if (line.lv === 1) {
        pushChapter()
        current = { title: line.text, lines: [`# ${stripChapterPrefix(line.text)}`], questions: [] }
        q = null
        continue
      }
      const heading = `${'#'.repeat(Math.min(Math.max(line.lv, 1), 4))} ${line.text}`
      if (line.lv === 2) {
        if (q) current.questions.push(q)
        q = { title: line.text, lines: [heading] }
        current.lines.push(heading)
        continue
      }
      appendLine(heading)
      continue
    }
    appendLine(line)
  }
  pushChapter()

  if (chapters.length === 1 && chapters[0].title === '概述' && chapters[0].questions.length) {
    chapters[0].title = path.basename(dir)
  }

  if (chapters.length >= 2 && stripChapterPrefix(chapters[0].title) === '前言') {
    const intro = chapters.shift()
    const body = intro.markdown.replace(/^# .+\n+/, '').trim()
    if (body) {
      const next = chapters[0]
      next.markdown = next.markdown.replace(/^(# .+)\n+/, `$1\n\n${body}\n\n`)
      if (next.questions[0]) {
        next.questions[0].markdown = `${body}\n\n${next.questions[0].markdown}`
      }
    }
  }

  return chapters.filter((ch) => ch.markdown.replace(/^# .+\n*/, '').trim())
}

export function tidyMarkdown(raw) {
  let s = String(raw || '').replace(/\r\n/g, '\n').trim()
  s = s.replace(/[ \t]+\n/g, '\n')
  s = s.replace(/\n{3,}/g, '\n\n')
  s = s.replace(/```javascript/g, '```js')
  return `${s.trim()}\n`
}

export function appendSource(md, notes = []) {
  let s = tidyMarkdown(md)
  const extra = notes.filter(Boolean)
  if (extra.length) {
    s += `\n## 补充说明\n\n${extra.map((n) => `- ${n}`).join('\n')}\n`
  }
  s += `\n来源：${W3C_SOURCE}\n`
  return s.replace(/\n{3,}/g, '\n\n')
}

export function questionNum(title) {
  const m = String(title || '').match(/^（?\(?(\d+)\)?）?[、.．]/)
  return m ? Number(m[1]) : null
}

export function splitChapterBySize(chapter, { maxQuestions = 12 } = {}) {
  const qs = Array.isArray(chapter.questions) ? chapter.questions : []
  const title = stripChapterPrefix(chapter.title)
  if (!qs.length || qs.length <= maxQuestions) {
    return [{ title, markdown: chapter.markdown }]
  }
  const packCount = Math.ceil(qs.length / maxQuestions)
  const chunk = Math.ceil(qs.length / packCount)
  const packs = []
  for (let i = 0; i < qs.length; i += chunk) packs.push(qs.slice(i, i + chunk))
  if (packs.length >= 2 && packs.at(-1).length <= 3) {
    packs[packs.length - 2].push(...packs.pop())
  }
  if (packs.length <= 1) return [{ title, markdown: chapter.markdown }]
  return packs.map((group) => {
    const first = questionNum(group[0].title)
    const last = questionNum(group.at(-1).title)
    const range = first && last ? `（${first}–${last}）` : ''
    const md = tidyMarkdown(group.map((q) => q.markdown).join('\n\n'))
    return { title: clipTitle(`${title}${range}`), markdown: md }
  })
}
