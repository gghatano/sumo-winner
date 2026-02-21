import type { TorikumiData } from '../types'
import { validateTorikumiData } from './validate'

const BASE_URL = import.meta.env.BASE_URL

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
