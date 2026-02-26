import type { Match, Prediction } from '../types'

interface Props {
  matches: Match[]
  predictions: Record<number, Prediction>
  onPredict: (index: number, value: Prediction) => void
  readOnly?: boolean
  answers?: Record<number, 'E' | 'W'>
  showResult?: boolean
  revealedCount?: number
}

export default function MatchList({ matches, predictions, onPredict, readOnly, answers, showResult, revealedCount }: Props) {
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

  const isRevealed = (index: number): boolean => {
    if (!showResult || !answers) return false
    if (revealedCount === undefined) return true
    return index < revealedCount
  }

  const getResultClass = (index: number): string => {
    if (!isRevealed(index)) return ''
    const pred = getPred(index)
    const answer = answers![index]
    if (pred === answer) return ' correct'
    return ' incorrect'
  }

  return (
    <div className="match-list">
      {matches.map((match, index) => {
        const eastWin = getPred(index) === 'E'
        const isClickable = !readOnly && !showResult
        return (
          <div key={index} className={`match-card${getResultClass(index)}`}>
            <div
              className={`wrestler east${eastWin ? ' winner' : ' loser'}${(readOnly || showResult) ? ' readonly' : ''}`}
              onClick={() => isClickable && handleClickEast(index)}
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
              className={`wrestler west${eastWin ? ' loser' : ' winner'}${(readOnly || showResult) ? ' readonly' : ''}`}
              onClick={() => isClickable && handleClickWest(index)}
            >
              <span className="wrestler-name">{match.west}</span>
              <span className={`result-label ${eastWin ? 'lose-label' : 'win-label'}`}>
                {eastWin ? '(負け)' : '(勝ち)'}
              </span>
            </div>
            {isRevealed(index) && (
              <div className={`quiz-result-mark ${getPred(index) === answers![index] ? 'correct' : 'incorrect'}`}>
                {getPred(index) === answers![index] ? '\u25CB' : '\u2715'}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
