import type { Match, Prediction } from '../types'

interface Props {
  matches: Match[]
  predictions: Record<number, Prediction>
  onPredict: (index: number, value: Prediction) => void
}

export default function MatchList({ matches, predictions, onPredict }: Props) {
  // デフォルトは東勝ち('E')。nullは発生しない
  const getPred = (index: number): 'E' | 'W' => predictions[index] ?? 'E'

  // 負け側をクリック → 勝ち予想を反転。勝ち側クリックは何もしない
  const handleClickEast = (index: number) => {
    if (getPred(index) !== 'E') {
      onPredict(index, 'E')
    }
  }

  const handleClickWest = (index: number) => {
    if (getPred(index) !== 'W') {
      onPredict(index, 'W')
    }
  }

  return (
    <div className="match-list">
      {matches.map((match, index) => {
        const eastWin = getPred(index) === 'E'
        return (
          <div key={index} className="match-card">
            <div
              className={`wrestler east${eastWin ? ' winner' : ' loser'}`}
              onClick={() => handleClickEast(index)}
            >
              <span className="wrestler-name">{match.east}</span>
              <span className={`result-label ${eastWin ? 'win-label' : 'lose-label'}`}>
                {eastWin ? '(勝ち)' : '(負け)'}
              </span>
            </div>
            <div className="prediction-indicator">
              <span className={`mark${eastWin ? ' win' : ' lose'}`}>{eastWin ? '\u25CB' : '\u25CF'}</span>
              <span className="mark-separator">-</span>
              <span className={`mark${eastWin ? ' lose' : ' win'}`}>{eastWin ? '\u25CF' : '\u25CB'}</span>
            </div>
            <div
              className={`wrestler west${eastWin ? ' loser' : ' winner'}`}
              onClick={() => handleClickWest(index)}
            >
              <span className="wrestler-name">{match.west}</span>
              <span className={`result-label ${eastWin ? 'lose-label' : 'win-label'}`}>
                {eastWin ? '(負け)' : '(勝ち)'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
