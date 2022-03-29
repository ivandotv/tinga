import { logLevels } from './minilog'
import { Level, LevelsByName } from './types'

export function resolveLevel(level: string | number) {
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

export function prepareRemoteData(
  { level, ctx, label }: { level: Level; ctx?: any; label?: string },
  ...args: any[]
) {
  return {
    name: level.name,
    level: level.value,
    ctx,
    label,
    data: args
  }
}

export function prepareData(
  { ctx }: { level: Level; ctx?: any; label?: string },
  ...args: any[]
) {
  return {
    ctx,
    data: args
  }
}
