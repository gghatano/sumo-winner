import type { TorikumiData, TorikumiIndex, QuizIndex, QuizBashoData } from '../types'

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

export function validateTorikumiIndex(data: unknown): TorikumiIndex {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid index data: not an object')
  }
  const d = data as Record<string, unknown>

  // bashoList
  if (!Array.isArray(d.bashoList)) {
    throw new Error('Invalid index data: bashoList is not an array')
  }
  for (const basho of d.bashoList) {
    if (typeof basho !== 'object' || basho === null) {
      throw new Error('Invalid index data: invalid basho entry')
    }
    if (typeof basho.id !== 'string' || typeof basho.label !== 'string') {
      throw new Error('Invalid index data: basho missing id/label')
    }
    if (typeof basho.days !== 'number' || basho.days < 1) {
      throw new Error('Invalid index data: basho has invalid days')
    }
  }

  // latest
  if (typeof d.latest !== 'object' || d.latest === null) {
    throw new Error('Invalid index data: missing latest')
  }
  const latest = d.latest as Record<string, unknown>
  if (typeof latest.bashoId !== 'string' || typeof latest.day !== 'number') {
    throw new Error('Invalid index data: invalid latest fields')
  }

  // status (optional, backward compatible)
  if (d.status !== undefined && d.status !== 'active' && d.status !== 'off-season') {
    throw new Error(`Invalid index data: invalid status '${d.status}'`)
  }

  return data as TorikumiIndex
}

export function validateQuizIndex(data: unknown): QuizIndex {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid quiz index: not an object')
  }
  const d = data as Record<string, unknown>

  if (!Array.isArray(d.bashoList)) {
    throw new Error('Invalid quiz index: bashoList is not an array')
  }
  for (const basho of d.bashoList) {
    if (typeof basho !== 'object' || basho === null) {
      throw new Error('Invalid quiz index: invalid basho entry')
    }
    if (typeof basho.id !== 'string' || typeof basho.label !== 'string') {
      throw new Error('Invalid quiz index: basho missing id/label')
    }
  }

  return data as QuizIndex
}

export function validateQuizBashoData(data: unknown): QuizBashoData {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid quiz basho data: not an object')
  }
  const d = data as Record<string, unknown>

  // basho
  if (typeof d.basho !== 'object' || d.basho === null) {
    throw new Error('Invalid quiz basho data: missing basho')
  }
  const basho = d.basho as Record<string, unknown>
  if (typeof basho.id !== 'string' || typeof basho.label !== 'string') {
    throw new Error('Invalid quiz basho data: invalid basho fields')
  }

  // days
  if (typeof d.days !== 'object' || d.days === null) {
    throw new Error('Invalid quiz basho data: missing days')
  }
  const days = d.days as Record<string, unknown>
  for (const [, matches] of Object.entries(days)) {
    if (!Array.isArray(matches)) {
      throw new Error('Invalid quiz basho data: day matches is not an array')
    }
    for (const match of matches) {
      if (typeof match !== 'object' || match === null) {
        throw new Error('Invalid quiz basho data: invalid match entry')
      }
      if (typeof match.east !== 'string' || typeof match.west !== 'string') {
        throw new Error('Invalid quiz basho data: match missing east/west')
      }
      if (match.winner !== 'E' && match.winner !== 'W') {
        throw new Error('Invalid quiz basho data: match has invalid winner')
      }
      if (typeof match.kimarite !== 'string') {
        throw new Error('Invalid quiz basho data: match missing kimarite')
      }
    }
  }

  return data as QuizBashoData
}
