/**
 * Linkurile de plată pentru Poșta Secretă. Același flux ca la Poșta Lunii:
 * Stripe Payment Links (buy.stripe.com/…), doar că URL-urile vin din variabile
 * de mediu, nu din admin, ca să poată fi completate fără a atinge codul.
 *
 * Fiecare link primește `client_reference_id=<planKey>`, pe care Stripe îl
 * păstrează pe Checkout Session — așa comenzile de Poșta Secretă se disting de
 * cele de Poșta Lunii în dashboard, în export și în webhook-uri.
 */

export type PostaSecretaPlanKey = 'posta-secreta-o-luna' | 'posta-secreta-lunar' | 'posta-secreta-integral'

export type PostaSecretaCheckoutUrls = Record<PostaSecretaPlanKey, string | null>

// Accesul trebuie să fie static (process.env.NUME), altfel Next nu le poate citi la build.
const RAW: Record<PostaSecretaPlanKey, string | undefined> = {
  'posta-secreta-o-luna': process.env.STRIPE_LINK_POSTA_SECRETA_O_LUNA,
  'posta-secreta-lunar': process.env.STRIPE_LINK_POSTA_SECRETA_LUNAR,
  'posta-secreta-integral': process.env.STRIPE_LINK_POSTA_SECRETA_INTEGRAL,
}

function withReference(raw: string | undefined, planKey: PostaSecretaPlanKey): string | null {
  if (!raw || !/^https:\/\//.test(raw.trim())) return null
  try {
    const url = new URL(raw.trim())
    url.searchParams.set('client_reference_id', planKey)
    return url.toString()
  } catch {
    return null
  }
}

export function getPostaSecretaCheckoutUrls(): PostaSecretaCheckoutUrls {
  return {
    'posta-secreta-o-luna': withReference(RAW['posta-secreta-o-luna'], 'posta-secreta-o-luna'),
    'posta-secreta-lunar': withReference(RAW['posta-secreta-lunar'], 'posta-secreta-lunar'),
    'posta-secreta-integral': withReference(RAW['posta-secreta-integral'], 'posta-secreta-integral'),
  }
}
