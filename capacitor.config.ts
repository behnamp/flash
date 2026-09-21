import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.flashcam.flash',
  appName: 'Flash',
  webDir: 'out',
  // Lets the server recognize the native app and skip the marketing page.
  appendUserAgent: 'FlashApp',
  server: {
    // Use live URL so the app always has latest features without app updates
    url: 'https://flashcam.app',
    cleartext: false,
  },
  ios: {
    // 'never': pages already pad for the notch/home bar via env(safe-area-inset-*).
    // 'always' added the insets twice, making every page taller than the screen.
    contentInset: 'never',
    backgroundColor: '#0a0a0a',
    preferredContentMode: 'mobile',
    // NOTE: limitsNavigationsToAppBoundDomains is deliberately OFF.
    // With it on, WKWebView restricts the app to WKAppBoundDomains only,
    // which breaks auth/API/Stripe calls ("Load failed" on login).
    scrollEnabled: true,
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      // Don't auto-hide on a timer — the app loads flashcam.app over the
      // network, so a fixed duration leaves a black gap. The web app hides
      // the splash itself once it has rendered (see app/layout.tsx).
      launchShowDuration: 2500,
      launchAutoHide: false,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffb800',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a0a0a',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
}

export default config
