import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { MetaPurchase } from '@/components/MetaPixelEvents'
import { COMPANY } from '@/lib/legal'
import { createdWithin, isPaid, purchaseInfo, retrieveCheckoutSession } from '@/lib/stripe'

export const metadata: Metadata = {
  title: 'Mulțumim pentru comandă',
  robots: { index: false, follow: false },
}

/** Purchase din browser doar pentru comenzi recente: un link vechi redeschis nu mai raportează nimic. */
const PURCHASE_MAX_AGE_SECONDS = 48 * 60 * 60

const formatAmount = (value: number, currency: string) =>
  new Intl.NumberFormat('ro-RO', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)

type Props = { searchParams: Promise<{ session_id?: string | string[] }> }

/**
 * Pagina la care Stripe trimite clientul după plată. În fiecare link de plată
 * Stripe: „După plată” → „Nu afișa pagina de confirmare” → redirecționare la
 * https://postalunii.ro/multumim?session_id={CHECKOUT_SESSION_ID}
 */
export default async function ThankYouPage({ searchParams }: Props) {
  const { session_id } = await searchParams
  const sessionId = typeof session_id === 'string' ? session_id : ''
  const session = sessionId ? await retrieveCheckoutSession(sessionId) : null
  const paid = session ? isPaid(session) : false
  const info = session && paid ? purchaseInfo(session) : null
  const recent = session ? createdWithin(session, PURCHASE_MAX_AGE_SECONDS) : false

  return (
    <div className="pl pl-grain" id="top">
      <section className="pl-closing" style={{ paddingBottom: 110, minHeight: '70vh' }}>
        <div className="pl-wrap" style={{ position: 'relative' }}>
          <div className="pl-closing__moon">
            <span className="pl-moon__halo" aria-hidden="true" />
            <Image src="/assets/moon-crescent.webp" alt="" aria-hidden="true" width={541} height={549} sizes="84px" />
          </div>

          {info ? (
            <>
              <h1 className="pl-h2" style={{ marginBottom: 18 }}>
                Mulțumim! Plicul tău e pe drum spre lună
              </h1>
              <p className="pl-closing__for">
                Plata de {formatAmount(info.value, info.currency)} (varianta {info.contentName}) a fost confirmată. Vei
                primi pe email confirmarea plății.
              </p>
            </>
          ) : (
            <>
              <h1 className="pl-h2" style={{ marginBottom: 18 }}>
                Mulțumim pentru comandă
              </h1>
              <p className="pl-closing__for">
                {session
                  ? 'Plata ta este în curs de confirmare. Îți scriem pe email imediat ce este încasată.'
                  : `Dacă ai plătit, vei primi confirmarea pe email. Pentru orice întrebare, scrie-ne la ${COMPANY.email}.`}
              </p>
            </>
          )}

          <Link className="pl-btn pl-btn--gold" href="/">
            Înapoi la Poșta Lunii{' '}
            <span className="pl-btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>

      {info && recent ? (
        <MetaPurchase
          eventId={info.eventId}
          value={info.value}
          currency={info.currency}
          contentName={info.contentName}
          contentId={info.variant ?? 'abonament'}
        />
      ) : null}
    </div>
  )
}
