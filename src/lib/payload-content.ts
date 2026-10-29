import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import {
  defaultLanding,
  defaultNavigation,
  defaultSettings,
  type LandingContent,
  type NavigationContent,
  type SettingsContent,
} from './content'

type Plain = Record<string, unknown>

const isPlainObject = (v: unknown): v is Plain =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Suprapune datele din Payload peste valorile implicite, ignorând tot ce e gol.
 * Așa pagina nu se „golește” dacă un câmp a fost șters din greșeală și arată
 * corect și înainte de primul `pnpm seed`.
 */
function mergeDefaults<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base
  if (!isPlainObject(base)) return base
  const out: Plain = { ...(base as Plain) }

  for (const [key, value] of Object.entries(override)) {
    if (value === undefined || value === null || value === '') continue
    const baseValue = (base as Plain)[key]

    if (Array.isArray(value)) {
      if (value.length === 0) continue
      out[key] = value
      continue
    }
    if (isPlainObject(value) && isPlainObject(baseValue)) {
      out[key] = mergeDefaults(baseValue, value)
      continue
    }
    out[key] = value
  }

  return out as T
}

let warnedNoDatabase = false

async function readGlobal(slug: 'landing' | 'navigation' | 'settings'): Promise<unknown> {
  // Fără DATABASE_URL, driverul pg încearcă implicit localhost:5432 și eșuează
  // zgomotos (plus o promisiune respinsă rămasă în cache-ul Payload). Sărim direct.
  if (!process.env.DATABASE_URL) {
    if (!warnedNoDatabase) {
      warnedNoDatabase = true
      console.warn('[posta-lunii] DATABASE_URL lipsește, folosesc textele implicite.')
    }
    return null
  }
  try {
    const payload = await getPayload({ config })
    return await payload.findGlobal({ slug, depth: 1, overrideAccess: true })
  } catch (error) {
    // Pagina trebuie să se randeze chiar dacă baza de date lipsește (de ex. la
    // un build curat, înainte de seed). Nu e o eroare fatală.
    console.warn(`[posta-lunii] nu am putut citi globalul "${slug}", folosesc valorile implicite.`, error)
    return null
  }
}

export const getLanding = cache(async (): Promise<LandingContent> => {
  const doc = await readGlobal('landing')
  const merged = mergeDefaults(defaultLanding, doc)
  // `enabled` este boolean: `false` e o valoare validă pe care merge-ul o sare.
  if (isPlainObject(doc)) {
    const faq = (doc as Plain).faq
    if (isPlainObject(faq) && typeof faq.enabled === 'boolean') {
      merged.faq = { ...merged.faq, enabled: faq.enabled }
    }
  }
  return merged
})

export const getNavigation = cache(async (): Promise<NavigationContent> => {
  return mergeDefaults(defaultNavigation, await readGlobal('navigation'))
})

export type ResolvedSettings = SettingsContent & {
  noindex: boolean
  ogImageUrl?: string
}

export const getSettings = cache(async (): Promise<ResolvedSettings> => {
  const doc = await readGlobal('settings')
  const merged = mergeDefaults(defaultSettings, doc) as ResolvedSettings
  merged.noindex = Boolean(isPlainObject(doc) && doc.noindex)

  const ogImage = isPlainObject(doc) ? doc.ogImage : null
  if (isPlainObject(ogImage) && typeof ogImage.url === 'string') {
    merged.ogImageUrl = ogImage.url
  }

  return merged
})
