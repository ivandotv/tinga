import { Config, InternaConfig, Level, LevelsByName } from './types'

export const logLevels = {
  trace: 10,
  debug: 20, // maps to log
  info: 30,
  warn: 40,
  error: 50,
  silent: 60
} as const

function generateStyles(bg: string, color: string) {
  return `background:${bg};color:${color};padding:2px;border-radius:2px;`
}

const colors = {
  trace: generateStyles('#555', '#fff'),
  debug: generateStyles('#7627f2', '#fff'),
  info: generateStyles('#1f5bcc', '#fff'),
  warn: generateStyles('#f5a623', '#000'),
  error: generateStyles('#f05033', '#fff')
}

function resolveLevel(level: string | number) {
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

export interface Minilog {
  trace(...args: any[]): void
  debug(...args: any[]): void
  log(...args: any[]): void
  info(...args: any[]): void
  warn(...args: any[]): void
  error(...args: any[]): void
}

//Note the class should be default export but TS doesn't allow default with declaration merging
//https://github.com/microsoft/TypeScript/issues/14080

export class Minilog implements Minilog {
  protected config: InternaConfig

  constructor(config: Config = {} as Config) {
    const level = resolveLevel(config.level || logLevels['trace'])
    let beacon: InternaConfig['beacon']

    const { beacon: userBeacon, color, label, ctx, processData } = config

    if (userBeacon && userBeacon.url) {
      beacon = {
        url: userBeacon.url,
        processData:
          userBeacon.processData || this.processBeaconData.bind(this),
        level: userBeacon.level ? resolveLevel(userBeacon.level) : level
      }
    }

    this.config = {
      ctx: ctx,
      color: color ?? true,
      label: label ? `[${label}] ` : undefined,
      level,
      beacon,
      processData: processData || this.processData.bind(this)
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
      if (!(level.value >= config.level.value)) return

      const { label, color } = config
      const params = []
      const payload = config.processData(
        {
          ctx: config.ctx,
          level,
          label
        },
        ...args
      )
      if (payload.ctx) {
        params.push(payload.ctx)
      }

      if (color) {
        params.push(
          `%c${level.name}`,
          // @ts-expect-error no types
          colors[level.name]
        )
      }
      if (label) {
        params.push(`${label}`)
      }

      // @ts-expect-error - not all methods are availalbe directly on console
      console[method](...params, ...payload.data)

      const { beacon } = config
      //only send beacon if default log level is bigger or equal to the beacon level
      if (beacon && config.level.value >= beacon.level.value) {
        const data = beacon.processData(
          {
            ctx: config.ctx,
            level
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
    return {
      ctx: info.ctx,
      data: args
    }
  }

  sendBeacon(url: string, data: any) {
    if (typeof window !== 'undefined') {
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      })
      navigator.sendBeacon(url, blob)
    }
  }

  getLevel() {
    return { ...this.config.level }
  }

  setLevel(level: LevelsByName) {
    this.config.level = resolveLevel(level)
  }

  allLevels() {
    return { ...logLevels }
  }
}
