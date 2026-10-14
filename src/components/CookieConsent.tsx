'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'

import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS, CONSENT_VERSION, GA_MEASUREMENT_ID } from '@/lib/legal'
import { disableMetaPixel, enableMetaPixel } from '@/lib/meta-pixel'

/**
 * Bannerul de consimțământ pentru cookie-uri + încărcarea Google Analytics 4 și
 * a Meta Pixel.
 *
 * - Google Consent Mode v2 pornește cu totul pe „denied” (scriptul inline din
 *   layout, `consentDefaultScript`), înainte de orice tag Google.
 * - gtag.js se încarcă DOAR după ce vizitatorul acceptă statisticile — până
 *   atunci nu pleacă nicio cerere către Google (consent mode „basic”).
 * - „Refuz” are aceeași greutate vizuală ca „Accept”, alegerea se poate schimba
 *   oricând din footer („Setări cookie”), iar retragerea acordului șterge
 *   cookie-urile _ga.
 * - Meta Pixel (fbevents.js) se încarcă DOAR după acordul pentru marketing;
 *   retragerea acordului oprește pixelul și șterge cookie-urile _fbp / _fbc.
 */

const OPEN_EVENT = 'pl:open-consent'
const CHANGE_EVENT = 'pl:consent-change'

type Consent = { v: number; analytics: boolean; marketing: boolean; ts: string }

type GtagWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
} & Record<string, unknown>

const readRawConsent = () =>
  document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))?.[1] ?? ''

function parseConsent(raw: string): Consent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>
    if (parsed.v !== CONSENT_VERSION || typeof parsed.analytics !== 'boolean' || typeof parsed.marketing !== 'boolean') {
      return null
    }
    return { v: parsed.v, analytics: parsed.analytics, marketing: parsed.marketing, ts: String(parsed.ts ?? '') }
  } catch {
    return null
  }
}

const readConsent = () => parseConsent(readRawConsent())

/** A acceptat vizitatorul cookie-urile de marketing (Meta Pixel)? */
export const hasMarketingConsent = () => readConsent()?.marketing === true

// Cookie-ul de consimțământ ca „store” extern: pe server nu există (null), în
// browser se recitește la fiecare schimbare anunțată prin CHANGE_EVENT.
const subscribeConsent = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}
const getServerRawConsent = () => null

function writeConsent(analytics: boolean, marketing: boolean): Consent {
  const consent: Consent = { v: CONSENT_VERSION, analytics, marketing, ts: new Date().toISOString() }
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${
    CONSENT_MAX_AGE_DAYS * 24 * 60 * 60
  }; Path=/; SameSite=Lax${secure}`
  return consent
}

function gtag(...args: unknown[]) {
  const w = window as unknown as GtagWindow
  w.dataLayer = w.dataLayer || []
  if (typeof w.gtag === 'function') w.gtag(...args)
  // eslint-disable-next-line prefer-rest-params -- gtag cere obiectul `arguments`
  else w.dataLayer.push(arguments)
}

let gaLoaded = false

function enableAnalytics() {
  const w = window as unknown as GtagWindow
  w[`ga-disable-${GA_MEASUREMENT_ID}`] = false
  gtag('consent', 'update', { analytics_storage: 'granted' })
  if (gaLoaded) return
  gaLoaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
  document.head.appendChild(script)
  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID)
}

function disableAnalytics() {
  const w = window as unknown as GtagWindow
  w[`ga-disable-${GA_MEASUREMENT_ID}`] = true
  gtag('consent', 'update', { analytics_storage: 'denied' })

  // Șterge cookie-urile GA puse anterior, pe toate variantele de domeniu.
  const host = location.hostname
  const parts = host.split('.')
  const domains = ['', host, `.${host}`]
  for (let i = 1; i < parts.length - 1; i++) domains.push(`.${parts.slice(i).join('.')}`)
  for (const cookie of document.cookie.split('; ')) {
    const name = cookie.split('=')[0]
    if (!/^_ga(_|$)/.test(name)) continue
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`
    }
  }
}

