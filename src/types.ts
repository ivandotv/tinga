import { logLevels } from './index'

export type ProcessBeaconDataFn = <T>(
  info: {
    level: Level
    ctx: T
  },
  ...args: any[]
) => { name: Level['name']; level: Level['value']; data: any }

export type ProcessDataFn = (
  info: {
    level: Level
    ctx: any
    label?: string
  },
  ...args: any[]
) => { ctx: any; data: any[] }

export type Config<T = any> = {
  ctx?: T
  level?: LevelsByName
  color?: boolean
  label?: string
  processData?: ProcessDataFn
  beacon?: {
    //todo change to remote
    url?: string
    level?: LevelsByValue | LevelsByName
    processData?: ProcessBeaconDataFn
  }
}

export type InternaConfig = {
  ctx: any
  level: Level
  color: boolean
  label?: string
  processData: ProcessDataFn
  beacon?: {
    url: string
    level: Level
    processData: ProcessBeaconDataFn
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
