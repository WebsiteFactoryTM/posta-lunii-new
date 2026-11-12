'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

import { PRODUCT_LINES, VARIANTS, type ProductLine } from '@/lib/checkout'
import { onMetaPixelReady, trackMeta } from '@/lib/meta-pixel'
import { POSTA_SECRETA_PLANS } from '@/lib/posta-secreta-plans'

/**
 * PageView la fiecare navigare client-side din Next.js. Primul PageView (la
 * încărcarea site-ului sau la acordarea consimțământului) îl trimite
 * `enableMetaPixel`, așa că aici sărim peste prima randare.
 */
function RouteChangePageViews() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const last = useRef<string | null>(null)

  useEffect(() => {
    const key = `${pathname}?${search}`
    if (last.current === null || last.current === key) {
      last.current = key
      return
    }
    last.current = key
    trackMeta('PageView')
  }, [pathname, search])

  return null
}

export function MetaPageViews() {
  return (
    <Suspense fallback={null}>
      <RouteChangePageViews />
    </Suspense>
  )
}

/** Ce produse arată secțiunea de prețuri a fiecărei linii. */
const PRICING_CONTENT: Record<ProductLine, string[]> = {
  'posta-lunii': Object.keys(VARIANTS),
  'posta-secreta': Object.keys(POSTA_SECRETA_PLANS),
}

/** ViewContent o singură dată, când secțiunea cu prețuri ajunge în ecran. */
export function PricingViewContent({ sectionId, line }: { sectionId: string; line: ProductLine }) {
  useEffect(() => {
    const section = document.getElementById(sectionId)
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        const sent = trackMeta('ViewContent', {
          content_name: `Abonamente ${PRODUCT_LINES[line]}`,
          content_category: line,
          content_type: 'product',
          content_ids: PRICING_CONTENT[line],
          currency: 'RON',
        })
        // Fără acord pentru marketing nu se trimite nimic; observăm mai departe,
        // ca evenimentul să plece dacă acordul vine cât timp prețurile sunt pe ecran.
        if (sent) observer.disconnect()
      },
      { threshold: 0.25 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [sectionId, line])

  return null
}

type PurchaseProps = {
  eventId: string
  value: number
  currency: string
  contentName: string
  contentCategory: ProductLine
  contentId: string
}

const sentKey = (eventId: string) => `pl_meta_${eventId}`

function alreadySent(eventId: string) {
  try {
    if (localStorage.getItem(sentKey(eventId))) return true
  } catch {}
  return document.cookie.split('; ').some((cookie) => cookie.startsWith(`${sentKey(eventId)}=`))
}

function markSent(eventId: string) {
  try {
    localStorage.setItem(sentKey(eventId), String(Date.now()))
  } catch {}
  // Și cookie, pentru browserele care blochează localStorage.
  document.cookie = `${sentKey(eventId)}=1; Max-Age=${60 * 60 * 24 * 30}; Path=/multumim; SameSite=Lax`
}

/**
 * Purchase pe pagina de confirmare, cu același event_id ca evenimentul trimis
 * de webhook prin Conversions API (deduplicare). Se trimite o singură dată per
 * browser: la refresh nu mai pleacă.
 */
export function MetaPurchase({ eventId, value, currency, contentName, contentCategory, contentId }: PurchaseProps) {
  useEffect(() => {
    return onMetaPixelReady(() => {
      if (alreadySent(eventId)) return
      const sent = trackMeta(
        'Purchase',
        {
          value,
          currency,
          content_name: contentName,
          content_category: contentCategory,
          content_type: 'product',
          content_ids: [contentId],
          num_items: 1,
        },
        eventId,
      )
      if (sent) markSent(eventId)
    })
  }, [eventId, value, currency, contentName, contentCategory, contentId])

  return null
}
