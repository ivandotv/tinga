import {
  Level,
  LevelsByName,
  LogLevels,
  ProcessData,
  ProcessRemoteData
} from './types'

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

export const processRemoteData: ProcessRemoteData = (
  ctx,
  data,
  { level, label }
) => {
  return {
    ctx,
    data,
    name: level.name,
    level: level.value,
    label: label
  }
}

export const processData: ProcessData = (ctx, data: any[]) => {
  return {
    ctx,
    data
  }
}
