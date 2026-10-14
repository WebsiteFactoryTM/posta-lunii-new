import type { MetadataRoute } from 'next'
import { getSettings } from '@/lib/payload-content'
import { absoluteUrl, siteUrl } from '@/lib/site'

// Crawlerele asistenților AI sunt lăsate să intre în mod explicit: de ele depinde
// dacă Poșta Lunii apare în răspunsurile ChatGPT, Claude, Perplexity sau AI
// Overviews. Le arătăm și llms.txt.
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
  'meta-externalagent',
  'cohere-ai',
  'DuckAssistBot',
  'MistralAI-User',
]

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings()

  if (settings.noindex) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/media/', '/multumim', '/webhooks/'],
      },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ['/', '/llms.txt', '/llms.xml'],
        disallow: ['/admin', '/admin/', '/api/'],
      })),
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  }
}
