'use client'
import { useEffect } from 'react'
import { enableVisualEditing } from '@sanity/visual-editing'

function inIframe() {
  try { return window.self !== window.top } catch { return true }
}

export function SanityVisualEditing() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return
    if (!inIframe()) return
    const disable = enableVisualEditing({ zIndex: 999 })
    return () => disable()
  }, [])
  return null
}
