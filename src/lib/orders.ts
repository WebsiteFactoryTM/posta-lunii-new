import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ADMIN_EMAIL, orderAdminEmail, orderCustomerEmail, type OrderEmailData } from './email'
import { COMPANY } from './legal'
import { absoluteUrl } from './site'
import type { CheckoutSession, PurchaseInfo } from './stripe'

type Address = NonNullable<NonNullable<CheckoutSession['customer_details']>['address']>

function formatAddress(name: string | null | undefined, address: Address | null | undefined) {
  if (!address) return null
  const cityLine = [address.postal_code, address.city].filter(Boolean).join(' ')
  const lines = [name, address.line1, address.line2, cityLine, address.state, address.country === 'RO' ? 'România' : address.country]
  return lines.filter(Boolean).join('\n') || null
}

/**
 * Înregistrează comanda (o singură dată per sesiune Stripe) și trimite emailurile
 * către client și administrator. Stripe poate trimite același eveniment de mai
 * multe ori; a doua oară comanda există deja și nu se mai trimite nimic.
 */
export async function recordOrder(session: CheckoutSession, info: PurchaseInfo) {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'orders',
    where: { stripeSessionId: { equals: session.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs.length) return { created: false as const, id: existing.docs[0].id }

  const customer = session.customer_details ?? {}
  const shipping = session.collected_information?.shipping_details ?? session.shipping_details ?? null
  const now = new Date()
  const reference = `PL-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex').toUpperCase()}`

  const order: OrderEmailData = {
    reference,
    variant: info.variant,
    variantName: info.contentName,
    amount: info.value,
    currency: info.currency,
    name: customer.name || shipping?.name,
    email: customer.email,
    phone: customer.phone,
    shippingAddress: formatAddress(shipping?.name ?? customer.name, shipping?.address ?? customer.address),
    createdAt: now,
    stripeSessionId: session.id,
    livemode: session.livemode,
  }

  const doc = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      reference,
      status: 'new',
      variant: order.variant,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      email: order.email,
      phone: order.phone,
      shippingAddress: order.shippingAddress,
      stripeSessionId: session.id,
      stripeCustomerId: session.customer ?? undefined,
      stripeSubscriptionId: session.subscription ?? undefined,
      livemode: session.livemode,
    },
  })

  let customerEmailSent = false
  let adminEmailSent = false

  // Fără Resend, Payload doar scrie emailurile în consolă: nu le marcăm ca trimise.
  if (!process.env.RESEND_API_KEY) {
    payload.logger.warn(`[posta-lunii] comanda ${reference} salvată; RESEND_API_KEY lipsește, emailurile nu au plecat.`)
    return { created: true as const, id: doc.id, customerEmailSent, adminEmailSent }
  }

  if (order.email) {
    try {
      await payload.sendEmail({ to: order.email, replyTo: COMPANY.email, ...orderCustomerEmail(order) })
      customerEmailSent = true
    } catch (error) {
      payload.logger.error({ err: error }, `[posta-lunii] emailul de confirmare pentru ${reference} nu a plecat`)
    }
  }
  try {
    const adminUrl = absoluteUrl(`/admin/collections/orders/${doc.id}`)
    await payload.sendEmail({ to: ADMIN_EMAIL, replyTo: order.email ?? undefined, ...orderAdminEmail(order, adminUrl) })
    adminEmailSent = true
  } catch (error) {
    payload.logger.error({ err: error }, `[posta-lunii] notificarea de comandă ${reference} nu a plecat`)
  }

  if (customerEmailSent || adminEmailSent) {
    await payload.update({
      collection: 'orders',
      id: doc.id,
      overrideAccess: true,
      data: { customerEmailSent, adminEmailSent },
    })
  }

  return { created: true as const, id: doc.id, customerEmailSent, adminEmailSent }
}
