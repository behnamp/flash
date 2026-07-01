'use client'
import { useState, useEffect } from 'react'
import { getSanityClient } from './client'

function inPresentationIframe() {
  if (typeof window === 'undefined') return false
  try { return window.self !== window.top } catch { return true }
}

export function useSanityContent(type: 'landingPage' | 'plannersPage') {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const stega = inPresentationIframe()
    const client = getSanityClient(stega)
    if (!client) return
    client
      .fetch(`*[_type == "${type}"][0]`)
      .then((d: any) => { if (d) setData(d) })
      .catch(() => {})
  }, [type])

  return data
}
