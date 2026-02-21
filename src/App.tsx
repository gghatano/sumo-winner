import { useEffect, useState } from 'react'
import './App.css'
import BashoSelector from './components/BashoSelector'
import MatchList from './components/MatchList'
import { fetchLatest, fetchTorikumi } from './lib/api'
import type { Prediction, TorikumiData } from './types'

function App() {
  const [data, setData] = useState<TorikumiData | null>(null)
  const [day, setDay] = useState<number>(1)
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLatest()
      .then((d) => {
        setData(d)
        setDay(d.day)
        setLoading(false)
      })
      .catch((e: Error) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const handleDayChange = async (newDay: number) => {
    if (!data) return
    setDay(newDay)
    setPredictions({})
    try {
      const newData = await fetchTorikumi(data.basho.id, newDay)
      setData(newData)
    } catch {
      // サンプルデータが無い日はlatest.jsonの内容を維持
    }
  }

  const handlePredict = (index: number, value: Prediction) => {
    setPredictions((prev) => ({ ...prev, [index]: value }))
  }

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>大相撲 取組予想メモ</h1>
        </header>
        <main>
          <p className="status-message">取組データを読み込み中...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>大相撲 取組予想メモ</h1>
        </header>
        <main>
          <p className="status-message error">エラー: {error}</p>
        </main>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="app">
      <header className="app-header">
        <h1>大相撲 取組予想メモ</h1>
        <p className="updated-at">
          更新: {new Date(data.updatedAt).toLocaleString('ja-JP')}
        </p>
      </header>
      <main>
        <BashoSelector basho={data.basho} day={day} onDayChange={handleDayChange} />
        <MatchList
          matches={data.matches}
          predictions={predictions}
          onPredict={handlePredict}
        />
      </main>
    </div>
  )
}

export default App
