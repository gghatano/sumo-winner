import type { Match, Prediction } from '../types'

interface Props {
  matches: Match[]
  predictions: Record<number, Prediction>
  onPredict: (index: number, value: Prediction) => void
}

export default function MatchList({ matches, predictions, onPredict }: Props) {
  const handleClick = (index: number, side: 'E' | 'W') => {
    if (predictions[index] === side) {
      onPredict(index, null)
    } else {
      onPredict(index, side)
    }
  }

  return (
    <div className="match-list">
      {matches.map((match, index) => {
        const prediction = predictions[index] ?? null
        return (
          <div key={index} className="match-card">
            <button
              className={`wrestler east${prediction === 'E' ? ' selected' : ''}`}
              onClick={() => handleClick(index, 'E')}
              type="button"
            >
              {match.east}
            </button>
            <span className="vs">-</span>
            <button
              className={`wrestler west${prediction === 'W' ? ' selected' : ''}`}
              onClick={() => handleClick(index, 'W')}
              type="button"
            >
              {match.west}
            </button>
          </div>
        )
      })}
    </div>
  )
}
