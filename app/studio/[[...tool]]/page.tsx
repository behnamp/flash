'use client'
import dynamic from 'next/dynamic'
import config from '../../../sanity.config'

const Studio = dynamic(
  () => import('sanity').then(m => m.Studio),
  { ssr: false }
)

export default function StudioPage() {
  return (
    <div style={{ height: '100dvh' }}>
      <Studio config={config} />
    </div>
  )
}
