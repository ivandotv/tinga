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

  test('Default log level is "trace"', () => {
    const logger = new Tinga()

    const levels = logger.getLevels()

    const result = logger.getLevel()
    expect(result.name).toBe("trace")
    expect(result.value).toBe(levels.trace)
  })

  test("Do not use color", () => {
    const logger = new Tinga({ useColor: false })
    const payload = "ivan"

    logger.log(payload)
    expect(console.log).toHaveBeenCalledWith(payload)
  })

  test("All levels above the current level are called", () => {
    const logger = new Tinga()
    const payload = "hello"

    logger.trace(payload)
    logger.log(payload)
    logger.debug(payload)
    logger.info(payload)
    logger.warn(payload)
    logger.error(payload)
    logger.critical(payload)

    expect(console.trace).toHaveBeenCalledTimes(1)
    expect(console.trace).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      payload,
    )

    expect(console.log).toHaveBeenCalledTimes(3)
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.any(String),

      payload,
    )
    expect(console.log).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.any(String),
      payload,
    )
    expect(console.log).toHaveBeenNthCalledWith(
      3,
      expect.any(String),
      expect.any(String),
      payload,
    )

    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      payload,
    )

    expect(console.error).toHaveBeenCalledTimes(2)
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.any(String),
      payload,
    )
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.any(String),
      payload,
    )
  })

  test("All levels below the current level are not called", () => {
    const logger = new Tinga({ level: "warn" })
    const payload = "hello"

    logger.trace(payload)
    logger.log(payload)
    logger.debug(payload)
    logger.info(payload)

    logger.warn(payload)
    logger.error(payload)

    expect(console.log).not.toHaveBeenCalled()

    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      payload,
    )

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      payload,
    )
  })

  test("All arguments are passed to underlying console call", () => {
    const logger = new Tinga()
    const payload = ["hello", "world"]

    logger.log(...payload)

    expect(console.log).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      ...payload,
    )
  })

  test("Silent level removes all logging", () => {
    const logger = new Tinga({ level: "silent" })
    const payload = "hello"

    logger.trace(payload)
    logger.log(payload)
    logger.debug(payload)
    logger.info(payload)
    logger.warn(payload)
    logger.error(payload)

    expect(console.log).not.toHaveBeenCalled()
    expect(console.debug).not.toHaveBeenCalled()
    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  test("Throw error if unsupported level is passed in", () => {
    // @ts-expect-error delibrate error
    expect(() => new Tinga({ level: "not_a_level" })).toThrowError()
  })

  test("Set log level after instance creation", () => {
    const logger = new Tinga()
    const payload = "hello"

    logger.log(payload)

    logger.setLevel("warn")

    logger.log(payload)
    logger.log(payload)
    logger.log(payload)

    expect(console.log).toHaveBeenCalledTimes(1)
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
