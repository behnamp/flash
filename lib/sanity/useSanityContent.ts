'use client'
import { useState, useEffect } from 'react'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_VERSION = '2024-01-01'

async function fetchFromSanity(type: string) {
  if (!PROJECT_ID) return null
  try {
    const query = encodeURIComponent(`*[_type == "${type}"][0]`)
    const res = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${query}`
    )
    if (!res.ok) return null
    const json = await res.json()
    return json.result ?? null
  } catch {
    return null
  }
}

export function useSanityContent(type: 'landingPage' | 'plannersPage') {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    fetchFromSanity(type).then(d => { if (d) setData(d) })
  }, [type])
  return data
}
