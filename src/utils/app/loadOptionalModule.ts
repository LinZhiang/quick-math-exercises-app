/** 读取 import.meta.glob 的第一个模块导出；文件被 gitignore 时返回 fallback。 */
export function pickGlobExport<T>(
  mods: Record<string, unknown>,
  exportName: string,
  fallback: T,
): T {
  for (const mod of Object.values(mods)) {
    if (mod && typeof mod === 'object' && exportName in mod) {
      return (mod as Record<string, T>)[exportName]
    }
  }
  return fallback
}
