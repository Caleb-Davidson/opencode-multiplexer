import { describe, expect, test } from "bun:test"
import { isAbsolutePath, isSameOrParentPath, stripCwdPrefix } from "../platform/path-utils.js"

describe("path utils", () => {
  test("isAbsolutePath supports unix and windows paths", () => {
    expect(isAbsolutePath("/repo/file.ts")).toBe(true)
    expect(isAbsolutePath("C:\\repo\\file.ts")).toBe(true)
    expect(isAbsolutePath("src/file.ts")).toBe(false)
  })

  test("isSameOrParentPath matches nested paths", () => {
    expect(isSameOrParentPath("/repo", "/repo/src/file.ts")).toBe(true)
    expect(isSameOrParentPath("/repo/src", "/repo")).toBe(true)
    expect(isSameOrParentPath("/repo-a", "/repo-b")).toBe(false)
  })

  test("stripCwdPrefix keeps non-child paths unchanged", () => {
    expect(stripCwdPrefix("/other/file.ts", "/repo")).toBe("/other/file.ts")
  })
})
