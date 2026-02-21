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

export type Prediction = 'E' | 'W' | null
