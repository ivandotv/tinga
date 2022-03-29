//TODO - log levels
//TODO - everything else
//TODO - send beacon
//TODO - pass in function as first argument, -> get context injetect
//TODO - set context
//TODO - get context
//TODO - child override - create
//TODO - get - set level
//TODo - get set beacon level

import { Config, InternaConfig, Level, LevelsByName } from './types'

export const logLevels = {
  trace: 10,
  debug: 20, // map to log
  info: 30,
  warn: 40,
  error: 50,
  silent: 60
} as const

export interface MiniLog {
  trace(...args: any[]): void
  debug(...args: any[]): void
  log(...args: any[]): void
  info(...args: any[]): void
  warn(...args: any[]): void
  error(...args: any[]): void
}

export class MiniLog implements MiniLog {
  protected config: InternaConfig

  constructor(config: Config = {} as Config) {
    const level = this.resolveLevel(config.level || logLevels['trace'])
    let beacon: InternaConfig['beacon']
    const { beacon: userBeacon } = config

    if (userBeacon && userBeacon.url) {
      beacon = {
        url: userBeacon.url,
        processData: userBeacon.processData || this.processBeaconData,
        level: userBeacon.level ? this.resolveLevel(userBeacon.level) : level
      }
    }

    this.config = {
      ctx: config.ctx,
      level,
      beacon
    }
    this.trace = this.logIt('trace', logLevels['trace'], this.config)
    this.debug = this.logIt('log', logLevels['debug'], this.config)
    this.log = this.logIt('log', logLevels['debug'], this.config)
    this.info = this.logIt('log', logLevels['info'], this.config)
    this.warn = this.logIt('warn', logLevels['warn'], this.config)
    this.error = this.logIt('error', logLevels['error'], this.config)
  }

  protected logIt(method: string, level: number, config: InternaConfig) {
    return (...args: any[]) => {
      if (!(level >= config.level.value)) return

      // @ts-expect-error - not all methods are availalbe directly on console
      console[method](...args)

      const { beacon } = config
      //only send beacon if default log level is bigger or equal to the beacon level
      if (beacon && config.level.value >= beacon.level.value) {
        const data = beacon.processData(
          {
            ctx: config.ctx,
            level: beacon.level
          },
          ...args
        )
        this.sendBeacon(beacon.url, data)
      }
    }
  }

  processBeaconData(info: { level: Level; ctx: any }, ...args: any[]) {
    return {
      name: info.level.name,
      level: info.level.value,
      data: args
    }
  }

  processData(info: { level: Level; ctx: any }, ...args: any[]) {
    return args
  }

  sendBeacon(url: string, data: any) {
    if (typeof window !== 'undefined') {
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      })
      navigator.sendBeacon(url, blob)
    }
  }

  resolveLevel(level: string | number) {
    let chosenLevel: Level | undefined

    const isNumber = typeof level === 'number'

    for (const [key, value] of Object.entries(logLevels)) {
      if (isNumber) {
        if (value === level) {
          chosenLevel = {
            name: key as LevelsByName,
            value: level
          }
          break
        }
      } else {
        if (key === level) {
          chosenLevel = {
            name: key as LevelsByName,
            value
          }
          break
        }
      }
    }
    if (!chosenLevel) {
      throw new Error(`Unsupported level ${level}`)
    }

    return chosenLevel
  }

  level() {
    return this.config.level
  }

  allLevels() {
    return { ...logLevels }
  }
}
