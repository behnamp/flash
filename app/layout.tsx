import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flash — Disposable Camera for Events',
  description: 'Give everyone a camera. 29 film modes. Reveal it all together. Flash turns any event into a shared disposable camera experience.',
  keywords: ['disposable camera', 'event photos', 'wedding camera', 'party photos', 'film filters'],
  metadataBase: new URL('https://flash-roan.vercel.app'),
  openGraph: {
    title: 'Flash — Disposable Camera for Events',
    description: 'Give everyone a camera. 29 film modes. Reveal it all together.',
    url: 'https://flash-roan.vercel.app',
    siteName: 'Flash',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Flash' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flash — Disposable Camera for Events',
    description: 'Give everyone a camera. 29 film modes. Reveal it all together.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Flash',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
