import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import Tinga from "../tinga"
import { Config } from "../types"

function spyOnConsole() {
  vi.spyOn(console, "trace").mockReturnValue()
  vi.spyOn(console, "debug").mockReturnValue()
  vi.spyOn(console, "log").mockReturnValue()
  vi.spyOn(console, "info").mockReturnValue()
  vi.spyOn(console, "error").mockReturnValue()
  vi.spyOn(console, "warn").mockReturnValue()
}

describe("Tinga", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })
  beforeEach(() => {
    spyOnConsole()
  })

  describe("Child logger", () => {
    test("is instance of Tinga", () => {
      const parent = new Tinga()
      const child = parent.child()

      expect(child).toBeInstanceOf(Tinga)
    })

    test("can derive context from parent context", () => {
      const cfg: Config<{ name: string }> = { ctx: { name: "ivan" } }
      const parent = new Tinga<{ name: string }>(cfg)
      const childCtx = {
        nick: "ivandotv",
      }
      const child = parent.child({
        ctx: (ctx) => {
          return {
            ...ctx,
            ...childCtx,
          }
        },
      })
      const result = child.getContext()
      expect(result).toEqual({ ...childCtx, ...parent.getContext() })
    })
  })
})
