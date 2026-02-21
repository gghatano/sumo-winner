import { describe, it, expect } from 'vitest'
import { dayToKanji, generatePredictionText } from '../format'

describe('dayToKanji', () => {
  it('1 → "初日"', () => {
    expect(dayToKanji(1)).toBe('初日')
  })

  it('8 → "中日"', () => {
    expect(dayToKanji(8)).toBe('中日')
  })

  it('12 → "十二日目"', () => {
    expect(dayToKanji(12)).toBe('十二日目')
  })

  it('15 → "千秋楽"', () => {
    expect(dayToKanji(15)).toBe('千秋楽')
  })
})

describe('generatePredictionText', () => {
  const matches = [{ east: '高安', west: '大の里' }]

  it('東勝ち予想', () => {
    const result = generatePredictionText(12, matches, { 0: 'E' })
    expect(result).toContain('○高安－大の里●')
  })

  it('西勝ち予想', () => {
    const result = generatePredictionText(12, matches, { 0: 'W' })
    expect(result).toContain('●高安－大の里○')
  })

  it('未選択', () => {
    const result = generatePredictionText(12, matches, {})
    expect(result).toContain('\u3000高安－大の里\u3000')
  })

  it('ヘッダ行が正しい', () => {
    const result = generatePredictionText(12, matches, {})
    const firstLine = result.split('\n')[0]
    expect(firstLine).toBe('十二日目（・ω・）ノ')
  })

  it('複数取組が正しく結合される', () => {
    const multiMatches = [
      { east: '高安', west: '大の里' },
      { east: '照ノ富士', west: '豊昇龍' },
    ]
    const result = generatePredictionText(1, multiMatches, { 0: 'E', 1: 'W' })
    const lines = result.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('初日（・ω・）ノ')
    expect(lines[1]).toBe('○高安－大の里●')
    expect(lines[2]).toBe('●照ノ富士－豊昇龍○')
  })

  it('空のmatches配列でもヘッダのみ生成', () => {
    const result = generatePredictionText(15, [], {})
    expect(result).toBe('千秋楽（・ω・）ノ')
  })
})
