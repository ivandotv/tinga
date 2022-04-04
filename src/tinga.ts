import {
  ChildConfig,
  Config,
  InternaConfig,
  Level,
  LevelsByName
} from './types'
import {
  generateStyles,
  prepareData,
  prepareRemoteData,
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

export interface Tinga {
  trace(...args: any[]): void
  debug(...args: any[]): void
  log(...args: any[]): void
  info(...args: any[]): void
  warn(...args: any[]): void
  error(...args: any[]): void
}

//Note: the class should be default export but TS doesn't allow default with declaration merging
//https://github.com/microsoft/TypeScript/issues/14080

export class Tinga<T = any> implements Tinga {
  protected config: InternaConfig

  protected levels = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    critical: 60,
    silent: 100
  } as const

  constructor(config: Config<T> = {}) {
    this.config = this.createConfig(config)
  }

  protected createConfig(config: Config) {
    const level = resolveLevel(
      config.level || this.levels['trace'],
      this.levels
    )
    let remote: InternaConfig['remote']

    const { remote: customRemote, color, label, ctx } = config

    if (customRemote?.url) {
      remote = {
        url: customRemote.url,
        processData: customRemote.processData || prepareRemoteData,
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
      color: color ?? true,
      label,
      level,
      remote,
      processData: config.processData || prepareData
    }
  }

  trace(...args: any[]) {
    this.logIt('trace', 'trace', args)
  }

  debug(...args: any[]) {
    this.logIt('log', 'debug', args)
  }

  info(...args: any[]) {
    this.logIt('log', 'info', args)
  }

  //alias for info
  log(...args: any[]) {
    this.info(...args)
  }

  warn(...args: any[]) {
    this.logIt('warn', 'warn', args)
  }

  error(...args: any[]) {
    this.logIt('error', 'error', args)
  }

  critical(...args: any[]) {
    this.logIt('error', 'critical', args)
  }

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

  protected logLocal(method: string, level: Level, args: any[]) {
    const { label, color, ctx } = this.config
    const params = []
    const payload = this.config.processData(
      {
        ctx,
        level,
        label
      },
      ...args
    )
    if (typeof payload.ctx !== 'undefined') {
      params.push(payload.ctx)
    }

    if (color) {
      params.push(
        `%c${level.name}`,
        // @ts-expect-error TODO types
        colors[level.name]
      )
    }
    if (label) {
      params.push(`[${label}] `)
    }

    // @ts-expect-error - not all methods are availalbe directly on console
    console[method](...params, ...payload.data)
  }

  protected logRemote(level: Level, args: any[]) {
    //only send beacon if the default log level is bigger or equal to the beacon level
    const { processData, url, send: sendData } = this.config.remote!
    const { ctx, label } = this.config

    const data = processData(
      {
        ctx,
        level,
        label
      },
      ...args
    )

    sendData(url, data)
  }

  getLevel() {
    return { ...this.config.level }
  }

  setLevel(level: LevelsByName) {
    this.config.level = resolveLevel(level, this.levels)
  }

  getRemoteLevel() {
    const { remote } = this.config

    return remote ? { ...remote?.level } : undefined
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

  setContext(ctx: any) {
    this.config.ctx = ctx
  }

  getContext(): T {
    return this.config.ctx
  }

  getLevels() {
    return { ...this.levels }
  }

  child<K = void>(config: ChildConfig<K, T> = {} as ChildConfig<K, T>) {
    const cfg: Config = { ...config }
    if (typeof config.ctx === 'function') {
      // @ts-expect-error - type overload problem
      cfg.ctx = config.ctx(this.config.ctx)
    }

    return new Tinga<K extends void ? T : K>(cfg)
  }
}
