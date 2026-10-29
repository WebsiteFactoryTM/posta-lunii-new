import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LEGAL_LINKS } from '@/lib/legal'
import { siteUrl } from '@/lib/site'

/** Ultima modificare reală a conținutului, ca sitemap-ul să nu mintă. */
async function lastContentUpdate(): Promise<Date> {
  if (!process.env.DATABASE_URL) return new Date()
  try {
    const payload = await getPayload({ config })
    const landing = await payload.findGlobal({ slug: 'landing', depth: 0, overrideAccess: true })
    const updatedAt = (landing as { updatedAt?: string } | null)?.updatedAt
    if (updatedAt) return new Date(updatedAt)
  } catch {
    // baza de date poate lipsi la un build curat — cădem pe data build-ului
  }
  return new Date()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await lastContentUpdate()

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/posta-secreta`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...LEGAL_LINKS.map((link) => ({
      url: `${siteUrl}${link.href}`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]
}
