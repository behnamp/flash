const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_VERSION = '2024-01-01'

export async function sanityFetch<T>(query: string): Promise<T | null> {
  if (!PROJECT_ID) return null
  try {
    const encoded = encodeURIComponent(query)
    const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encoded}`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    return json.result ?? null
  } catch {
    return null
  }
}
