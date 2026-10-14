/**
 * Meta Pixel în browser. Scriptul fbevents.js se încarcă DOAR după acordul
 * pentru cookie-urile de marketing (vezi `CookieConsent`); până atunci toate
 * funcțiile de aici nu fac nimic.
 */

import { META_PIXEL_ID } from './legal'

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  push: Fbq
  loaded: boolean
  version: string
  disablePushState?: boolean
}

type MetaWindow = Window & { fbq?: Fbq; _fbq?: Fbq }

/** Anunță componentele care așteaptă pixelul (ex. Purchase pe pagina de confirmare). */
const READY_EVENT = 'pl:meta-ready'

let loaded = false
let enabled = false

export function enableMetaPixel() {
  const w = window as MetaWindow
  enabled = true
  if (loaded) {
    w.fbq?.('consent', 'grant')
    return
  }
  loaded = true

  // Codul oficial Meta, rescris fără `arguments`.
  if (!w.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue.push(args)
    } as Fbq
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    // Next.js schimbă pagina prin history.pushState; fără asta pixelul ar trimite
    // singur încă un PageView, peste cel trimis de noi la schimbarea rutei.
    fbq.disablePushState = true
    w.fbq = fbq
    if (!w._fbq) w._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  w.fbq('consent', 'grant')
  // Fără colectare automată (butoane, microdate/JSON-LD din pagină): trimitem doar
  // evenimentele noastre. Altfel pixelul atașează datele structurate ale paginii
  // și trimite evenimentele printr-un POST într-un iframe ascuns, greu de verificat.
  w.fbq('set', 'autoConfig', false, META_PIXEL_ID)
  w.fbq('init', META_PIXEL_ID)
  // PageView pentru pagina pe care s-a dat acordul (sau pe care s-a încărcat site-ul).
  w.fbq('track', 'PageView')
  window.dispatchEvent(new Event(READY_EVENT))
}

export function disableMetaPixel() {
  const w = window as MetaWindow
  enabled = false
  w.fbq?.('consent', 'revoke')

  // Șterge cookie-urile Meta puse anterior, pe toate variantele de domeniu.
  const host = location.hostname
  const parts = host.split('.')
  const domains = ['', host, `.${host}`]
  for (let i = 1; i < parts.length - 1; i++) domains.push(`.${parts.slice(i).join('.')}`)
  for (const name of ['_fbp', '_fbc']) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`
    }
  }
}

export const isMetaPixelEnabled = () => enabled

export function trackMeta(event: string, params?: Record<string, unknown>, eventId?: string) {
  const w = window as MetaWindow
  if (!enabled || !w.fbq) return false
  w.fbq('track', event, params ?? {}, eventId ? { eventID: eventId } : undefined)
  return true
}

/** Rulează `callback` imediat dacă pixelul e activ, altfel când devine activ. Întoarce funcția de anulare. */
export function onMetaPixelReady(callback: () => void) {
  if (enabled) {
    callback()
    return () => {}
  }
  const handler = () => callback()
  window.addEventListener(READY_EVENT, handler, { once: true })
  return () => window.removeEventListener(READY_EVENT, handler)
}

const readCookie = (name: string) =>
  document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1]

/** `_fbp` și `_fbc`, puse de pixel (doar cu acord). Dacă `_fbc` încă nu există dar URL-ul are fbclid, îl construim. */
export function readMetaIds(): { fbp?: string; fbc?: string } {
  const fbp = readCookie('_fbp')
  let fbc = readCookie('_fbc')
  if (!fbc) {
    const fbclid = new URLSearchParams(location.search).get('fbclid')
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`
  }
  return { fbp: fbp ? decodeURIComponent(fbp) : undefined, fbc: fbc ? decodeURIComponent(fbc) : undefined }
}
