import { useEffect, useRef, useCallback } from 'react'
import { useQuiz } from '../hooks/useQuiz'
import MatchList from './MatchList'

interface Props {
  onExit: () => void
}

export default function QuizView({ onExit }: Props) {
  const {
    quizState,
    currentBashoLabel,
    currentDay,
    matches,
    predictions,
    score,
    revealedCount,
    loading,
    startQuiz,
    setPrediction,
    submitAnswers,
    nextQuiz,
    exitQuiz,
  } = useQuiz()

  // Auto-start quiz on mount
  const started = useRef(false)
  useEffect(() => {
    if (!started.current) {
      started.current = true
      startQuiz()
    }
  }, [startQuiz])

  // Sequential reveal animation
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (quizState !== 'revealing') return
    if (revealedCount >= matches.length) {
      // All revealed, wait a moment then show final result
      revealTimerRef.current = setTimeout(() => {
        // quizState will be set to 'result' by parent - but we need to trigger it
      }, 600)
      return
    }
    // Reveal next match
    revealTimerRef.current = setTimeout(() => {
      // We need to increment revealedCount - but it's in the hook
      // So we dispatch from here
    }, 400)
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    }
  }, [quizState, revealedCount, matches.length])

  // Auto-scroll to currently revealing match
  const matchRefs = useRef<(HTMLDivElement | null)[]>([])
  const setMatchRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    matchRefs.current[index] = el
  }, [])

  useEffect(() => {
    if (quizState === 'revealing' && revealedCount > 0 && revealedCount <= matches.length) {
      const el = matchRefs.current[revealedCount - 1]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [quizState, revealedCount, matches.length])

  const handleExit = () => {
    exitQuiz()
    onExit()
  }

  if (loading || quizState === 'idle') {
    return (
      <div className="app">
        <p>クイズを準備中...</p>
      </div>
    )
  }

  // Convert QuizMatch[] to Match[] for MatchList
  const matchListMatches = matches.map((m) => ({ east: m.east, west: m.west }))

  // Build answers map from actual winners
  const answers: Record<number, 'E' | 'W'> = {}
  matches.forEach((m, i) => {
    answers[i] = m.winner
  })

  if (quizState === 'playing') {
    return (
      <div className="app">
        <div className="quiz-header">
          <h2>{currentBashoLabel} {currentDay}日目</h2>
          <p>各取組の勝者を予想してください</p>
        </div>
        <MatchList
          matches={matchListMatches}
          predictions={predictions}
          onPredict={(index, value) => {
            if (value) setPrediction(index, value)
          }}
        />
        <div className="quiz-actions">
          <button className="quiz-submit-button" onClick={submitAnswers}>
            答え合わせ
          </button>
          <button className="quiz-exit-button" onClick={handleExit}>
            やめる
          </button>
        </div>
      </div>
    )
  }

  const isRevealing = quizState === 'revealing'
  const allRevealed = revealedCount >= matches.length
  const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  return (
    <div className="app">
      <div className="quiz-header">
        <h2>{currentBashoLabel} {currentDay}日目</h2>
        {isRevealing && !allRevealed && (
          <p>答え合わせ中... ({revealedCount}/{matches.length})</p>
        )}
      </div>
      {allRevealed && (
        <div className="quiz-score">
          <p className="quiz-score-main">{score.correct} / {score.total} 問正解 ({percentage}%)</p>
        </div>
      )}
      <div className="match-list">
        {matchListMatches.map((match, index) => {
          const eastWin = (predictions[index] ?? 'E') === 'E'
          const revealed = index < revealedCount
          const isCorrect = revealed ? predictions[index] === answers[index] : false
          return (
            <div
              key={index}
              ref={setMatchRef(index)}
              className={`match-card${revealed ? (isCorrect ? ' correct' : ' incorrect') : ''}`}
            >
              <div className={`wrestler east${eastWin ? ' winner' : ' loser'} readonly`}>
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
              <div className={`wrestler west${eastWin ? ' loser' : ' winner'} readonly`}>
                <span className="wrestler-name">{match.west}</span>
                <span className={`result-label ${eastWin ? 'lose-label' : 'win-label'}`}>
                  {eastWin ? '(負け)' : '(勝ち)'}
                </span>
              </div>
              {revealed && (
                <div className={`quiz-result-mark ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? '\u25CB' : '\u2715'}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {allRevealed && (
        <div className="quiz-actions">
          <button className="quiz-submit-button" onClick={nextQuiz}>
            もう一回
          </button>
          <button className="quiz-exit-button" onClick={handleExit}>
            やめる
          </button>
        </div>
      )}
    </div>
  )
}
