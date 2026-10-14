import { sendPurchaseToMeta } from '@/lib/meta-capi'
import { isPaid, purchaseInfo, verifyStripeEvent, type CheckoutSession } from '@/lib/stripe'

/**
 * Webhook Stripe → Meta Conversions API (Purchase).
 *
 * Ascultăm DOAR evenimentele de checkout: o sesiune de checkout înseamnă o
 * comandă nouă, deci prima plată. Reînnoirile lunare ale abonamentelor vin ca
 * `invoice.paid` / `invoice.payment_succeeded` și sunt ignorate intenționat —
 * nu sunt raportate ca Purchase.
 *
 * În Stripe: Developers → Webhooks → endpoint https://postalunii.ro/webhooks/stripe,
 * cu evenimentele `checkout.session.completed` și `checkout.session.async_payment_succeeded`.
 */

const PURCHASE_EVENTS = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded'])

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status })

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[posta-lunii] STRIPE_WEBHOOK_SECRET lipsește — webhook-ul Stripe nu poate fi verificat.')
    return json({ error: 'not configured' }, 500)
  }

  const body = await request.text()
  const event = verifyStripeEvent(body, request.headers.get('stripe-signature'), secret)
  if (!event) return json({ error: 'invalid signature' }, 400)

  if (!PURCHASE_EVENTS.has(event.type)) return json({ received: true, ignored: event.type })

  const session = event.data.object as CheckoutSession
  // Plățile cu confirmare întârziată ajung „complete” dar „unpaid”; Purchase pleacă
  // la `checkout.session.async_payment_succeeded`, când banii sunt încasați.
  if (!isPaid(session)) return json({ received: true, skipped: 'not paid yet' })

  const info = purchaseInfo(session)

  // Datele clientului ajung la Meta doar dacă a acceptat cookie-urile de marketing
  // pe site (informația vine din client_reference_id, pus la click pe „Comandă”).
  if (!info.ref?.marketing) {
    console.info(`[posta-lunii] Purchase ${info.eventId} netrimis la Meta: fără acord de marketing.`)
    return json({ received: true, skipped: 'no marketing consent' })
  }

  try {
    const result = await sendPurchaseToMeta(session, info)
    if (!result.sent) console.warn(`[posta-lunii] Purchase ${info.eventId} netrimis la Meta: ${result.reason}`)
    else console.info(`[posta-lunii] Purchase ${info.eventId} trimis la Meta (${info.value} ${info.currency}, ${info.contentName}).`)
    return json({ received: true, meta: result.sent })
  } catch (error) {
    // 500 → Stripe reîncearcă; Meta deduplică după event_id, deci nu se dublează.
    console.error(`[posta-lunii] Purchase ${info.eventId}: eroare Meta CAPI`, error)
    return json({ error: 'meta capi failed' }, 500)
  }
}
