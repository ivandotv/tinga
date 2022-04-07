import {
  ChildConfig,
  Config,
  InternaConfig,
  Level,
  LevelsByName
} from './types'
import {
  generateStyles,
  processData,
  processRemoteData,
  resolveLevel,
  sendData
} from './utils'

const colors = {
  trace: generateStyles('#555', '#fff'),
  debug: generateStyles('#7627f2', '#fff'),
  info: generateStyles('#1f5bcc', '#fff'),
  warn: generateStyles('#f5a623', '#000'),
  error: generateStyles('#f05033', '#fff'),
  critical: generateStyles('#f05033', '#fff')
}

/**
 * Tinga - small logging module for the browser
 * @typeParam T  - context (payload) to be used with the logger
 */
export default class Tinga<T = any> implements Tinga {
  protected config: InternaConfig

  protected levels = Object.freeze({
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    critical: 60,
    silent: 100
  } as const)

  constructor(config: Config<T> = {}) {
    this.config = this.createConfig(config)
  }

  /**
   * Creates config
   * @param config - user-provided configuration for the object
   * @returns final configuration
   */
  protected createConfig(config: Config) {
    const level = resolveLevel(
      config.level || this.levels['trace'],
      this.levels
    )
    let remote: InternaConfig['remote']

    const { remote: customRemote, label, ctx } = config

    if (customRemote?.url) {
      remote = {
        url: customRemote.url,
        processData: customRemote.processData || processRemoteData,
        level: customRemote.level
          ? resolveLevel(customRemote.level, this.levels)
          : (() => {
              throw new Error('Remote level not set')
            })(),
        send: customRemote.send || sendData
      }
    }

    return {
      ctx,
      label,
      level,
      remote,
      processData: config.processData || processData
    }
  }

  /**
   * Log via "trace" level
   * @param args - console log arguments
   */
  trace(...args: any[]) {
    this.logIt('trace', 'trace', args)
  }

  /**
   * Log via "debug" level
   * @param args - console log arguments
   */
  debug(...args: any[]) {
    this.logIt('log', 'debug', args)
  }

  /**
   * Log via "info" level
   * @param args - console log arguments
   */
  info(...args: any[]) {
    this.logIt('log', 'info', args)
  }

  //alias for info

  /**
   * Log is an alias for  {@link Tinga.info | Tinga.info method}
   * @param args - console log arguments
   */
  log(...args: any[]) {
    this.info(...args)
  }

  /**
   * Log via "warn" level
   * @param args - console log arguments
   */
  warn(...args: any[]) {
    this.logIt('warn', 'warn', args)
  }

  /**
   * Log via "error" level
   * @param args - console log arguments
   */
  error(...args: any[]) {
    this.logIt('error', 'error', args)
  }

  /**
   * Log via "critical" level
   * @param args - console log arguments
   */
  critical(...args: any[]) {
    this.logIt('error', 'critical', args)
  }

  /**
   * Main logging implementation
   * @param method - console log method to be used
   * @param levelName - the name of the level to be used
   * @param args - arguments to be logged
   */
  protected logIt(method: string, levelName: LevelsByName, args: any[]) {
    const level: Level = { name: levelName, value: this.levels[levelName] }
    const { level: currentLevel, remote } = this.config

    if (level.value >= currentLevel.value) {
      this.logLocal(method, level, args)
    }

    if (remote && level.value >= remote.level.value) {
      this.logRemote(level, args)
    }
  }

  /**
   * Log to the browser console
   * @param method - console log method to be used
   * @param level - the name of the level to be used
   * @param args - arguments to be logged
   */
  protected logLocal(method: string, level: Level, args: any[]) {
    const { label, ctx, processData } = this.config
    const params = [
      `%c${level.name}`,
      // @ts-expect-error TODO types
      colors[level.name]
    ]
    const payload = processData(ctx, args, {
      level,
      label
    })

    if (label) {
      params.push(`[${label}] `)
    }

    if (typeof payload.ctx !== 'undefined') {
      params.push(payload.ctx)
    }

    // @ts-expect-error - not all methods are availalbe directly on console
    console[method](...params, ...payload.data)
  }

  /**
   * Log to a remote endpoint
   * @param level - the name of the level to be used
   * @param args - arguments to be logged
   */
  protected logRemote(level: Level, args: any[]) {
    //only send beacon if the default log level is bigger or equal to the beacon level
    const { processData, url, send: sendData } = this.config.remote!
    const { ctx, label } = this.config

    const data = processData(ctx, args, {
      level,
      label
    })

    sendData(url, data)
  }

  /**
   * Get current log level
   */
  getLevel() {
    return this.config.level
  }

  /**
   * Sets new logging level
   * @param level - level to set
   */
  setLevel(level: LevelsByName) {
    this.config.level = resolveLevel(level, this.levels)
  }

  /**
   * Gets remote logging level
   */
  getRemoteLevel() {
    const { remote } = this.config

    return remote ? remote?.level : undefined
  }

  /**
   * Sets new remote logging level
   * @param level - new logging level
   */
  setRemoteLevel(level: LevelsByName) {
    const { remote } = this.config
    if (!remote) {
      throw new Error('remote not set')
    }

    remote.level = resolveLevel(level, this.levels)
  }

  /**
   * Sets new logging context
   * @param ctx - new data for the context
   */
  setContext(ctx: any) {
    this.config.ctx = ctx
  }

  /**
   * Gets the current context
   */
  getContext(): T {
    return this.config.ctx
  }

  /**
   * Gets all available levels
   */
  getLevels() {
    return { ...this.levels }
  }

  /**
   * Create a child logger instance based on the parent. Child configuration will be merged
   * with the parent. The context will be completely overwritten. If a function is used for the context, the
   * return value will be used as context.
   * @typeParam K - child context
   * @param config - child configuration
   */
  child<K = void>(config: ChildConfig<K, T> = {} as ChildConfig<K, T>) {
    const cfg: Config = { ...config }
    if (typeof config.ctx === 'function') {
      // @ts-expect-error - type overload problem
      cfg.ctx = config.ctx(this.config.ctx)
    }

    return new Tinga<K extends void ? T : K>(cfg)
  }
}
