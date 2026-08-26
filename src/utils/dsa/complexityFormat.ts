/** 把 n^2、log_2 n、O(2^n) 转成带上下标的 HTML。只用于题库常量，不当作用户输入。 */
const LOG = '\uE000'
const OH = '\uE001'

export function complexityToHtml(src: string): string {
  let s = src
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  s = s.replace(/log_\{([^}]+)\}/g, `${LOG}<sub>$1</sub>`)
  s = s.replace(/log_(\d+)/g, `${LOG}<sub>$1</sub>`)
  s = s.replace(/\blog\b/g, LOG)
  s = s.replace(/\bO\b/g, OH)
  s = s.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
  s = s.replace(/\^([A-Za-zφ]|-?\d+)/g, '<sup>$1</sup>')
  s = s.replace(/[nmikφ]/g, (ch) => `<var>${ch}</var>`)
  s = s.replaceAll(LOG, '<span class="dsa-cx-fn">log</span>')
  s = s.replaceAll(OH, '<span class="dsa-cx-oh">O</span>')
  return s
}
