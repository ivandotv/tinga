import { processData } from '../types'
import { Minilog } from '../minilog'
import * as utils from '../utils'

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
    navigator.sendBeacon = jest.fn().mockReturnValue(true)
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
      const payload = ['hello', 'world']
      const processData: processData = (_info, _args) => {
        return {
          ctx: modifiedCtx,
          data: [...restOfTheArguments]
        }
      }

      const logger = new Minilog({ ctx, processData, color: false })

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

    test('Custom processing function is called with the correct arguments', () => {
      spyOnConsole()
      const ctx = { name: 'Ivan' }
      const payload = ['hello', 'world']
      const processData: processData = (info, args) => {
        return {
          ctx: info.ctx,
          data: args
        }
      }
      const processDataSpy = jest.fn(processData)
      const label = 'test'
      const logger = new Minilog({ label, ctx, processData: processDataSpy })

      logger.log(...payload)

      expect(processDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ctx,
          label,
          level: {
            name: 'info',
            value: logger.allLevels()['info']
          }
        }),
        ...payload
      )
    })
  })

  describe('Remote send', () => {
    test('Send data', () => {
      const url = 'some_url'
      const payload = 'hello world'
      const ctx = { name: 'ivan' }
      const label = 'shopping'
      const sendDataSpy = jest.spyOn(utils, 'sendData')
      const logger = new Minilog({
        color: false,
        ctx,
        label,
        remote: {
          level: 'trace',
          url
        }
      })

      logger.warn(payload)

      expect(navigator.sendBeacon).toHaveBeenCalledTimes(1)
      expect(sendDataSpy).toHaveBeenCalledWith(url, {
        name: 'warn',
        level: logger.allLevels()['warn'],
        ctx,
        label,
        data: [payload]
      })
    })

    test('Use custom data function', () => {
      const url = 'some_url'
      const payload = 'hello world'
      const ctx = { name: 'ivan' }
      const label = 'shopping'
      const newLabel = 'dancing'
      const level = 123
      const name = 'critical'

      const sendDataSpy = jest.spyOn(utils, 'sendData')

      const logger = new Minilog({
        color: false,
        ctx,
        label,
        remote: {
          url,
          level: 'trace',
          processData: (_info, ...args: any[]) => {
            return {
              label: newLabel,
              name,
              level,
              data: args
            }
          }
        }
      })

      logger.warn(payload)

      expect(navigator.sendBeacon).toHaveBeenCalledTimes(1)
      expect(sendDataSpy).toHaveBeenCalledWith(url, {
        label: newLabel,
        name,
        level,
        data: [payload]
      })
    })

    test('Use custom send function', () => {
      const url = 'some_url'
      const payload = 'hello world'
      const ctx = { name: 'ivan' }
      const label = 'shopping'
      const sendDataSpy = jest.fn()
      const logger = new Minilog({
        color: false,
        ctx,
        label,
        remote: {
          url,
          level: 'trace',
          sendData: sendDataSpy
        }
      })

      logger.warn(payload)

      expect(sendDataSpy).toHaveBeenCalledWith(url, {
        name: 'warn',
        level: logger.allLevels()['warn'],
        ctx,
        label,
        data: [payload]
      })
    })

    test('All levels above the current level are called', () => {
      const sendDataSpy = jest.fn()
      const payload = 'hello'
      const url = 'some_url'
      const level = 'info'
      const logger = new Minilog({
        color: false,

        remote: {
          url,
          level,
          sendData: sendDataSpy
        }
      })

      logger.trace(payload)
      logger.debug(payload)

      logger.info(payload)
      logger.warn(payload)
      logger.error(payload)

      expect(sendDataSpy).toHaveBeenCalledTimes(3)
      expect(sendDataSpy).toHaveBeenNthCalledWith(
        1,
        url,
        expect.objectContaining({
          name: 'info',
          data: [payload]
        })
      )
      expect(sendDataSpy).toHaveBeenNthCalledWith(
        2,
        url,
        expect.objectContaining({
          name: 'warn',
          data: [payload]
        })
      )

      expect(sendDataSpy).toHaveBeenNthCalledWith(
        3,
        url,
        expect.objectContaining({
          name: 'error',
          data: [payload]
        })
      )
    })

    test('When default level is silent, remote send still works', () => {
      const sendDataSpy = jest.fn()
      const payload = 'hello'
      const url = 'some_url'
      const logger = new Minilog({
        color: false,
        level: 'silent',
        remote: {
          url,
          level: 'warn',
          sendData: sendDataSpy
        }
      })

      logger.trace(payload)
      logger.debug(payload)
      logger.info(payload)
      logger.warn(payload)

      expect(sendDataSpy).toHaveBeenCalledTimes(1)
      expect(sendDataSpy).toHaveBeenNthCalledWith(
        1,
        url,
        expect.objectContaining({
          name: 'warn',
          data: [payload]
        })
      )
    })

    test('Remote silent level disables sending', () => {
      const sendDataSpy = jest.fn()
      const payload = 'hello'
      const url = 'some_url'
      const logger = new Minilog({
        color: false,
        remote: {
          url,
          level: 'silent',
          sendData: sendDataSpy
        }
      })

      logger.trace(payload)
      logger.debug(payload)
      logger.info(payload)
      logger.warn(payload)
      logger.error(payload)

      expect(sendDataSpy).toHaveBeenCalledTimes(0)
    })

    test('Throw if remote level is not specified', () => {
      expect(
        () =>
          new Minilog({
            color: false,
            // @ts-expect-error - forced error
            remote: {
              url: 'some_url'
            }
          })
      ).toThrow()
    })

    test('Set and get remote level', () => {
      const sendDataSpy = jest.fn()
      const url = 'some_url'
      const newLevel = 'warn'
      const logger = new Minilog({
        color: false,
        remote: {
          url,
          level: 'silent',
          sendData: sendDataSpy
        }
      })

      logger.setRemoveLevel(newLevel)

      expect(logger.getRemoteLevel()).toEqual({
        name: newLevel,
        value: logger.allLevels()[newLevel]
      })
    })

    test('If remote is not set, throw when trying to set remote level', () => {
      const logger = new Minilog({
        color: false
      })

      expect(() => logger.setRemoveLevel('debug')).toThrow()
    })

    test('When remote level is changed, it immediately goes in to effect', () => {
      const sendDataSpy = jest.fn()
      const payload = 'hello'
      const url = 'some_url'
      const logger = new Minilog({
        color: false,
        remote: {
          url,
          level: 'silent',
          sendData: sendDataSpy
        }
      })

      logger.trace(payload)
      logger.debug(payload)
      logger.info(payload)
      logger.warn(payload)
      logger.error(payload)

      logger.setRemoveLevel('debug')
      logger.debug(payload)

      expect(sendDataSpy).toHaveBeenCalledTimes(1)
    })
  })
})
