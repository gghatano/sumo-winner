import { useState, useEffect, useCallback } from 'react'
import { savePredictions, loadPredictions } from '../lib/storage'
import type { Prediction, Predictions } from '../types'

export function usePredictions(bashoId: string, day: number, division: string) {
  const [predictions, setPredictionsState] = useState<Predictions>(() =>
    loadPredictions(bashoId, day, division)
  )

  // bashoId/day/division が変わったらlocalStorageから復元
  useEffect(() => {
    setPredictionsState(loadPredictions(bashoId, day, division))
  }, [bashoId, day, division])

  // predictions が変わったらlocalStorageに保存
  useEffect(() => {
    savePredictions(bashoId, day, division, predictions)
  }, [bashoId, day, division, predictions])

  const setPrediction = useCallback((index: number, value: Prediction) => {
    setPredictionsState(prev => ({ ...prev, [index]: value }))
  }, [])

  const clearAll = useCallback(() => {
    setPredictionsState({})
  }, [])

  return { predictions, setPrediction, clearAll }
}
