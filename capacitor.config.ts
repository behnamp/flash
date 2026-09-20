import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.flashcam.flash',
  appName: 'Flash',
  webDir: 'out',
  server: {
    // Use live URL so the app always has latest features without app updates
    url: 'https://flashcam.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0a0a0a',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    // Stop the rubber-band bounce so the app feels like a native screen,
    // not a web page floating inside one.
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
      launchShowDuration: 3000,
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
