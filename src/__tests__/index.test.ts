import { ProcessDataFn } from 'types'
import { MiniLog } from '../index'

function spyOnConsole() {
  jest.spyOn(console, 'trace').mockReturnValue()
  jest.spyOn(console, 'log').mockReturnValue()
  jest.spyOn(console, 'error').mockReturnValue()
  jest.spyOn(console, 'warn').mockReturnValue()
}

function _spyOnMiniLog(instance: MiniLog) {
  jest.spyOn(instance, 'trace')
  jest.spyOn(instance, 'log')
  jest.spyOn(instance, 'log')
  jest.spyOn(instance, 'error')
}

describe('Minilog', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  beforeEach(() => {
    spyOnConsole()
  })
  test('Default log level is "trace"', () => {
    const logger = new MiniLog()

    const allLevels = logger.allLevels()

    const result = logger.level()
    expect(result.name).toBe('trace')
    expect(result.value).toBe(allLevels['trace'])
  })

  test('All levels above the current level are called', () => {
    const logger = new MiniLog()
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
    const logger = new MiniLog({ level: 'warn' })
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

  test('all arguments are passed to underlying console', () => {
    const logger = new MiniLog()
    const payload = ['hello', 'world']

    logger.log(...payload)

    expect(console.log).toHaveBeenCalledWith(...payload)
  })

  test.todo('Context is passed to process data function')
  test.todo('Ever log method can have custom processing')
  test.todo('Silent level removes all logging')

  describe('Context', () => {
    test('Context is passed to loging methods', () => {
      const ctx = { name: 'Ivan' }
      const logger = new MiniLog({ ctx })

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

      const logger = new MiniLog({ ctx, processData })

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

      const logger = new MiniLog({ ctx, processData: processDataSpy })
      spyOnConsole()

      logger.log(...payload)

      expect(processDataSpy).toHaveBeenCalledWith(
        {
          ctx,
          level: {
            name: 'info',
            value: logger.allLevels()['info']
          }
        },
        ...payload
      )
    })
  })
})
