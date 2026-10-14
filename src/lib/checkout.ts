/**
 * Varianta de abonament aleasă și referința care o duce până în Stripe.
 *
 * Linkurile de plată Stripe acceptă `?client_reference_id=…` (max. 200 de
 * caractere: litere, cifre, `-` și `_`). Îl folosim ca să transmitem, fără bază
 * de date, ce variantă a ales vizitatorul, dacă a acceptat cookie-urile de
 * marketing și identificatorii Meta (`_fbp`, `_fbc`), pe care webhook-ul Stripe
 * îi trimite apoi prin Conversions API.
 *
 * Modul e pur (fără `window`, fără Node), ca să fie folosit și în browser, și pe server.
 */

import type { Plan } from './content'

export const VARIANTS = {
  lunar: 'lunar',
  'anual-recurent': 'anual recurent',
  'anual-integral': 'anual integral',
} as const

export type VariantKey = keyof typeof VARIANTS

export type CheckoutVariant = { key: VariantKey; name: (typeof VARIANTS)[VariantKey]; value?: number }

const isVariant = (value: string): value is VariantKey => value in VARIANTS

/** Primul număr dintr-un text de preț: „660 lei o singură dată” → 660. */
function firstNumber(text?: string | null) {
  const match = text?.replace(/\s/g, '').match(/\d+(?:[.,]\d+)?/)
  return match ? Number(match[0].replace(',', '.')) : undefined
}

/**
 * Varianta unui card de preț, dedusă din conținutul din CMS: un plan fără
 * selector e plicul lunar; în selector, „Integral” e plata o singură dată, iar
 * cealaltă e plata recurentă.
 */
export function checkoutVariant(plan: Plan, option?: { label: string; detail?: string | null }): CheckoutVariant {
  if (!option) return { key: 'lunar', name: VARIANTS.lunar, value: firstNumber(plan.price) }
  const key: VariantKey = /integral/i.test(`${option.label} ${option.detail ?? ''}`) ? 'anual-integral' : 'anual-recurent'
  return { key, name: VARIANTS[key], value: firstNumber(option.detail) ?? firstNumber(plan.price) }
}

/** Ce reținem despre vizitator la click pe butonul de comandă. */
export type CheckoutRef = {
  variant: VariantKey
  /** A acceptat cookie-urile de marketing (Meta Pixel)? */
  marketing: boolean
  fbp?: string
  fbc?: string
}

const PREFIX = 'pl1'
const MAX_LENGTH = 200

// `_fbp` = fb.{subdomeniu}.{timestamp}.{aleator}, `_fbc` = fb.{subdomeniu}.{timestamp}.{fbclid}.
// Punctul nu e permis în client_reference_id, așa că păstrăm doar părțile de după „fb.”, legate cu „-”.
const FBP_RE = /^fb\.(\d+)\.(\d+)\.(\d+)$/
const FBC_RE = /^fb\.(\d+)\.(\d+)\.([A-Za-z0-9_-]+)$/

export function encodeCheckoutRef(ref: CheckoutRef): string {
  const base = `${PREFIX}_${ref.variant}_${ref.marketing ? 1 : 0}`
  if (!ref.marketing) return base

  const fbp = ref.fbp?.match(FBP_RE)
  const withFbp = `${base}_${fbp ? fbp.slice(1).join('-') : 'x'}`
  const fbc = ref.fbc?.match(FBC_RE)
  const full = fbc ? `${withFbp}_${fbc.slice(1).join('-')}` : withFbp
  // Un fbclid foarte lung nu încape: renunțăm la el, nu îl trunchiem (ar deveni invalid).
  return full.length <= MAX_LENGTH ? full : withFbp
}

export function decodeCheckoutRef(raw?: string | null): CheckoutRef | null {
  if (!raw) return null
  // fbclid poate conține „_”, de aceea tot ce urmează după fbp e fbc.
  const [prefix, variant, marketing, fbpPart, ...fbcParts] = raw.split('_')
  if (prefix !== PREFIX || !variant || !isVariant(variant)) return null

  const ref: CheckoutRef = { variant, marketing: marketing === '1' }
  if (!ref.marketing) return ref

  const fbp = fbpPart?.match(/^(\d+)-(\d+)-(\d+)$/)
  if (fbp) ref.fbp = `fb.${fbp[1]}.${fbp[2]}.${fbp[3]}`

  const fbc = fbcParts.join('_').match(/^(\d+)-(\d+)-([A-Za-z0-9_-]+)$/)
  if (fbc) ref.fbc = `fb.${fbc[1]}.${fbc[2]}.${fbc[3]}`

  return ref
}

/** Varianta unei plăți fără referință (ex. link Stripe deschis direct), după suma încasată. */
export function variantFromAmount(amount: number): VariantKey | null {
  if (amount >= 600) return 'anual-integral'
  if (amount === 55) return 'anual-recurent'
  if (amount === 60) return 'lunar'
  return null
}
