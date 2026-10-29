/**
 * Linkurile de plată pentru Poșta Secretă. Același flux ca la Poșta Lunii:
 * Stripe Payment Links (buy.stripe.com/…), doar că URL-urile vin din variabile
 * de mediu, nu din admin, ca să poată fi completate fără a atinge codul.
 *
 * Referința (`client_reference_id = ps1_…`) se adaugă în browser, la click, ca la
 * Poșta Lunii (vezi PlanCheckout): include acordul de marketing și ID-urile Meta.
 */

import type { PostaSecretaPlanKey } from './posta-secreta-plans'

export type PostaSecretaCheckoutUrls = Record<PostaSecretaPlanKey, string | null>

// Accesul trebuie să fie static (process.env.NUME), altfel Next nu le poate citi la build.
const RAW: Record<PostaSecretaPlanKey, string | undefined> = {
  'posta-secreta-o-luna': process.env.STRIPE_LINK_POSTA_SECRETA_O_LUNA,
  'posta-secreta-lunar': process.env.STRIPE_LINK_POSTA_SECRETA_LUNAR,
  'posta-secreta-integral': process.env.STRIPE_LINK_POSTA_SECRETA_INTEGRAL,
}

const isStripeLink = (url: string) => /^https:\/\/buy\.stripe\.com\//.test(url)

const clean = (raw: string | undefined) => {
  const url = raw?.trim()
  return url && isStripeLink(url) ? url : null
}

export function getPostaSecretaCheckoutUrls(): PostaSecretaCheckoutUrls {
  return {
    'posta-secreta-o-luna': clean(RAW['posta-secreta-o-luna']),
    'posta-secreta-lunar': clean(RAW['posta-secreta-lunar']),
    'posta-secreta-integral': clean(RAW['posta-secreta-integral']),
  }
}
