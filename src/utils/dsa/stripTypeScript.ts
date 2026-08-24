/**
 * 把常见 TypeScript 标注剥成可执行的 JavaScript。
 * 只覆盖练习题会用到的语法，不引入完整编译器。
 */
export function stripTypeScript(source: string): string {
  let s = source.replace(/^\uFEFF/, '')
  s = s.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
  s = s.replace(/(^|[^:])\/\/.*$/gm, (line) => line.replace(/\/\/.*$/, ''))
  s = s.replace(/\bas\s+[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*(?:\s*\[[^\]]*\])?/g, '')
  s = s.replace(/\)\s*:\s*[A-Za-z_$][\w$<>[\]|&\s,.]+\s*(?=\{)/g, ') ')
  s = s.replace(/([,(]\s*(?:(?:public|private|protected|readonly)\s+)?)(\.\.\.)?([A-Za-z_$][\w$]*)(\?)?\s*:\s*[^,)=]+/g, '$1$2$3')
  s = s.replace(/\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*:\s*[^=;\n]+/g, '$1 $2')
  s = s.replace(/\b(interface|type)\s+[A-Za-z_$][\w$]*[\s\S]*?(?=^[ \t]*(?:function|const|let|var|class|export|import)\b|\n\s*\n|$)/gm, '')
  s = s.replace(/(\)|\])!/g, '$1')
  return s
}
