import type { MetadataRoute } from 'next'

// SEO + AEO + GEO: allow traditional search crawlers AND AI answer-engine
// crawlers to read the marketing site, while keeping private/app routes out.
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/host/', '/admin/', '/api/', '/auth/', '/payment/', '/planners/dashboard']
  return {
    rules: [
      // Search engines
      { userAgent: '*', allow: '/', disallow },
      // AI answer engines — explicitly welcomed so Flash can be cited in
      // ChatGPT, Perplexity, Gemini, and Claude answers (GEO).
      { userAgent: 'GPTBot', allow: '/', disallow },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow },
      { userAgent: 'ChatGPT-User', allow: '/', disallow },
      { userAgent: 'PerplexityBot', allow: '/', disallow },
      { userAgent: 'Perplexity-User', allow: '/', disallow },
      { userAgent: 'Google-Extended', allow: '/', disallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow },
      { userAgent: 'Claude-Web', allow: '/', disallow },
      { userAgent: 'Applebot-Extended', allow: '/', disallow },
      { userAgent: 'CCBot', allow: '/', disallow },
    ],
    sitemap: 'https://flashcam.app/sitemap.xml',
    host: 'https://flashcam.app',
  }
}
