import {
  Level,
  LevelsByName,
  LogLevels,
  ProcessData,
} from "./types"

export function resolveLevel(level: string | number, logLevels: LogLevels) {
  let chosenLevel: Level | undefined

  for (const [key, value] of Object.entries(logLevels)) {
    if (value === level) {
      chosenLevel = {
        name: key as LevelsByName,
        value: level,
      }
      break
    }
    if (key === level) {
      chosenLevel = {
        name: key as LevelsByName,
        value,
      }
      break
    }
  }
  if (!chosenLevel) {
    throw new Error(`Unsupported level ${level}`)
  }

  return chosenLevel
}

export function generateStyles(bg: string, color: string) {
  return `background:${bg};color:${color};padding:2px;border-radius:2px;`
}


export const processData: ProcessData = (ctx, data: any[]) => {
  return {
    ctx,
    data,
  }
}
