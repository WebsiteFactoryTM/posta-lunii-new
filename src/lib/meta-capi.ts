import { createHash } from 'crypto'

import { META_PIXEL_ID } from './legal'
import { absoluteUrl } from './site'
import type { CheckoutSession, PurchaseInfo } from './stripe'

/**
 * Meta Conversions API: evenimentul Purchase trimis de pe server, cu același
 * event_id ca cel din browser, ca Meta să le deduplice.
 * https://developers.facebook.com/docs/marketing-api/conversions-api
 */

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || 'v24.0'

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

/** Litere mici, fără diacritice (ș → s), doar a–z. */
const latin = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const hashed = (value: string | undefined | null) => (value ? [sha256(value)] : undefined)

/** Telefon în format internațional, doar cifre: „0722 123 456” → 40722123456. */
function normalizePhone(raw?: string | null) {
  if (!raw) return undefined
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === 10 && digits.startsWith('0')) digits = `40${digits.slice(1)}`
  else if (digits.length === 9 && digits.startsWith('7')) digits = `40${digits}`
  return digits.length >= 8 ? digits : undefined
}

function splitName(raw?: string | null) {
  const parts = latin(raw ?? '')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return {}
  // „Maria Adina Popescu” → prenume „maria”, nume „popescu”.
  return { fn: parts[0], ln: parts.length > 1 ? parts[parts.length - 1] : undefined }
}

function userData(session: CheckoutSession, info: PurchaseInfo, client?: { ip?: string; userAgent?: string }) {
  const customer = session.customer_details ?? {}
  const shipping = session.collected_information?.shipping_details ?? session.shipping_details ?? null
  const address = customer.address?.city ? customer.address : (shipping?.address ?? customer.address)
  const { fn, ln } = splitName(customer.name || shipping?.name)

  const email = customer.email?.trim().toLowerCase()
  const city = address?.city ? latin(address.city).replace(/[^a-z]/g, '') : undefined
  const zip = address?.postal_code ? address.postal_code.replace(/\s/g, '').toLowerCase() : undefined

  return {
    em: hashed(email),
    ph: hashed(normalizePhone(customer.phone)),
    fn: hashed(fn),
    ln: hashed(ln),
    ct: hashed(city),
    zp: hashed(zip),
    country: hashed('ro'),
    fbp: info.ref?.fbp,
    fbc: info.ref?.fbc,
    client_ip_address: client?.ip,
    client_user_agent: client?.userAgent,
  }
}

export type CapiResult = { sent: true; response: unknown } | { sent: false; reason: string }

export async function sendPurchaseToMeta(
  session: CheckoutSession,
  info: PurchaseInfo,
  client?: { ip?: string; userAgent?: string },
): Promise<CapiResult> {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!token) return { sent: false, reason: 'META_CAPI_ACCESS_TOKEN lipsește' }

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: info.eventId,
        action_source: 'website',
        event_source_url: absoluteUrl('/multumim'),
        user_data: userData(session, info, client),
        custom_data: {
          value: info.value,
          currency: info.currency,
          content_name: info.contentName,
          content_type: 'product',
          content_ids: info.variant ? [info.variant] : undefined,
          num_items: 1,
          order_id: session.id,
        },
      },
    ],
  }
  const testCode = process.env.META_TEST_EVENT_CODE
  if (testCode) body.test_event_code = testCode

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  )
  const json = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`Meta CAPI ${response.status}: ${JSON.stringify(json)}`)
  }
  return { sent: true, response: json }
}
