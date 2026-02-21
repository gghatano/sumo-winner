import type { BashoInfo } from '../types'

const DAY_LABELS: Record<number, string> = {
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

interface Props {
  bashoList: BashoInfo[]
  selectedBashoId: string
  day: number
  onBashoChange: (bashoId: string) => void
  onDayChange: (day: number) => void
}

export default function BashoSelector({ bashoList, selectedBashoId, day, onBashoChange, onDayChange }: Props) {
  const currentBasho = bashoList.find(b => b.id === selectedBashoId)
  const maxDays = currentBasho?.days ?? 15

  return (
    <div className="basho-selector">
      <div className="selector-group">
        <label htmlFor="basho-select">場所</label>
        <select
          id="basho-select"
          value={selectedBashoId}
          onChange={(e) => onBashoChange(e.target.value)}
        >
          {bashoList.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
      <div className="selector-group">
        <label htmlFor="day-select">日目</label>
        <select
          id="day-select"
          value={day}
          onChange={(e) => onDayChange(Number(e.target.value))}
        >
          {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {DAY_LABELS[d] ?? `${d}日目`}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
