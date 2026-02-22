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
  if (!Number.isFinite(day) || day < 1 || day > 15) {
    return `${day}日目`
  }
  return DAY_MAP[day]
}

export function formatBashoDay(bashoLabel: string, day: number): string {
  if (day === 15) {
    return `${bashoLabel}千秋楽`
  }
  return `${bashoLabel}${dayToKanji(day)}`
}

export function generateMatchLines(
  matches: Match[],
  predictions: Predictions
): string {
  return matches.map((match, index) => {
    const pred = predictions[index] ?? 'E'
    if (pred === 'W') {
      return `●${match.east}－${match.west}○`
    } else {
      return `○${match.east}－${match.west}●`
    }
  }).join('\n')
}

export interface TextParts {
  sourceUrl: string
  bashoDay: string
  headerComment: string
  matchLines: string
  footerComment: string
}

export function assemblePredictionText(parts: TextParts): string {
  const lines: string[] = []
  if (parts.sourceUrl) {
    lines.push(parts.sourceUrl)
  }
  lines.push(parts.bashoDay)
  if (parts.headerComment) {
    lines.push(parts.headerComment)
  }
  lines.push(parts.matchLines)
  if (parts.footerComment) {
    lines.push(parts.footerComment)
  }
  return lines.join('\n')
}
