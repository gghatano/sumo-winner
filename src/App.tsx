import { useState, useEffect, useMemo } from 'react'
import { fetchIndex, fetchTorikumi } from './lib/api'
import { generatePredictionText } from './lib/format'
import { usePredictions } from './hooks/usePredictions'
import BashoSelector from './components/BashoSelector'
import MatchList from './components/MatchList'
import { PredictionPreview } from './components/PredictionPreview'
import type { TorikumiData, BashoInfo } from './types'
import './App.css'

function App() {
  const [bashoList, setBashoList] = useState<BashoInfo[]>([])
  const [data, setData] = useState<TorikumiData | null>(null)
  const [selectedBashoId, setSelectedBashoId] = useState<string>('')
  const [day, setDay] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const division = data?.division ?? 'makuuchi'
  const { predictions, setPrediction } = usePredictions(selectedBashoId, day, division)

  useEffect(() => {
    fetchIndex()
      .then(async (index) => {
        setBashoList(index.bashoList)
        const { bashoId, day: latestDay } = index.latest
        setSelectedBashoId(bashoId)
        setDay(latestDay)
        const torikumi = await fetchTorikumi(bashoId, latestDay)
        setData(torikumi)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const handleBashoChange = async (newBashoId: string) => {
    setSelectedBashoId(newBashoId)
    setDay(1)
    try {
      const newData = await fetchTorikumi(newBashoId, 1)
      setData(newData)
    } catch {
      // データが無い場合はそのまま
    }
  }

  const handleDayChange = async (newDay: number) => {
    if (!selectedBashoId || !data) return
    setFetching(true)
    try {
      const newData = await fetchTorikumi(selectedBashoId, newDay)
      setData(newData)
      setDay(newDay)
    } catch (e) {
      console.warn('Failed to fetch torikumi:', e)
      // dayを変更しない = ロールバック
    } finally {
      setFetching(false)
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
      <BashoSelector
        bashoList={bashoList}
        selectedBashoId={selectedBashoId}
        day={day}
        onBashoChange={handleBashoChange}
        onDayChange={handleDayChange}
        disabled={fetching}
      />
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
