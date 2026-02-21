export interface Basho {
  id: string
  label: string
}

export interface Match {
  east: string
  west: string
}

export interface TorikumiData {
  source: string
  basho: Basho
  day: number
  updatedAt: string
  division: string
  matches: Match[]
}

export interface BashoInfo {
  id: string
  label: string
  days: number
}

export interface TorikumiIndex {
  bashoList: BashoInfo[]
  latest: { bashoId: string; day: number }
}

export type Prediction = 'E' | 'W' | null
export type Predictions = Record<number, Prediction>
