import type Tinga from './tinga'

export type ProcessRemoteData<T = any, K = any> = (
  ctx: T,
  args: any[],
  info: {
    level: Level
    label?: string | undefined
  }
) => K

export type ProcessData<T = any, K = any> = (
  ctx: T,
  args: any[],
  info: {
    level: Level
    label?: string
  }
) => { ctx?: K; data: any[] }

export type Config<T = any> = {
  ctx?: T
  level?: LevelsByName
  label?: string
  processData?: ProcessData<T>
  remote?: {
    url: string
    level: LevelsByValue | LevelsByName
    processData?: ProcessRemoteData<T>
    send?: sendData
  }
}

export type ChildConfig<T = void, TParent = any> = Omit<Config<T>, 'ctx'> & {
  ctx?: ((ctx: TParent) => T) | T
}
export type InternaConfig<T = any> = {
  ctx: T
  level: Level
  label?: string
  processData: ProcessData
  remote?: {
    url: string
    level: Level
    processData: ProcessRemoteData
    send: sendData
  }
}
export type sendData = <T>(url: string, data: T) => void

export type ExtractKeys<T> = {
  [I in keyof T]: T[I]
}[keyof T]

export type ExtractValues<T> = {
  [I in keyof T]: I
}[keyof T]

export type LevelsByValue = ExtractKeys<Tinga['levels']>

export type LevelsByName = ExtractValues<Tinga['levels']>

export type LogLevels = Tinga['levels']

export type Level = {
  name: LevelsByName
  value: LevelsByValue
}
