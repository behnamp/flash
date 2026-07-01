'use client'
import dynamic from 'next/dynamic'
import config from '../../../sanity.config'

const NextStudio = dynamic(
  () => import('next-sanity/studio').then(m => m.NextStudio),
  { ssr: false }
)

export default function StudioPage() {
  return (
    <div style={{ height: '100dvh' }}>
      <NextStudio config={config} />
    </div>
  )
}
