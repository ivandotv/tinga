import { Config, InternaConfig, Level, LevelsByName } from './types'
import {
  generateStyles,
  prepareData,
  prepareRemoteData,
  resolveLevel,
  sendData
} from './utils'

export const logLevels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 60
} as const

const colors = {
  trace: generateStyles('#555', '#fff'),
  debug: generateStyles('#7627f2', '#fff'),
  info: generateStyles('#1f5bcc', '#fff'),
  warn: generateStyles('#f5a623', '#000'),
  error: generateStyles('#f05033', '#fff')
}

export interface Minilog {
  trace(...args: any[]): void
  debug(...args: any[]): void
  log(...args: any[]): void
  info(...args: any[]): void
  warn(...args: any[]): void
  error(...args: any[]): void
  // processRemoteData: ProcessBeaconDataFn
}

//Note the class should be default export but TS doesn't allow default with declaration merging
//https://github.com/microsoft/TypeScript/issues/14080

export class Minilog implements Minilog {
  protected config: InternaConfig

  constructor(config: Config = {} as Config) {
    const level = resolveLevel(config.level || logLevels['trace'])
    let remote: InternaConfig['remote']

    const { remote: customRemote, color, label, ctx } = config

    if (customRemote?.url) {
      remote = {
        url: customRemote.url,
        processData: customRemote.processData || prepareRemoteData,
        level: customRemote.level
          ? resolveLevel(customRemote.level)
          : (() => {
              throw new Error('Remote logging level not present')
            })(),
        sendData: customRemote.sendData || sendData
      }
    }

    this.config = {
      ctx,
      color: color ?? true,
      label,
      level,
      remote,
      processData: config.processData || prepareData
    }

    this.trace = this.logIt('trace', resolveLevel('trace'), this.config)
    this.debug = this.logIt('log', resolveLevel('debug'), this.config)

    this.info = this.logIt('log', resolveLevel('info'), this.config)
    this.log = this.info //just an alias

    this.warn = this.logIt('warn', resolveLevel('warn'), this.config)
    this.error = this.logIt('error', resolveLevel('error'), this.config)
  }

  protected logIt(method: string, level: Level, config: InternaConfig) {
    return (...args: any[]) => {
      if (level.value >= config.level.value) {
        this.logLocal(method, level, config, args)
      }

      if (config.remote && level.value >= config.remote.level.value) {
        this.logRemote(level, config, args)
      }
    }
  }

  protected logLocal(
    method: string,
    level: Level,
    config: InternaConfig,
    args: any[]
  ) {
    const { label, color, ctx } = config
    const params = []
    const payload = config.processData(
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

  protected logRemote(level: Level, config: InternaConfig, args: any[]) {
    //only send beacon if the default log level is bigger or equal to the beacon level
    const { processData, url, sendData } = config.remote!
    const { ctx, label } = config

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
    this.config.level = resolveLevel(level)
  }

  setContext(ctx: any) {
    this.config.ctx = ctx
  }

  getContext() {
    return this.config.ctx
  }

  allLevels() {
    return { ...logLevels }
  }
}
