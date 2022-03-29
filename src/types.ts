import { logLevels } from './index'

export type ProcessDataFn = <T>(
  info: {
    level: Level
    ctx: T
  },
  ...args: any[]
) => { name: Level['name']; level: Level['value']; data: any }

export type Config<T = any> = {
  ctx?: T
  level?: LevelsByValue | LevelsByName
  beacon?: {
    url?: string
    level?: LevelsByValue | LevelsByName
    processData?: ProcessDataFn
  }
}

export type InternaConfig = {
  ctx: any
  level: Level
  beacon?: {
    url: string
    level: Level
    processData: ProcessDataFn
  }
}

export type ExtractKeys<T> = {
  [I in keyof T]: T[I]
}[keyof T]

export type ExtractValues<T> = {
  [I in keyof T]: I
}[keyof T]

export type LevelsByValue = ExtractKeys<typeof logLevels>

export type LevelsByName = ExtractValues<typeof logLevels>

export type Level = {
  name: LevelsByName
  value: LevelsByValue
}
