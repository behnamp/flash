import type { Metadata, Viewport } from 'next'
// Self-hosted fonts: served from our own domain, no render-blocking
// request to Google before the first screen can draw.
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import './globals.css'
import { SanityVisualEditing } from './components/SanityVisualEditing'

export const metadata: Metadata = {
  title: 'Flash — Disposable Camera for Events',
  description: 'Give everyone a camera. 29 film modes. Reveal it all together. Flash turns any event into a shared disposable camera experience.',
  keywords: ['disposable camera', 'event photos', 'wedding camera', 'party photos', 'film filters'],
  metadataBase: new URL('https://flashcam.app'),
  alternates: { canonical: 'https://flashcam.app' },
  openGraph: {
    title: 'Flash — Disposable Camera for Events',
    description: 'Give everyone a camera. 29 film modes. Reveal it all together.',
    url: 'https://flashcam.app',
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
      { url: '/favicon-16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96.png?v=2', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico?v=2', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' }],
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

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://flashcam.app/#org',
      name: 'Flash',
      url: 'https://flashcam.app',
      logo: 'https://flashcam.app/icon-512.png',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://flashcam.app/#app',
      name: 'Flash — Disposable Camera for Events',
      applicationCategory: 'PhotographyApplication',
      operatingSystem: 'Web, iOS, Android',
      description:
        'Flash turns any event into a shared disposable camera. Guests scan a QR code to join with no app, shoot on a limited roll of film-look photos, and the gallery is revealed together.',
      url: 'https://flashcam.app',
      publisher: { '@id': 'https://flashcam.app/#org' },
      offers: [
        { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'CAD', description: 'Up to 5 guests' },
        { '@type': 'Offer', name: 'Starter', price: '1.99', priceCurrency: 'CAD', description: 'Up to 10 guests' },
        { '@type': 'Offer', name: 'Small', price: '4.99', priceCurrency: 'CAD', description: 'Up to 25 guests' },
        { '@type': 'Offer', name: 'Medium', price: '9.99', priceCurrency: 'CAD', description: 'Up to 50 guests' },
        { '@type': 'Offer', name: 'Large', price: '14.99', priceCurrency: 'CAD', description: 'Up to 100 guests' },
        { '@type': 'Offer', name: 'XL', price: '29.99', priceCurrency: 'CAD', description: 'Up to 200 guests' },
        { '@type': 'Offer', name: 'Unlimited', price: '99.99', priceCurrency: 'CAD', description: 'No guest cap' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://flashcam.app/#faq',
      mainEntity: [
        { q: 'Do guests need to download anything?', a: 'No. Guests scan a QR code and the camera opens in their browser. No account, no app, no friction.' },
        { q: 'How does the reveal work?', a: 'You choose: instant (photos show as taken), end of event (you tap Reveal), morning after (9am next day), or milestone (when everyone uses all their shots).' },
        { q: 'What happens to photos after 14 days?', a: 'Photos are permanently deleted after 14 days. Upgrade to Keep Forever ($4.99 CAD) to store them indefinitely with unlimited downloads.' },
        { q: 'What film modes are available?', a: 'Five: Kodak Gold, Black & White (Ilford), Portra 400, Polaroid, and Golden Hour. Each is baked into the photo before upload.' },
        { q: "What's the difference between plans?", a: 'Plans are per-event based on guest count: Starter (10 guests, $1.99) up to Unlimited ($99.99). You pay once per event, no subscriptions.' },
        { q: 'Can I embed the gallery on my website?', a: 'Yes. The download page gives you an embed code — paste it anywhere and the live gallery appears in an iframe.' },
      ].map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Native app: skip the marketing landing entirely — redirect to /login before the page paints */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=window.Capacitor;if(c&&typeof c.isNativePlatform==='function'&&c.isNativePlatform()){var p=window.location.pathname;if(p==='/'||p===''){document.documentElement.style.background='#0a0a0a';window.location.replace('/login');return;}
// Native app: hide the splash only once the page has actually painted, so
// there is no black gap between splash and first screen.
var hide=function(){try{var s=c.Plugins&&c.Plugins.SplashScreen;if(s&&s.hide){s.hide({fadeOutDuration:200});}}catch(e){}};
if(document.readyState!=='loading'){setTimeout(hide,120);}else{document.addEventListener('DOMContentLoaded',function(){setTimeout(hide,120);});}
setTimeout(hide,2500);}}catch(e){}})();`,
          }}
        />
        {/* Structured data — helps Google rich results and lets AI answer engines cite Flash accurately (SEO/AEO/GEO) */}
        <link rel="preconnect" href="https://onvdddlkrlwaxwufgodq.supabase.co" crossOrigin="" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
      </head>
      <body>
        {children}
        <SanityVisualEditing />
      </body>
    </html>
  )
}
