import { homedir } from "os"
import { join } from "path"

export function getConfigDir(): string {
  if (process.platform === "win32") {
    return process.env.APPDATA
      ? join(process.env.APPDATA, "ocmux")
      : join(homedir(), "AppData", "Roaming", "ocmux")
  }
  return join(homedir(), ".config", "ocmux")
}

export function getDefaultOpencodeDbPath(): string {
  if (process.env.OCMUX_DB_PATH) return process.env.OCMUX_DB_PATH
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA
    if (localAppData) return join(localAppData, "opencode", "opencode.db")
    return join(homedir(), "AppData", "Local", "opencode", "opencode.db")
  }
  return join(homedir(), ".local", "share", "opencode", "opencode.db")
}
