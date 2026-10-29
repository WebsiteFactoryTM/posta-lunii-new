/**
 * Planurile Poștei Secrete, legate de variantele comune ale comenzilor
 * (`lunar` / `anual-recurent` / `anual-integral`, vezi checkout.ts), ca o comandă
 * Poșta Secretă să treacă prin același webhook, aceleași comenzi din admin și
 * același Meta Pixel ca Poșta Lunii — doar cu `linie: posta-secreta`.
 *
 * Modul pur (fără `window`, fără Node): folosit în browser și pe server.
 */

import type { VariantKey } from './checkout'

export type PostaSecretaPlanKey = 'posta-secreta-o-luna' | 'posta-secreta-lunar' | 'posta-secreta-integral'

type PlanInfo = {
  planKey: PostaSecretaPlanKey
  variant: VariantKey
  /** Numele din emailuri și de pe pagina de confirmare. */
  name: string
  price: number
}

export const POSTA_SECRETA_PLANS: Record<PostaSecretaPlanKey, PlanInfo> = {
  'posta-secreta-o-luna': { planKey: 'posta-secreta-o-luna', variant: 'lunar', name: 'O lună (un singur plic)', price: 60 },
  'posta-secreta-lunar': {
    planKey: 'posta-secreta-lunar',
    variant: 'anual-recurent',
    name: 'Abonament lunar, cu plată lunară',
    price: 55,
  },
  'posta-secreta-integral': {
    planKey: 'posta-secreta-integral',
    variant: 'anual-integral',
    name: 'Abonament lunar, cu plată integrală (12 luni)',
    price: 660,
  },
}

export function postaSecretaPlanByVariant(variant: VariantKey | null | undefined): PlanInfo | null {
  return Object.values(POSTA_SECRETA_PLANS).find((plan) => plan.variant === variant) ?? null
}
