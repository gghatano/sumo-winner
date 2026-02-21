import { useState, useEffect, useMemo } from 'react'
import { fetchLatest, fetchTorikumi } from './lib/api'
import { generatePredictionText } from './lib/format'
import { usePredictions } from './hooks/usePredictions'
import BashoSelector from './components/BashoSelector'
import MatchList from './components/MatchList'
import { PredictionPreview } from './components/PredictionPreview'
import type { TorikumiData } from './types'
import './App.css'

function App() {
  const [data, setData] = useState<TorikumiData | null>(null)
  const [day, setDay] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bashoId = data?.basho.id ?? ''
  const division = data?.division ?? 'makuuchi'
  const { predictions, setPrediction } = usePredictions(bashoId, day, division)

  useEffect(() => {
    fetchLatest().then(d => {
      setData(d)
      setDay(d.day)
      setLoading(false)
    }).catch(e => {
      setError(e.message)
      setLoading(false)
    })
  }, [])

  const handleDayChange = async (newDay: number) => {
    if (!data) return
    setDay(newDay)
    try {
      const newData = await fetchTorikumi(data.basho.id, newDay)
      setData(newData)
    } catch {
      // データが無い日はそのまま
    }
  }

  const predictionText = useMemo(() => {
    if (!data) return ''
    return generatePredictionText(day, data.matches, predictions)
  }, [day, data, predictions])

  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(predictionText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // フォールバック
      const textarea = document.createElement('textarea')
      textarea.value = predictionText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return <div className="app"><p>読み込み中...</p></div>
  if (error) return <div className="app"><p>エラー: {error}</p></div>
  if (!data) return null

  return (
    <div className="app">
      <header className="app-header">
        <h1>大相撲 取組予想メモ</h1>
        <p className="updated-at">データ更新: {new Date(data.updatedAt).toLocaleString('ja-JP')}</p>
      </header>
      <BashoSelector basho={data.basho} day={day} onDayChange={handleDayChange} />
      <MatchList
        matches={data.matches}
        predictions={predictions}
        onPredict={(index, value) => setPrediction(index, value)}
      />
      <PredictionPreview text={predictionText} />
      <div className="copy-section">
        <button className="copy-button" onClick={handleCopy}>
          {copied ? 'コピーしました！' : 'テキストをコピー'}
        </button>
      </div>
    </div>
  )
}

export default App
