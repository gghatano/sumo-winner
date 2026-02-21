import type { Match, Predictions } from '../types'

const DAY_MAP: Record<number, string> = {
  1: '初日',
  2: '二日目',
  3: '三日目',
  4: '四日目',
  5: '五日目',
  6: '六日目',
  7: '七日目',
  8: '中日',
  9: '九日目',
  10: '十日目',
  11: '十一日目',
  12: '十二日目',
  13: '十三日目',
  14: '十四日目',
  15: '千秋楽',
}

export function dayToKanji(day: number): string {
  const result = DAY_MAP[day]
  if (!result) {
    throw new Error(`Invalid day: ${day}. Must be between 1 and 15.`)
  }
  return result
}

function generateHeader(day: number): string {
  return `${dayToKanji(day)}（・ω・）ノ`
}

export function generatePredictionText(
  day: number,
  matches: Match[],
  predictions: Predictions
): string {
  const header = generateHeader(day)
  const lines = matches.map((match, index) => {
    const pred = predictions[index] ?? null
    if (pred === 'E') {
      return `○${match.east}－${match.west}●`
    } else if (pred === 'W') {
      return `●${match.east}－${match.west}○`
    } else {
      return `\u3000${match.east}－${match.west}\u3000`
    }
  })
  return [header, ...lines].join('\n')
}
