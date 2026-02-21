import type { Basho } from '../types'

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
  basho: Basho
  day: number
  onDayChange: (day: number) => void
}

export default function BashoSelector({ basho, day, onDayChange }: Props) {
  return (
    <div className="basho-selector">
      <div className="selector-group">
        <label htmlFor="basho-select">場所</label>
        <select id="basho-select" value={basho.id} disabled>
          <option value={basho.id}>{basho.label}</option>
        </select>
      </div>
      <div className="selector-group">
        <label htmlFor="day-select">日目</label>
        <select
          id="day-select"
          value={day}
          onChange={(e) => onDayChange(Number(e.target.value))}
        >
          {Array.from({ length: 15 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {DAY_LABELS[d]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
