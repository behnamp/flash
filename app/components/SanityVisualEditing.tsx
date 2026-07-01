'use client'
import { VisualEditing } from '@sanity/visual-editing'

export function SanityVisualEditing() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return null
  return <VisualEditing zIndex={999} />
}
