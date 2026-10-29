import { createHmac, timingSafeEqual } from 'crypto'

import {
  decodeCheckoutRef,
  isProductLine,
  PRODUCT_LINES,
  VARIANTS,
  variantFromAmount,
  type CheckoutRef,
  type ProductLine,
  type VariantKey,
} from './checkout'
import { postaSecretaPlanByVariant } from './posta-secreta-plans'

/**
 * Acces minim la Stripe, direct prin API-ul REST (fără SDK): citirea unei
 * sesiuni de checkout și verificarea semnăturii webhook-urilor.
 */

type Address = {
  line1?: string | null
  line2?: string | null
  state?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string | null
} | null

export type CheckoutSession = {
  id: string
  object: 'checkout.session'
  created: number
  mode: 'payment' | 'subscription' | 'setup'
  status: 'open' | 'complete' | 'expired' | null
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  amount_total: number | null
  currency: string | null
  client_reference_id: string | null
  livemode: boolean
  customer?: string | null
  subscription?: string | null
  customer_details?: {
    email?: string | null
    name?: string | null
    phone?: string | null
    address?: Address
  } | null
  collected_information?: { shipping_details?: { name?: string | null; address?: Address } | null } | null
  shipping_details?: { name?: string | null; address?: Address } | null
  metadata?: Record<string, string> | null
  /** Doar cu `expand[]=line_items.data.price.product` (vezi `resolveProductLine`). */
  line_items?: {
    data: Array<{
      price?: {
        metadata?: Record<string, string> | null
        product?: string | { metadata?: Record<string, string> | null } | null
      } | null
    }>
  } | null
}

const SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]+$/

export async function retrieveCheckoutSession(
  sessionId: string,
  { withProducts = false }: { withProducts?: boolean } = {},
): Promise<CheckoutSession | null> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || !SESSION_ID_RE.test(sessionId)) return null
  const query = withProducts ? '?expand[]=line_items.data.price.product' : ''
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}${query}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store',
  })
  if (!response.ok) {
    console.error(`[posta-lunii] Stripe: sesiunea ${sessionId} nu a putut fi citită (${response.status})`)
    return null
  }
  return (await response.json()) as CheckoutSession
}

/** Verifică antetul `Stripe-Signature` (schema v1, HMAC-SHA256) și întoarce evenimentul. */
export function verifyStripeEvent(body: string, signature: string | null, secret: string, toleranceSeconds = 300) {
  if (!signature) return null
  const parts = signature.split(',').map((part) => part.split('=') as [string, string])
  const timestamp = Number(parts.find(([key]) => key === 't')?.[1])
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value)
  if (!timestamp || !signatures.length) return null
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return null

  const expected = Buffer.from(createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex'))
  const valid = signatures.some((candidate) => {
    const buffer = Buffer.from(candidate)
    return buffer.length === expected.length && timingSafeEqual(buffer, expected)
  })
  if (!valid) return null

  return JSON.parse(body) as { id: string; type: string; livemode: boolean; data: { object: unknown } }
}

/** Ce raportăm la Meta pentru o comandă: aceleași valori în browser și pe server. */
export type PurchaseInfo = {
  eventId: string
  /** Suma încasată acum (prima plată), în unitatea monedei (lei, nu bani). */
  value: number
  currency: string
  variant: VariantKey | null
  /** Poșta Lunii sau Poșta Secretă. */
  line: ProductLine
  contentName: string
  /** `content_ids` la Meta: varianta pentru Poșta Lunii, cheia planului pentru Poșta Secretă. */
  contentId: string
  ref: CheckoutRef | null
}

export const isPaid = (session: CheckoutSession) => session.status === 'complete' && session.payment_status === 'paid'

export const createdWithin = (session: CheckoutSession, seconds: number) => Date.now() / 1000 - session.created < seconds

/** Metadata `linie` de pe sesiune, pe preț sau pe produsul Stripe. */
function lineFromMetadata(session: CheckoutSession): ProductLine | null {
  const candidates = [
    session.metadata?.linie,
    ...(session.line_items?.data ?? []).flatMap((item) => [
      item.price?.metadata?.linie,
      typeof item.price?.product === 'object' ? item.price.product?.metadata?.linie : undefined,
    ]),
  ]
  return candidates.find(isProductLine) ?? null
}

/**
 * Linia de produs a unei comenzi. Sursa principală e metadata Stripe
 * `linie: posta-secreta` (pe produs sau preț), citită cu produsele expandate;
 * dacă lipsește sau Stripe nu răspunde, contează referința pusă de butonul de pe
 * site (`ps1_…` / `pl1_…`). Fără niciuna: Poșta Lunii, ca până acum.
 */
export async function resolveProductLine(session: CheckoutSession): Promise<ProductLine> {
  let line = lineFromMetadata(session)
  if (!line && !session.line_items) {
    const expanded = await retrieveCheckoutSession(session.id, { withProducts: true }).catch(() => null)
    if (expanded) line = lineFromMetadata(expanded)
  }
  return line ?? decodeCheckoutRef(session.client_reference_id)?.line ?? 'posta-lunii'
}

export function purchaseInfo(session: CheckoutSession, line?: ProductLine): PurchaseInfo {
  const value = (session.amount_total ?? 0) / 100
  const ref = decodeCheckoutRef(session.client_reference_id)
  const variant = ref?.variant ?? variantFromAmount(value)
  const productLine = line ?? ref?.line ?? 'posta-lunii'
  const secretPlan = productLine === 'posta-secreta' ? postaSecretaPlanByVariant(variant) : null
  return {
    // Legat de comandă: aceeași sesiune Stripe → același event_id → Meta deduplică.
    eventId: session.id,
    value,
    currency: (session.currency ?? 'ron').toUpperCase(),
    variant,
    line: productLine,
    contentName:
      productLine === 'posta-secreta'
        ? `${PRODUCT_LINES['posta-secreta']} – ${secretPlan?.name ?? 'abonament'}`
        : variant
          ? VARIANTS[variant]
          : 'abonament',
    contentId: secretPlan?.planKey ?? variant ?? 'abonament',
    ref,
  }
}
