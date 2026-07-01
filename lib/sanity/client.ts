import { createClient } from '@sanity/client'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_VERSION = '2024-01-01'

export function getSanityClient(stega = false) {
  if (!PROJECT_ID) return null
  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: !stega,
    stega: stega
      ? { enabled: true, studioUrl: '/studio' }
      : { enabled: false },
  })
}

export async function sanityFetch<T>(query: string): Promise<T | null> {
  const client = getSanityClient()
  if (!client) return null
  try {
    return await client.fetch<T>(query)
  } catch {
    return null
  }
}
