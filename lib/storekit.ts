// StoreKit bridge — detects native iOS and uses Apple IAP
// Falls back to Stripe on web

export interface StoreProduct {
  id: string
  displayName: string
  displayPrice: string
  price: string
}

export async function isNativeIOS(): Promise<boolean> {
  try {
    // @ts-ignore
    if (typeof window === 'undefined') return false
    // @ts-ignore
    const { StoreKit } = await import('@capacitor/core').catch(() => ({ StoreKit: null }))
    if (!StoreKit) return false
    // @ts-ignore
    const result = await (window as any).Capacitor?.Plugins?.StoreKit?.isNative?.()
    return result?.native === true && result?.platform === 'ios'
  } catch {
    return false
  }
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  try {
    // @ts-ignore
    const result = await (window as any).Capacitor?.Plugins?.StoreKit?.getProducts?.()
    return result?.products || []
  } catch {
    return []
  }
}

export async function purchaseWithStoreKit(productId: string, eventId: string): Promise<{
  success: boolean
  eventId?: string
  tier?: string
  error?: string
}> {
  try {
    // @ts-ignore
    const result = await (window as any).Capacitor?.Plugins?.StoreKit?.purchase?.({
      productId,
      eventId,
    })
    return { success: true, eventId: result.eventId, tier: result.tier }
  } catch (e: any) {
    return { success: false, error: e.message || 'Purchase failed' }
  }
}

// Map our tier IDs to StoreKit product IDs
export const TIER_TO_PRODUCT_ID: Record<string, string> = {
  mini:      'app.flashcam.flash.starter',
  standard:  'app.flashcam.flash.small',
  medium:    'app.flashcam.flash.medium',
  large:     'app.flashcam.flash.large',
  xl:        'app.flashcam.flash.xl',
  unlimited: 'app.flashcam.flash.unlimited',
  keep_forever: 'app.flashcam.flash.keep_forever',
}
