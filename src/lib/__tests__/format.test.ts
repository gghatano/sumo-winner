import { describe, it, expect } from 'vitest'
import { dayToKanji, formatBashoDay, generateMatchLines, assemblePredictionText } from '../format'

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

describe('dayToKanji edge cases', () => {
  it('returns fallback for day 0', () => {
    expect(dayToKanji(0)).toBe('0日目')
  })

  it('returns fallback for day 16', () => {
    expect(dayToKanji(16)).toBe('16日目')
  })

  it('returns fallback for NaN', () => {
    expect(dayToKanji(NaN)).toBe('NaN日目')
  })

  it('returns fallback for negative number', () => {
    expect(dayToKanji(-1)).toBe('-1日目')
  })
})

describe('formatBashoDay', () => {
  it('通常の日目', () => {
    expect(formatBashoDay('2026年1月場所', 12)).toBe('2026年1月場所十二日目')
  })

  it('千秋楽', () => {
    expect(formatBashoDay('2026年1月場所', 15)).toBe('2026年1月場所千秋楽')
  })

  it('初日', () => {
    expect(formatBashoDay('2026年3月場所', 1)).toBe('2026年3月場所初日')
  })
})

describe('generateMatchLines', () => {
  const matches = [{ east: '高安', west: '大の里' }]

  it('東勝ち予想', () => {
    expect(generateMatchLines(matches, { 0: 'E' })).toBe('○高安－大の里●')
  })

  it('西勝ち予想', () => {
    expect(generateMatchLines(matches, { 0: 'W' })).toBe('●高安－大の里○')
  })

  it('未指定はデフォルト東勝ち', () => {
    expect(generateMatchLines(matches, {})).toBe('○高安－大の里●')
  })

  it('複数取組', () => {
    const multi = [
      { east: '高安', west: '大の里' },
      { east: '照ノ富士', west: '豊昇龍' },
    ]
    const result = generateMatchLines(multi, { 0: 'E', 1: 'W' })
    expect(result).toBe('○高安－大の里●\n●照ノ富士－豊昇龍○')
  })

  it('空配列は空文字列', () => {
    expect(generateMatchLines([], {})).toBe('')
  })
})

describe('assemblePredictionText', () => {
  it('全パーツを結合', () => {
    const result = assemblePredictionText({
      sourceUrl: 'https://sports.yahoo.co.jp/sumo/torikumi/202601/12',
      bashoDay: '2026年1月場所十二日目',
      headerComment: '（・ω・）ノ',
      matchLines: '○高安－大の里●',
      footerComment: 'これで',
    })
    expect(result).toBe('https://sports.yahoo.co.jp/sumo/torikumi/202601/12\n2026年1月場所十二日目\n（・ω・）ノ\n○高安－大の里●\nこれで')
  })

  it('先頭コメント空なら省略', () => {
    const result = assemblePredictionText({
      sourceUrl: 'https://example.com',
      bashoDay: '2026年1月場所千秋楽',
      headerComment: '',
      matchLines: '○高安－大の里●',
      footerComment: 'これで',
    })
    expect(result).toBe('https://example.com\n2026年1月場所千秋楽\n○高安－大の里●\nこれで')
  })

  it('末尾コメント空なら省略', () => {
    const result = assemblePredictionText({
      sourceUrl: 'https://example.com',
      bashoDay: '2026年1月場所初日',
      headerComment: 'よろしく',
      matchLines: '○高安－大の里●',
      footerComment: '',
    })
    expect(result).toBe('https://example.com\n2026年1月場所初日\nよろしく\n○高安－大の里●')
  })

  it('sourceUrl空なら省略', () => {
    const result = assemblePredictionText({
      sourceUrl: '',
      bashoDay: '2026年1月場所初日',
      headerComment: '（・ω・）ノ',
      matchLines: '○高安－大の里●',
      footerComment: 'これで',
    })
    expect(result).toBe('2026年1月場所初日\n（・ω・）ノ\n○高安－大の里●\nこれで')
  })
})
