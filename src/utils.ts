import { Level, LevelsByName, LogLevels } from './types'

export function resolveLevel(level: string | number, logLevels: LogLevels) {
  let chosenLevel: Level | undefined

  for (const [key, value] of Object.entries(logLevels)) {
    if (typeof level === 'number') {
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

export function sendData(url: string, data: any) {
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json'
    })
    navigator.sendBeacon(url, blob)
  }
}

export function generateStyles(bg: string, color: string) {
  return `background:${bg};color:${color};padding:2px;border-radius:2px;`
}

export function prepareRemoteData<T = any>(
  { level, ctx, label }: { level: Level; ctx?: any; label?: string },
  ...args: any[]
): T {
  return {
    name: level.name,
    level: level.value,
    ctx,
    label,
    data: args
  } as unknown as T
}

export function prepareData<T = any>(
  { ctx }: { level: Level; ctx?: any; label?: string },
  ...args: any[]
): T {
  return {
    ctx,
    data: args
  } as unknown as T
}
