import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import Tinga from "../tinga"
import { type ProcessData } from "../types"

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

  describe("Context", () => {
    test("Set context after instance creation", () => {
      const ctx = { name: "Ivan" }
      const newCtx = { name: "Marko" }

      const logger = new Tinga({ ctx })
      logger.log()
      logger.setContext(newCtx)
      logger.warn()

      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ctx,
      )
      expect(console.warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        newCtx,
      )
      expect(logger.getContext()).toBe(newCtx)
    })

    test("Get current context", () => {
      const ctx = { name: "Ivan" }

      const logger = new Tinga({ ctx })

      expect(logger.getContext()).toBe(ctx)
    })

    test("Context is passed to the logging methods", () => {
      const ctx = { name: "Ivan" }
      const logger = new Tinga({ ctx })

      const payload = ["hello", "world"]

      logger.log(...payload)
      logger.warn(...payload)

      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ctx,
        ...payload,
      )
      expect(console.warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ctx,
        ...payload,
      )
    })

    test("Custom processing function can manipulate logging payload", () => {
      const ctx = { name: "Ivan" }
      const modifiedCtx = { name: "Marko" }
      const restOfTheArguments = [1, 2, 3]
      const payload = ["hello", "world"]
      const processData: ProcessData = (_info, _args) => {
        return {
          ctx: modifiedCtx,
          data: [...restOfTheArguments],
        }
      }

      const logger = new Tinga({ ctx, processData })

      logger.log(...payload)
      logger.warn(...payload)

      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        modifiedCtx,
        ...restOfTheArguments,
      )

      expect(console.warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        modifiedCtx,
        ...restOfTheArguments,
      )
    })

    test("Custom processing function is called with the correct arguments", () => {
      spyOnConsole()
      const ctx = { name: "Ivan" }
      const payload = ["hello", "world"]
      const processData: ProcessData = (ctx, data) => {
        return {
          ctx,
          data,
        }
      }
      const processDataSpy = vi.fn(processData)
      const label = "test"
      const logger = new Tinga({ label, ctx, processData: processDataSpy })

      logger.log(...payload)

      expect(processDataSpy).toHaveBeenCalledWith(
        ctx,
        payload,
        expect.objectContaining({
          label,
          level: {
            name: "info",
            value: logger.getLevels().info,
          },
        }),
      )
    })
  })
})
