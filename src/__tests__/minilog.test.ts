import { ProcessDataFn } from 'types'
import { Minilog } from '../minilog'

function spyOnConsole() {
  jest.spyOn(console, 'trace').mockReturnValue()
  jest.spyOn(console, 'debug').mockReturnValue()
  jest.spyOn(console, 'log').mockReturnValue()
  jest.spyOn(console, 'info').mockReturnValue()
  jest.spyOn(console, 'error').mockReturnValue()
  jest.spyOn(console, 'warn').mockReturnValue()
}

describe('Minilog', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  beforeEach(() => {
    spyOnConsole()
  })

  test('Default log level is "trace"', () => {
    const logger = new Minilog()

    const allLevels = logger.allLevels()

    const result = logger.getLevel()
    expect(result.name).toBe('trace')
    expect(result.value).toBe(allLevels['trace'])
  })

  test('All levels above the current level are called', () => {
    const logger = new Minilog({ color: false })
    const payload = 'hello'

    logger.trace(payload)
    logger.log(payload)
    logger.debug(payload)
    logger.info(payload)
    logger.warn(payload)
    logger.error(payload)

    expect(console.trace).toHaveBeenCalledTimes(1)
    expect(console.trace).toHaveBeenCalledWith(payload)

    expect(console.log).toHaveBeenCalledTimes(3)
    expect(console.log).toHaveBeenNthCalledWith(1, payload)
    expect(console.log).toHaveBeenNthCalledWith(2, payload)
    expect(console.log).toHaveBeenNthCalledWith(3, payload)

    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenCalledWith(payload)

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(payload)
  })

  test('All levels below the current level are not called', () => {
    const logger = new Minilog({ level: 'warn', color: false })
    const payload = 'hello'

    logger.trace(payload)
    logger.log(payload)
    logger.debug(payload)
    logger.info(payload)

    logger.warn(payload)
    logger.error(payload)

    expect(console.log).not.toHaveBeenCalled()

    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenCalledWith(payload)

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(payload)
  })

  test('All arguments are passed to underlying console call', () => {
    const logger = new Minilog({ color: false })
    const payload = ['hello', 'world']

    logger.log(...payload)

    expect(console.log).toHaveBeenCalledWith(...payload)
  })

  test('Silent level removes all logging', () => {
    const logger = new Minilog({ level: 'silent' })
    const payload = 'hello'

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

  test('Throw error if unsupported level is passed in', () => {
    // @ts-expect-error delibrate error
    expect(() => new Minilog({ level: 'not_a_level' })).toThrowError()
  })

  test('Set log level after instance creation', () => {
    const logger = new Minilog()
    const payload = 'hello'

    logger.log(payload)

    logger.setLevel('warn')

    logger.log(payload)
    logger.log(payload)
    logger.log(payload)

    expect(console.log).toHaveBeenCalledTimes(1)
  })

  describe('Context', () => {
    test('Set context after instance creation', () => {
      const ctx = { name: 'Ivan' }
      const newCtx = { name: 'Marko' }

      const logger = new Minilog({ ctx, color: false })
      logger.log()
      logger.setContext(newCtx)
      logger.warn()

      expect(console.log).toHaveBeenCalledWith(ctx)
      expect(console.warn).toHaveBeenCalledWith(newCtx)
      expect(logger.getContext()).toBe(newCtx)
    })

    test('Get current context', () => {
      const ctx = { name: 'Ivan' }

      const logger = new Minilog({ ctx, color: false })

      expect(logger.getContext()).toBe(ctx)
    })

    test('Context is passed to the logging methods', () => {
      const ctx = { name: 'Ivan' }
      const logger = new Minilog({ ctx, color: false })

      const payload = ['hello', 'world']

      logger.log(...payload)
      logger.warn(...payload)

      expect(console.log).toHaveBeenCalledWith(ctx, ...payload)
      expect(console.warn).toHaveBeenCalledWith(ctx, ...payload)
    })

    test('Custom processing function can manipulate logging payload', () => {
      const ctx = { name: 'Ivan' }
      const modifiedCtx = { name: 'Marko' }
      const restOfTheArguments = [1, 2, 3]

      const processData: ProcessDataFn = (_info, _args) => {
        return {
          ctx: modifiedCtx,
          data: [...restOfTheArguments]
        }
      }

      const logger = new Minilog({ ctx, processData, color: false })

      const payload = ['hello', 'world']

      logger.log(...payload)
      logger.warn(...payload)

      expect(console.log).toHaveBeenCalledWith(
        modifiedCtx,
        ...restOfTheArguments
      )
      expect(console.warn).toHaveBeenCalledWith(
        modifiedCtx,
        ...restOfTheArguments
      )
    })

    test('Custom processing function is called with correct arguments', () => {
      const ctx = { name: 'Ivan' }
      const payload = ['hello', 'world']

      const processData: ProcessDataFn = (info, args) => {
        return {
          ctx: info.ctx,
          data: args
        }
      }

      const processDataSpy = jest.fn(processData)

      const label = 'test'
      const logger = new Minilog({ label, ctx, processData: processDataSpy })
      spyOnConsole()

      logger.log(...payload)

      expect(processDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ctx,
          label: `[${label}] `,
          level: {
            name: 'info',
            value: logger.allLevels()['info']
          }
        }),
        ...payload
      )
    })
  })
})
