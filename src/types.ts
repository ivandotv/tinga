import { logLevels } from './index'

export type processRemoteData<T = any, K = any> = (
  info: {
    level: Level
    ctx?: T
    label?: string | undefined
  },
  ...args: any[]
) => K

export type processData<T = any, K = any> = (
  info: {
    level: Level
    ctx?: T
    label?: string
  },
  ...args: any[]
) => { ctx: K; data: any[] }

export type Config<T = any> = {
  ctx?: T
  level?: LevelsByName
  color?: boolean
  label?: string
  processData?: processData<T>
  remote?: {
    url: string
    level: LevelsByValue | LevelsByName
    processData?: processRemoteData<T>
    sendData?: sendData
  }
}
export type sendData = <T>(url: string, data: T) => void

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
    sendData: sendData
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

export type LogLevels = typeof logLevels

export type Level = {
  name: LevelsByName
  value: LevelsByValue
}
