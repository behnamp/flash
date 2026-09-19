import type { MetadataRoute } from 'next'

const BASE = 'https://flashcam.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, freq: 'weekly' },
    { path: '/pricing', priority: 0.9, freq: 'monthly' },
    { path: '/planners', priority: 0.8, freq: 'monthly' },
    { path: '/join', priority: 0.6, freq: 'monthly' },
    { path: '/scan', priority: 0.5, freq: 'monthly' },
    { path: '/legal/privacy', priority: 0.3, freq: 'yearly' },
    { path: '/legal/terms', priority: 0.3, freq: 'yearly' },
  ]
  return routes.map(r => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }))
}
