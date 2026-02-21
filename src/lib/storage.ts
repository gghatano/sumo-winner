import type { Predictions } from '../types'

const STORAGE_PREFIX = 'predictions'

function getKey(bashoId: string, day: number, division: string): string {
  return `${STORAGE_PREFIX}:${bashoId}:${day}:${division}`
}

export function savePredictions(
  bashoId: string,
  day: number,
  division: string,
  predictions: Predictions
): void {
  if (!bashoId) return
  const key = getKey(bashoId, day, division)
  localStorage.setItem(key, JSON.stringify(predictions))
}

export function loadPredictions(
  bashoId: string,
  day: number,
  division: string
): Predictions {
  if (!bashoId) return {}
  const key = getKey(bashoId, day, division)
  const raw = localStorage.getItem(key)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function clearPredictions(
  bashoId: string,
  day: number,
  division: string
): void {
  const key = getKey(bashoId, day, division)
  localStorage.removeItem(key)
}
