import { sendPurchaseToMeta } from '@/lib/meta-capi'
import { recordOrder } from '@/lib/orders'
import { isPaid, purchaseInfo, resolveProductLine, verifyStripeEvent, type CheckoutSession } from '@/lib/stripe'

/**
 * Webhook Stripe: comanda nouă în admin + emailuri (client și administrator) +
 * Purchase la Meta prin Conversions API.
 *
 * Ascultăm DOAR evenimentele de checkout: o sesiune de checkout înseamnă o
 * comandă nouă, deci prima plată. Reînnoirile lunare ale abonamentelor vin ca
 * `invoice.paid` / `invoice.payment_succeeded` și sunt ignorate intenționat —
 * nu creează comenzi și nu sunt raportate ca Purchase.
 *
 * În Stripe: Developers → Webhooks → endpoint https://www.postalunii.ro/webhooks/stripe,
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
  // Plățile cu confirmare întârziată ajung „complete” dar „unpaid”; comanda se
  // înregistrează la `checkout.session.async_payment_succeeded`, când banii sunt încasați.
  if (!isPaid(session)) return json({ received: true, skipped: 'not paid yet' })

  // Poșta Lunii sau Poșta Secretă: după metadata `linie` din Stripe, apoi după referința de pe site.
  const info = purchaseInfo(session, await resolveProductLine(session))

  // 1. Comanda + emailurile. Dacă baza de date nu răspunde, 500 → Stripe reîncearcă;
  //    o comandă deja înregistrată nu se dublează și nu retrimite emailurile.
  let order: Awaited<ReturnType<typeof recordOrder>>
  try {
    order = await recordOrder(session, info)
  } catch (error) {
    console.error(`[posta-lunii] comanda pentru ${session.id} nu a putut fi înregistrată`, error)
    return json({ error: 'order failed' }, 500)
  }

  // 2. Meta Conversions API — doar dacă clientul a acceptat cookie-urile de marketing
  //    pe site (informația vine din client_reference_id, pus la click pe „Comandă”).
  if (!info.ref?.marketing) {
    return json({ received: true, order: order.created ? 'created' : 'exists', meta: 'skipped: no marketing consent' })
  }

  try {
    const result = await sendPurchaseToMeta(session, info)
    if (!result.sent) console.warn(`[posta-lunii] Purchase ${info.eventId} netrimis la Meta: ${result.reason}`)
    return json({ received: true, order: order.created ? 'created' : 'exists', meta: result.sent })
  } catch (error) {
    // 500 → Stripe reîncearcă; Meta deduplică după event_id, iar comanda nu se dublează.
    console.error(`[posta-lunii] Purchase ${info.eventId}: eroare Meta CAPI`, error)
    return json({ error: 'meta capi failed' }, 500)
  }
}
