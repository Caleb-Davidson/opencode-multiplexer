import { execSync } from "child_process"

export interface DiscoveredOpencodeProcess {
  pid: number
  command: string
  kind: "tui" | "serve"
  sessionId: string | null
  port?: number
}

function parseCommandLine(pid: number, cmd: string): DiscoveredOpencodeProcess | null {
  const trimmed = `${pid} ${cmd}`.trim()

  const tuiMatch = trimmed.match(/^\d+\s+(?:(?:node|bun|deno)\s+\S*[/\\]opencode(?:\.cmd|\.exe)?|opencode(?:\.cmd|\.exe)?)(?:\s+-s\s+(\S+))?$/i)
  if (tuiMatch) {
    return {
      pid,
      command: cmd,
      kind: "tui",
      sessionId: tuiMatch[1] ?? null,
    }
  }

  const serveMatch = trimmed.match(/^\d+\s+(?:(?:node|bun|deno)\s+\S*[/\\]opencode(?:\.cmd|\.exe)?|opencode(?:\.cmd|\.exe)?)\s+serve\s+.*--port\s+(\d+)/i)
  if (serveMatch) {
    return {
      pid,
      command: cmd,
      kind: "serve",
      sessionId: null,
      port: parseInt(serveMatch[1]!, 10),
    }
  }

  return null
}

function listUnix(): DiscoveredOpencodeProcess[] {
  const psOutput = execSync("ps -eo pid,args 2>/dev/null", {
    encoding: "utf-8",
    timeout: 3000,
  })
  const out: DiscoveredOpencodeProcess[] = []
  for (const line of psOutput.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const match = trimmed.match(/^(\d+)\s+(.+)$/)
    if (!match) continue
    const pid = parseInt(match[1]!, 10)
    const cmd = match[2]!
    const parsed = parseCommandLine(pid, cmd)
    if (parsed) out.push(parsed)
  }
  return out
}

function listWindows(): DiscoveredOpencodeProcess[] {
  const script = "$ErrorActionPreference='Stop';Get-CimInstance Win32_Process | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"
  const raw = execSync(`powershell -NoProfile -Command \"${script}\"`, {
    encoding: "utf-8",
    timeout: 5000,
  }).trim()
  if (!raw) return []
  const parsed = JSON.parse(raw) as { ProcessId: number; CommandLine: string | null } | Array<{ ProcessId: number; CommandLine: string | null }>
  const rows = Array.isArray(parsed) ? parsed : [parsed]
  const out: DiscoveredOpencodeProcess[] = []
  for (const row of rows) {
    const cmd = row.CommandLine ?? ""
    if (!cmd) continue
    const candidate = parseCommandLine(row.ProcessId, cmd)
    if (candidate) out.push(candidate)
  }
  return out
}

export function listOpencodeProcesses(): DiscoveredOpencodeProcess[] {
  try {
    if (process.platform === "win32") return listWindows()
    return listUnix()
  } catch {
    return []
  }
}
