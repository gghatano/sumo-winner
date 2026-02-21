import { describe, it, expect, beforeEach } from 'vitest'
import { savePredictions, loadPredictions, clearPredictions } from '../storage'
import type { Predictions } from '../../types'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('savePredictions でlocalStorageに保存される', () => {
    const predictions: Predictions = { 0: 'E', 1: 'W', 2: null }
    savePredictions('202501', 1, 'makuuchi', predictions)

    const raw = localStorage.getItem('predictions:202501:1:makuuchi')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual({ '0': 'E', '1': 'W', '2': null })
  })

  it('loadPredictions でlocalStorageから復元される', () => {
    const predictions: Predictions = { 0: 'E', 1: 'W' }
    localStorage.setItem(
      'predictions:202501:1:makuuchi',
      JSON.stringify(predictions)
    )

    const loaded = loadPredictions('202501', 1, 'makuuchi')
    expect(loaded).toEqual({ '0': 'E', '1': 'W' })
  })

  it('存在しないキーでは空オブジェクトが返る', () => {
    const loaded = loadPredictions('202501', 1, 'makuuchi')
    expect(loaded).toEqual({})
  })

  it('壊れたJSONでは空オブジェクトが返る', () => {
    localStorage.setItem('predictions:202501:1:makuuchi', '{invalid json}')
    const loaded = loadPredictions('202501', 1, 'makuuchi')
    expect(loaded).toEqual({})
  })

  it('clearPredictions でlocalStorageから削除される', () => {
    savePredictions('202501', 1, 'makuuchi', { 0: 'E' })
    expect(localStorage.getItem('predictions:202501:1:makuuchi')).not.toBeNull()

    clearPredictions('202501', 1, 'makuuchi')
    expect(localStorage.getItem('predictions:202501:1:makuuchi')).toBeNull()
  })

  it('異なるbashoId/day/divisionで独立したキーになる', () => {
    savePredictions('202501', 1, 'makuuchi', { 0: 'E' })
    savePredictions('202501', 2, 'makuuchi', { 0: 'W' })
    savePredictions('202503', 1, 'juryo', { 0: null })

    expect(loadPredictions('202501', 1, 'makuuchi')).toEqual({ '0': 'E' })
    expect(loadPredictions('202501', 2, 'makuuchi')).toEqual({ '0': 'W' })
    expect(loadPredictions('202503', 1, 'juryo')).toEqual({ '0': null })
  })

  it('空のbashoIdではsavePredictionsがlocalStorageに書き込まない', () => {
    savePredictions('', 1, 'makuuchi', { 0: 'E' })
    expect(localStorage.getItem('predictions::1:makuuchi')).toBeNull()
  })

  it('空のbashoIdではloadPredictionsが空オブジェクトを返す', () => {
    const loaded = loadPredictions('', 1, 'makuuchi')
    expect(loaded).toEqual({})
  })
})
