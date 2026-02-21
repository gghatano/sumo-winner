import type { TorikumiData } from '../types'

export function validateTorikumiData(data: unknown): TorikumiData {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid torikumi data: not an object')
  }
  const d = data as Record<string, unknown>

  // basho
  if (typeof d.basho !== 'object' || d.basho === null) {
    throw new Error('Invalid torikumi data: missing basho')
  }
  const basho = d.basho as Record<string, unknown>
  if (typeof basho.id !== 'string' || typeof basho.label !== 'string') {
    throw new Error('Invalid torikumi data: invalid basho fields')
  }

  // day
  if (typeof d.day !== 'number' || d.day < 1 || d.day > 15) {
    throw new Error(`Invalid torikumi data: day out of range (${d.day})`)
  }

  // matches
  if (!Array.isArray(d.matches)) {
    throw new Error('Invalid torikumi data: matches is not an array')
  }
  for (const match of d.matches) {
    if (typeof match !== 'object' || match === null) {
      throw new Error('Invalid torikumi data: invalid match entry')
    }
    if (typeof match.east !== 'string' || typeof match.west !== 'string') {
      throw new Error('Invalid torikumi data: match missing east/west')
    }
  }

  return data as TorikumiData
}
