import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchQuizIndex, fetchQuizData } from '../lib/api'
import type { QuizMatch, QuizIndex } from '../types'

export type QuizState = 'idle' | 'playing' | 'revealing' | 'result'

interface UseQuizReturn {
  quizState: QuizState
  currentBashoLabel: string
  currentDay: string
  matches: QuizMatch[]
  predictions: Record<number, 'E' | 'W'>
  score: { correct: number; total: number }
  revealedCount: number
  quizAvailable: boolean
  loading: boolean
  startQuiz: () => Promise<void>
  setPrediction: (index: number, value: 'E' | 'W') => void
  submitAnswers: () => void
  nextQuiz: () => Promise<void>
  exitQuiz: () => void
}

export function useQuiz(): UseQuizReturn {
  const [quizState, setQuizState] = useState<QuizState>('idle')
  const [currentBashoLabel, setCurrentBashoLabel] = useState('')
  const [currentDay, setCurrentDay] = useState('')
  const [matches, setMatches] = useState<QuizMatch[]>([])
  const [predictions, setPredictions] = useState<Record<number, 'E' | 'W'>>({})
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [revealedCount, setRevealedCount] = useState(0)
  const [quizIndex, setQuizIndex] = useState<QuizIndex | null>(null)
  const [quizAvailable, setQuizAvailable] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadQuizIndex = useCallback(async (): Promise<QuizIndex | null> => {
    if (quizIndex) return quizIndex
    try {
      const index = await fetchQuizIndex()
      setQuizIndex(index)
      setQuizAvailable(index.bashoList.length > 0)
      return index
    } catch {
      setQuizAvailable(false)
      return null
    }
  }, [quizIndex])

  const startQuiz = useCallback(async () => {
    setLoading(true)
    try {
      const index = await loadQuizIndex()
      if (!index || index.bashoList.length === 0) {
        setQuizAvailable(false)
        setLoading(false)
        return
      }

      // Pick a random basho
      const randomBasho = index.bashoList[Math.floor(Math.random() * index.bashoList.length)]
      const bashoData = await fetchQuizData(randomBasho.id)

      // Pick a random day
      const dayKeys = Object.keys(bashoData.days)
      if (dayKeys.length === 0) {
        setLoading(false)
        return
      }
      const randomDay = dayKeys[Math.floor(Math.random() * dayKeys.length)]
      const dayMatches = bashoData.days[randomDay]

      setCurrentBashoLabel(bashoData.basho.label)
      setCurrentDay(randomDay)
      setMatches(dayMatches)
      // Initialize all predictions to 'E' (default)
      const initialPredictions: Record<number, 'E' | 'W'> = {}
      dayMatches.forEach((_, i) => {
        initialPredictions[i] = 'E'
      })
      setPredictions(initialPredictions)
      setScore({ correct: 0, total: 0 })
      setQuizState('playing')
    } catch {
      // Quiz data not available
      setQuizAvailable(false)
    } finally {
      setLoading(false)
    }
  }, [loadQuizIndex])

  const setPrediction = useCallback((index: number, value: 'E' | 'W') => {
    setPredictions((prev) => ({ ...prev, [index]: value }))
  }, [])

  const submitAnswers = useCallback(() => {
    let correct = 0
    const total = matches.length
    matches.forEach((match, i) => {
      if (predictions[i] === match.winner) {
        correct++
      }
    })
    setScore({ correct, total })
    setRevealedCount(0)
    setQuizState('revealing')
  }, [matches, predictions])

  // Sequential reveal timer
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (quizState !== 'revealing') return
    if (revealedCount >= matches.length) {
      // All revealed, transition to result after a short delay
      revealTimer.current = setTimeout(() => {
        setQuizState('result')
      }, 600)
      return () => {
        if (revealTimer.current) clearTimeout(revealTimer.current)
      }
    }
    // Reveal next match after delay
    revealTimer.current = setTimeout(() => {
      setRevealedCount((prev) => prev + 1)
    }, 400)
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current)
    }
  }, [quizState, revealedCount, matches.length])

  const nextQuiz = useCallback(async () => {
    await startQuiz()
  }, [startQuiz])

  const exitQuiz = useCallback(() => {
    setQuizState('idle')
    setMatches([])
    setPredictions({})
    setScore({ correct: 0, total: 0 })
    setRevealedCount(0)
  }, [])

  return {
    quizState,
    currentBashoLabel,
    currentDay,
    matches,
    predictions,
    score,
    revealedCount,
    quizAvailable,
    loading,
    startQuiz,
    setPrediction,
    submitAnswers,
    nextQuiz,
    exitQuiz,
  }
}
