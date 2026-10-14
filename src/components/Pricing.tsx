import type { CSSProperties } from 'react'
import Image from 'next/image'
import type { LandingContent } from '@/lib/content'
import { PricingViewContent } from './MetaPixelEvents'
import { PlanCheckout } from './PlanCheckout'
import { TermsGate } from './TermsConsent'

type Props = { pricing: LandingContent['pricing'] }

const DELAYS = ['0s', '.12s', '.24s']

export function Pricing({ pricing }: Props) {
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
                  <PlanCheckout plan={plan} />
                </article>
              )
            })}
          </div>
        </TermsGate>

        <p className="pl-plans__note pl-reveal">
          <Image src="/assets/paw.webp" alt="" width={400} height={395} sizes="26px" />
          {pricing.note}
        </p>
        <PricingViewContent sectionId="preturi" />
      </div>
    </section>
  )
}
