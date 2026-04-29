import { basename, normalize, relative, sep, win32 } from "path"

function normalizeSlashes(p: string): string {
  return p.replace(/[\\/]+/g, sep)
}

export function normalizePathForCompare(input: string): string {
  const normalized = normalize(normalizeSlashes(input))
  if (process.platform === "win32") return normalized.toLowerCase()
  return normalized
}

export function isSameOrParentPath(a: string, b: string): boolean {
  const aNorm = normalizePathForCompare(a)
  const bNorm = normalizePathForCompare(b)
  if (aNorm === bNorm) return true

  const relAB = relative(aNorm, bNorm)
  if (relAB && !relAB.startsWith("..") && relAB !== ".") return true

  const relBA = relative(bNorm, aNorm)
  if (relBA && !relBA.startsWith("..") && relBA !== ".") return true

  return false
}

export function stripCwdPrefix(filePath: string, cwd: string): string {
  const fileRaw = normalize(normalizeSlashes(filePath))
  const cwdRaw = normalize(normalizeSlashes(cwd))
  const fileNorm = normalizePathForCompare(filePath)
  const cwdNorm = normalizePathForCompare(cwd)
  if (fileNorm === cwdNorm) return basename(filePath)

  const relNorm = relative(cwdNorm, fileNorm)
  if (relNorm && !relNorm.startsWith("..") && relNorm !== ".") {
    const rel = relative(cwdRaw, fileRaw)
    return rel.split(win32.sep).join(sep)
  }
  return filePath
}

export function isAbsolutePath(p: string): boolean {
  if (p.startsWith("/")) return true
  return /^[a-zA-Z]:[\\/]/.test(p)
}
