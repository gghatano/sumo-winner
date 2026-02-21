export interface Match {
  east: string
  west: string
}

export type Prediction = 'E' | 'W' | null
export type Predictions = Record<number, Prediction>
