import type { CSSProperties } from 'react'
import Image from 'next/image'
import type { LandingContent } from '@/lib/content'
import type { OrderDeadline } from '@/lib/order-deadline'
import { PricingViewContent } from './MetaPixelEvents'
import { PlanCheckout } from './PlanCheckout'
import { TermsGate } from './TermsConsent'

type Props = { pricing: LandingContent['pricing']; deadline: OrderDeadline }

const DELAYS = ['0s', '.12s', '.24s']

const ICON = { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', stroke: '#7A5A17', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

const CalendarIcon = () => (
  <svg {...ICON}>
    <rect x="2.5" y="3.5" width="13" height="12" rx="2" />
    <path d="M2.5 7.5h13M6 2v3M12 2v3" />
  </svg>
)

const EnvelopeIcon = () => (
  <svg {...ICON}>
    <rect x="2" y="4" width="14" height="10" rx="1.5" />
    <path d="m2.5 4.8 6.5 5 6.5-5" />
  </svg>
)

export function Pricing({ pricing, deadline }: Props) {
  return (
    <section className="pl-section pl-grain" id="preturi" aria-labelledby="pret-title">
      <div className="pl-wrap">
        <div className="pl-section__head pl-reveal">
          <p className="pl-eyebrow">{pricing.eyebrow}</p>
          <h2 id="pret-title" className="pl-h2">
            {pricing.title}
          </h2>
        </div>

        <TermsGate>
          <div className="pl-plans">
            {pricing.plans.map((plan, index) => {
              const style: CSSProperties = index > 0 ? { ['--rd' as string]: DELAYS[index] ?? '0s' } : {}
              // Cardul cu selector de plată e abonamentul anual; cel fără e plicul de o lună.
              const isAnnual = (plan.paymentOptions?.filter((option) => option.label && option.checkoutUrl).length ?? 0) >= 2
              return (
                <article
                  key={`${plan.name}-${index}`}
                  className={`pl-plan${plan.featured ? ' pl-plan--featured' : ''} pl-reveal`}
                  style={style}
                >
                  {plan.badge ? <span className="pl-badge">{plan.badge}</span> : null}
                  <h3 className="pl-plan__name">{plan.name}</h3>
                  <p className="pl-plan__price">
                    <b>{plan.price}</b>
                    {plan.priceSuffix ? <span>{plan.priceSuffix}</span> : null}
                  </p>
                  <p className="pl-plan__desc">
                    {plan.description}
                    {plan.savings ? (
                      <>
                        {' '}
                        <span className="pl-plan__save">{plan.savings}</span>
                      </>
                    ) : null}
                    {plan.descriptionAfter ? ` ${plan.descriptionAfter}` : null}
                  </p>
                  {isAnnual ? null : (
                    <p className="pl-plan__fine">
                      <CalendarIcon />
                      {deadline.text}
                    </p>
                  )}
                  {plan.fine ? (
                    <p className="pl-plan__fine">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        stroke="#7A5A17"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M3 6.5h12M3 11.5h12M6 3.5 3 6.5l3 3M12 8.5l3 3-3 3" />
                      </svg>
                      {plan.fine}
                    </p>
                  ) : null}
                  {isAnnual ? (
                    <p className="pl-plan__fine">
                      <CalendarIcon />
                      <span>
                        Primul plic: ediția lunii următoare. {deadline.text}
                      </span>
                    </p>
                  ) : null}
                  <p className="pl-plan__fine pl-plan__delivery">
                    <EnvelopeIcon />
                    Livrare inclusă în preț – prin Poșta Română
                  </p>
                  <PlanCheckout plan={plan} />
                  <p className="pl-plan__address">
                    La plată, completează adresa completă: stradă, număr, bloc, scară, etaj, apartament, localitate,
                    județ și cod poștal. Plicul vine prin Poșta Română, de obicei la cutia poștală. Dacă nu poate fi
                    lăsat acolo, îl poți ridica de la oficiul poștal de care aparții.
                  </p>
                </article>
              )
            })}
          </div>
        </TermsGate>

        <p className="pl-plans__shipping pl-reveal">
          <b>Livrăm doar în România.</b> Dacă Poșta Lunii e un cadou, pune la plată adresa persoanei care primește
          plicul.
        </p>

        <p className="pl-plans__note pl-reveal">
          <Image src="/assets/paw.webp" alt="" width={400} height={395} sizes="26px" />
          {pricing.note}
        </p>
        <PricingViewContent sectionId="preturi" />
      </div>
    </section>
  )
}
