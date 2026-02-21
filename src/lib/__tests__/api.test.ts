import { describe, it, expect } from 'vitest'
import { validateTorikumiData, validateTorikumiIndex } from '../validate'

function validData() {
  return {
    source: 'https://example.com',
    basho: { id: '202501', label: '令和7年初場所' },
    day: 1,
    updatedAt: '2025-01-12T10:00:00Z',
    division: 'makuuchi',
    matches: [
      { east: '照ノ富士', west: '琴櫻' },
      { east: '豊昇龍', west: '大の里' },
    ],
  }
}

describe('validateTorikumiData', () => {
  it('accepts valid data', () => {
    const data = validData()
    expect(validateTorikumiData(data)).toEqual(data)
  })

  it('throws on null', () => {
    expect(() => validateTorikumiData(null)).toThrow('not an object')
  })

  it('throws on non-object', () => {
    expect(() => validateTorikumiData('string')).toThrow('not an object')
  })

  it('throws when basho is missing', () => {
    const data = validData()
    ;(data as Record<string, unknown>).basho = null
    expect(() => validateTorikumiData(data)).toThrow('missing basho')
  })

  it('throws when basho fields are invalid', () => {
    const data = validData()
    ;(data as Record<string, unknown>).basho = { id: 123, label: 'ok' }
    expect(() => validateTorikumiData(data)).toThrow('invalid basho fields')
  })

  it('throws when day is 0', () => {
    const data = validData()
    data.day = 0
    expect(() => validateTorikumiData(data)).toThrow('day out of range (0)')
  })

  it('throws when day is 16', () => {
    const data = validData()
    data.day = 16
    expect(() => validateTorikumiData(data)).toThrow('day out of range (16)')
  })

  it('throws when matches is not an array', () => {
    const data = validData()
    ;(data as Record<string, unknown>).matches = 'not-array'
    expect(() => validateTorikumiData(data)).toThrow('matches is not an array')
  })

  it('throws when a match entry is null', () => {
    const data = validData()
    ;(data as Record<string, unknown>).matches = [null]
    expect(() => validateTorikumiData(data)).toThrow('invalid match entry')
  })

  it('throws when match is missing east/west', () => {
    const data = validData()
    data.matches = [{ east: '照ノ富士' } as { east: string; west: string }]
    expect(() => validateTorikumiData(data)).toThrow('match missing east/west')
  })
})

function validIndex() {
  return {
    bashoList: [
      { id: '202501', label: '令和7年初場所', days: 15 },
      { id: '202503', label: '令和7年春場所', days: 15 },
    ],
    latest: { bashoId: '202501', day: 3 },
  }
}

describe('validateTorikumiIndex', () => {
  it('accepts valid data', () => {
    const data = validIndex()
    expect(validateTorikumiIndex(data)).toEqual(data)
  })

  it('throws on null', () => {
    expect(() => validateTorikumiIndex(null)).toThrow('not an object')
  })

  it('throws when bashoList is not an array', () => {
    const data = validIndex()
    ;(data as Record<string, unknown>).bashoList = 'not-array'
    expect(() => validateTorikumiIndex(data)).toThrow('bashoList is not an array')
  })

  it('throws when basho entry is null', () => {
    const data = validIndex()
    ;(data as Record<string, unknown>).bashoList = [null]
    expect(() => validateTorikumiIndex(data)).toThrow('invalid basho entry')
  })

  it('throws when basho entry missing id/label', () => {
    const data = validIndex()
    ;(data as Record<string, unknown>).bashoList = [{ id: 123, label: 'ok', days: 15 }]
    expect(() => validateTorikumiIndex(data)).toThrow('basho missing id/label')
  })

  it('throws when days is 0', () => {
    const data = validIndex()
    ;(data as Record<string, unknown>).bashoList = [{ id: '202501', label: '令和7年初場所', days: 0 }]
    expect(() => validateTorikumiIndex(data)).toThrow('basho has invalid days')
  })

  it('throws when latest is missing', () => {
    const data = validIndex()
    ;(data as Record<string, unknown>).latest = null
    expect(() => validateTorikumiIndex(data)).toThrow('missing latest')
  })

  it('throws when latest has invalid fields', () => {
    const data = validIndex()
    ;(data as Record<string, unknown>).latest = { bashoId: 123, day: 'abc' }
    expect(() => validateTorikumiIndex(data)).toThrow('invalid latest fields')
  })
})
