import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Caveat, Fraunces, Instrument_Sans } from 'next/font/google'
import Script from 'next/script'

import { CookieConsent } from '@/components/CookieConsent'
import { MetaPageViews } from '@/components/MetaPixelEvents'
import { Motion } from '@/components/Motion'
import { consentDefaultScript } from '@/lib/consent'
import { getSettings } from '@/lib/payload-content'
import { absoluteUrl, LANG, LOCALE, siteUrl } from '@/lib/site'

import '@/styles/tokens.css'
import '@/styles/site.css'

// Fonturile sunt servite de pe domeniul propriu (next/font le descarcă la build),
// nu de pe fonts.googleapis.com: o cerere externă mai puțin, fără CLS și fără
// third-party în lanțul critic.
// Fonturi variabile: fără `weight`, ca să păstrăm întreaga gamă de grosimi și
// axele personalizate (SOFT, WONK, opsz) pe care se sprijină tipografia machetei.
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  axes: ['SOFT', 'WONK', 'opsz'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-fraunces',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

const caveat = Caveat({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-caveat',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F0E4' },
    { media: '(prefers-color-scheme: dark)', color: '#1B1836' },
  ],
  colorScheme: 'light',
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  const ogImage = {
    url: settings.ogImageUrl ?? '/og-image.png',
    width: 1200,
    height: 630,
    alt: `${settings.siteName} — ${settings.tagline}`,
    type: 'image/png',
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.metaTitle,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.metaDescription,
    keywords: settings.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean),
    applicationName: settings.siteName,
    authors: [{ name: 'Adina', url: settings.instagramUrl }],
    creator: 'Adina',
    publisher: settings.siteName,
    category: 'lifestyle',
    alternates: {
      canonical: '/',
      languages: { [LANG]: '/' },
    },
    openGraph: {
      type: 'website',
      locale: LOCALE,
      url: siteUrl,
      siteName: settings.siteName,
      title: settings.metaTitle,
      description: settings.metaDescription,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.metaTitle,
      description: settings.metaDescription,
      images: [ogImage.url],
    },
    robots: settings.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.webmanifest',
    other: {
      // Pointer către rezumatul în text simplu pentru asistenții AI.
      'llms-txt': absoluteUrl('/llms.txt'),
    },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
  }
}

// Fără JavaScript nimic nu mai adaugă `.is-in`, deci anulăm ascunderea
// elementelor care ar fi trebuit să apară la scroll. Plicul se deschide oricum,
// animația lui fiind pur CSS.
const NOSCRIPT_CSS = `.pl-js .pl-reveal:not(.is-in),.pl-js .pl-items .pl-item{opacity:1!important;transform:none!important}`

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={LANG}
      // `.pl-js` vine de pe server, nu dintr-un script care ar modifica <html>
      // înainte de hidratare — altfel React ar găsi alt className decât a trimis.
      className={`pl-js ${fraunces.variable} ${instrumentSans.variable} ${caveat.variable}`}
    >
      <body>
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        {/* Consent Mode v2: totul refuzat implicit, înaintea oricărui tag Google. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {consentDefaultScript}
        </Script>
        {children}
        <Motion />
        <CookieConsent />
        <MetaPageViews />
        <Analytics />
      </body>
    </html>
  )
}