export function CookieConsent() {
  const raw = useSyncExternalStore(subscribeConsent, readRawConsent, getServerRawConsent)
  const consent = raw === null ? null : parseConsent(raw)
  const [reopened, setReopened] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  // Pe server și la prima randare nu știm alegerea, deci nu arătăm nimic.
  const open = reopened || (raw !== null && consent === null)

  useEffect(() => {
    if (consent?.analytics) enableAnalytics()
  }, [consent?.analytics])

  useEffect(() => {
    if (consent?.marketing) enableMetaPixel()
  }, [consent?.marketing])

  useEffect(() => {
    const reopen = () => {
      const current = readConsent()
      setAnalytics(current?.analytics ?? false)
      setMarketing(current?.marketing ?? false)
      setShowPrefs(true)
      setReopened(true)
      requestAnimationFrame(() => panelRef.current?.focus())
    }
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  const save = useCallback((allowAnalytics: boolean, allowMarketing: boolean) => {
    const previous = readConsent()
    writeConsent(allowAnalytics, allowMarketing)
    setAnalytics(allowAnalytics)
    setMarketing(allowMarketing)
    if (allowAnalytics) enableAnalytics()
    else if (previous?.analytics || gaLoaded) disableAnalytics()
    else gtag('consent', 'update', { analytics_storage: 'denied' })
    if (allowMarketing) enableMetaPixel()
    else disableMetaPixel()
    setReopened(false)
    setShowPrefs(false)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="pl-cc"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <p id={titleId} className="pl-cc__title">
        Cookie-uri, pe scurt
      </p>
      <p className="pl-cc__text">
        Folosim cookie-uri strict necesare ca site-ul să funcționeze. Cu acordul tău, folosim și Google Analytics, ca
        să vedem câți oameni ne vizitează și ce îi interesează, și Meta Pixel, ca să măsurăm reclamele de pe Facebook și
        Instagram. Poți schimba alegerea oricând din „Setări cookie”,
        în josul paginii. Detalii în <Link href="/politica-cookies">Politica de cookie-uri</Link>.
      </p>

      {showPrefs ? (
        <fieldset className="pl-cc__prefs">
          <legend className="pl-sr">Categorii de cookie-uri</legend>
          <label className="pl-cc__pref">
            <input type="checkbox" checked disabled />
            <span>
              <b>Strict necesare</b>
              <span>Rețin alegerea ta despre cookie-uri. Mereu active.</span>
            </span>
          </label>
          <label className="pl-cc__pref">
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
            <span>
              <b>Statistici (Google Analytics 4)</b>
              <span>Măsurarea anonimizată a vizitelor. Opționale, active doar cu acordul tău.</span>
            </span>
          </label>
          <label className="pl-cc__pref">
            <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
            <span>
              <b>Marketing (Meta Pixel)</b>
              <span>
                Măsurarea și îmbunătățirea reclamelor noastre de pe Facebook și Instagram. Opționale, active doar cu acordul
                tău.
              </span>
            </span>
          </label>
        </fieldset>
      ) : null}

      <div className="pl-cc__actions">
        <button type="button" className="pl-cc__btn" onClick={() => save(false, false)}>
          Refuz
        </button>
        <button type="button" className="pl-cc__btn" onClick={() => save(true, true)}>
          Accept toate
        </button>
        {showPrefs ? (
          <button type="button" className="pl-cc__link" onClick={() => save(analytics, marketing)}>
            Salvez alegerea
          </button>
        ) : (
          <button type="button" className="pl-cc__link" onClick={() => setShowPrefs(true)}>
            Personalizez
          </button>
        )}
      </div>
    </div>
  )
}

/** Link din footer care redeschide preferințele de cookie. */
export function CookieSettingsButton() {
  return (
    <button type="button" className="pl-footer__cookie" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Setări cookie
    </button>
  )
}
