import type { TorikumiData, TorikumiIndex, QuizIndex, QuizBashoData } from '../types'
import { validateTorikumiData, validateTorikumiIndex, validateQuizIndex, validateQuizBashoData } from './validate'

const BASE_URL = import.meta.env.BASE_URL

export async function fetchIndex(): Promise<TorikumiIndex> {
  const res = await fetch(`${BASE_URL}data/torikumi/index.json`)
  if (!res.ok) throw new Error(`Failed to fetch index: ${res.status}`)
  const data = await res.json()
  return validateTorikumiIndex(data)
}

export async function fetchLatest(): Promise<TorikumiData> {
  const res = await fetch(`${BASE_URL}data/torikumi/latest.json`)
  if (!res.ok) throw new Error(`Failed to fetch latest: ${res.status}`)
  const data = await res.json()
  return validateTorikumiData(data)
}

export async function fetchTorikumi(bashoId: string, day: number): Promise<TorikumiData> {
  const res = await fetch(`${BASE_URL}data/torikumi/${bashoId}/${day}.json`)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  const data = await res.json()
  return validateTorikumiData(data)
}

export async function fetchQuizIndex(): Promise<QuizIndex> {
  const res = await fetch(`${BASE_URL}data/quiz/index.json`)
  if (!res.ok) throw new Error(`Failed to fetch quiz index: ${res.status}`)
  const data = await res.json()
  return validateQuizIndex(data)
}

export async function fetchQuizData(bashoId: string): Promise<QuizBashoData> {
  const res = await fetch(`${BASE_URL}data/quiz/${bashoId}.json`)
  if (!res.ok) throw new Error(`Failed to fetch quiz data: ${res.status}`)
  const data = await res.json()
  return validateQuizBashoData(data)
}
