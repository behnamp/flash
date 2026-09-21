'use client'
import { useEffect } from 'react'

function inIframe() {
  try { return window.self !== window.top } catch { return true }
}

// The visual-editing library is only needed inside the Sanity Studio iframe.
// Loading it dynamically keeps it out of every customer's page bundle.
export function SanityVisualEditing() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return
    if (!inIframe()) return
    let disable: (() => void) | undefined
    import('@sanity/visual-editing').then(({ enableVisualEditing }) => {
      disable = enableVisualEditing({ zIndex: 999 })
    })
    return () => disable?.()
  }, [])
  return null
}
