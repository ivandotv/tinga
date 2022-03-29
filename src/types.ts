import { logLevels } from './index'

export type processRemoteData = (
  info: {
    level: Level
    ctx?: any
    label?: string | undefined
  },
  ...args: any[]
) => {
  name: Level['name']
  level: Level['value']
  data: any
  label?: string | undefined
  ctx: any
}

export type processData = (
  info: {
    level: Level
    ctx?: any
    label?: string
  },
  ...args: any[]
) => { ctx: any; data: any[] }

export type Config<T = any> = {
  ctx?: T
  level?: LevelsByName
  color?: boolean
  label?: string
  processData?: processData
  remote?: {
    //todo change to remote
    url?: string
    level?: LevelsByValue | LevelsByName
    processData?: processRemoteData
  }
}

export type InternaConfig = {
  ctx: any
  level: Level
  color: boolean
  label?: string
  processData: processData
  remote?: {
    url: string
    level: Level
    processData: processRemoteData
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
