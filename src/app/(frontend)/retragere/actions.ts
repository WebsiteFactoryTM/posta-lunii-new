'use server'

import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ADMIN_EMAIL, formatDateTime, withdrawalAdminEmail, withdrawalCustomerEmail } from '@/lib/email'
import { COMPANY } from '@/lib/legal'
import { absoluteUrl } from '@/lib/site'

export type WithdrawalState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fields?: Partial<Record<FieldName, string>> }
  | { status: 'done'; reference: string; submittedAt: string; emailSent: boolean; email: string }

type FieldName = 'name' | 'email' | 'product' | 'contract'

const PRODUCTS = {
  single: 'Un plic (o lună)',
  monthly: 'Abonament 12 luni – plată lunară',
  annual: 'Abonament 12 luni – plată integrală',
} as const

type Product = keyof typeof PRODUCTS

const text = (value: FormDataEntryValue | null, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

/**
 * Înregistrează declarația de retragere, trimite confirmarea pe email
 * (prin Resend, dacă e configurat) și întoarce numărul de înregistrare.
 */
export async function submitWithdrawal(_prev: WithdrawalState, formData: FormData): Promise<WithdrawalState> {
  // Câmp-capcană pentru roboți: oamenii nu îl văd și nu îl completează.
  if (text(formData.get('website'), 200)) return { status: 'idle' }

  const name = text(formData.get('name'), 200)
  const email = text(formData.get('email'), 200)
  const product = text(formData.get('product'), 20) as Product
  const contract = text(formData.get('contract'), 2000)
  const address = text(formData.get('address'), 1000)
  const message = text(formData.get('message'), 2000)

  const fields: Partial<Record<FieldName, string>> = {}
  if (!name) fields.name = 'Scrie numele tău.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'Scrie o adresă de email validă.'
  if (!(product in PRODUCTS)) fields.product = 'Alege produsul.'
  if (!contract) fields.contract = 'Spune-ne cum identificăm comanda (ex. data și emailul folosit la plată).'
  if (Object.keys(fields).length) {
    return { status: 'error', message: 'Verifică, te rog, câmpurile marcate.', fields }
  }

  const now = new Date()
  const reference = `RET-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex').toUpperCase()}`

  try {
    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'withdrawals',
      overrideAccess: true,
      data: { reference, name, email, product, contract, address, message, status: 'new' },
    })

    const when = formatDateTime(now)
    const emailData = {
      reference,
      submittedAt: when,
      name,
      email,
      productLabel: PRODUCTS[product],
      contract,
      address: address || undefined,
      message: message || undefined,
    }

    let emailSent = false
    if (process.env.RESEND_API_KEY) {
      try {
        await payload.sendEmail({ to: email, replyTo: COMPANY.email, ...withdrawalCustomerEmail(emailData) })
        emailSent = true
        await payload.update({
          collection: 'withdrawals',
          id: doc.id,
          overrideAccess: true,
          data: { acknowledgementSent: true },
        })
      } catch (error) {
        payload.logger.error({ err: error }, `[posta-lunii] confirmarea retragerii ${reference} nu a putut fi trimisă`)
      }
      try {
        const adminUrl = absoluteUrl(`/admin/collections/withdrawals/${doc.id}`)
        await payload.sendEmail({ to: ADMIN_EMAIL, replyTo: email, ...withdrawalAdminEmail(emailData, adminUrl) })
      } catch (error) {
        payload.logger.error({ err: error }, `[posta-lunii] notificarea pentru retragerea ${reference} nu a plecat`)
      }
    } else {
      payload.logger.warn(`[posta-lunii] retragere ${reference} înregistrată; RESEND_API_KEY lipsește — emailurile nu au plecat.`)
    }

    return { status: 'done', reference, submittedAt: when, emailSent, email }
  } catch (error) {
    console.error('[posta-lunii] retragerea nu a putut fi înregistrată', error)
    return {
      status: 'error',
      message: `Nu am putut înregistra cererea. Te rugăm să încerci din nou sau să ne scrii la ${COMPANY.email} — declarația trimisă pe email este la fel de valabilă.`,
    }
  }
}
