import type { TorikumiData, TorikumiIndex } from '../types'

const BASE_URL = import.meta.env.BASE_URL

export async function fetchIndex(): Promise<TorikumiIndex> {
  const res = await fetch(`${BASE_URL}data/torikumi/index.json`)
  if (!res.ok) throw new Error(`Failed to fetch index: ${res.status}`)
  return res.json()
}

export async function fetchLatest(): Promise<TorikumiData> {
  const res = await fetch(`${BASE_URL}data/torikumi/latest.json`)
  if (!res.ok) throw new Error(`Failed to fetch latest: ${res.status}`)
  return res.json()
}

export async function fetchTorikumi(bashoId: string, day: number): Promise<TorikumiData> {
  const res = await fetch(`${BASE_URL}data/torikumi/${bashoId}/${day}.json`)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  return res.json()
}
