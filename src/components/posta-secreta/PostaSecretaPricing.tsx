'use client'

import Image from 'next/image'
import { useState } from 'react'

import { postaSecreta } from '@/content/posta-secreta'
import type { PostaSecretaCheckoutUrls, PostaSecretaPlanKey } from '@/lib/posta-secreta-checkout'
import { TermsGate, useTerms } from '../TermsConsent'

type Props = { checkoutUrls: PostaSecretaCheckoutUrls }
type OptionKey = keyof typeof postaSecreta.pricing.subscription.options

const { pricing } = postaSecreta

/** Eticheta butonului cu săgeata separată, ca să se miște la hover (textul rămâne identic). */
function CtaLabel({ label }: { label: string }) {
  const text = label.replace(/\s*→$/, '')
  return (
    <>
      {text}{' '}
      <span className="pl-btn__arrow" aria-hidden="true">
        →
      </span>
    </>
  )
}

/** Butonul de plată: Payment Link Stripe, oprit cât timp Termenii nu sunt acceptați. */
function CheckoutLink({
  planKey,
  url,
  className,
  label,
}: {
  planKey: PostaSecretaPlanKey
  url: string | null
  className: string
  label: string
}) {
  const { requireAcceptance } = useTerms()

  return (
    <a
      className={`pl-btn ${className}`}
      href={url ?? '#preturi'}
      data-plan={planKey}
      onClick={(event) => {
        if (!requireAcceptance()) {
          event.preventDefault()
          return
        }
        if (!url) {
          // TODO: lipsește variabila de mediu cu linkul Stripe pentru acest plan.
          event.preventDefault()
          console.warn(`[posta-secreta] lipsește linkul de checkout pentru „${planKey}”.`)
        }
      }}
      {...(url ? { rel: 'noopener', target: '_blank' } : {})}
    >
      <CtaLabel label={label} />
    </a>
  )
}

export function PostaSecretaPricing({ checkoutUrls }: Props) {
  const { single, subscription } = pricing
  const [option, setOption] = useState<OptionKey>(subscription.defaultOption)
  const selected = subscription.options[option]
  const optionKeys = Object.keys(subscription.options) as OptionKey[]

  return (
    <TermsGate>
      <div className="ps-pricing-grid">
        <article className="ps-price-card pl-reveal">
          <Image
            className="ps-price-card__moon"
            src={single.decoration.src}
            alt=""
            aria-hidden="true"
            width={single.decoration.width}
            height={single.decoration.height}
            sizes="72px"
          />
          <h3>{single.title}</h3>
          <p className="ps-small">{single.subtitle}</p>
          <p className="ps-price-amount">
            {single.price}
            <span className="ps-price-amount__unit">{single.unit}</span>
          </p>
          <ul className="ps-price-list ps-price-list--spaced">
            {single.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <p className="ps-included">{pricing.included}</p>
          <CheckoutLink
            planKey={single.planKey}
            url={checkoutUrls[single.planKey]}
            className="ps-btn--outline"
            label={single.cta}
          />
        </article>

        <article className="ps-price-card ps-price-card--featured pl-reveal" style={{ ['--rd' as string]: '.12s' }}>
          <span className="ps-tag">{subscription.badge}</span>
          <h3>{subscription.title}</h3>
          <p className="ps-small">{subscription.toggleLabel}</p>
          <div className="ps-toggle" role="group" aria-label={subscription.toggleLabel}>
            {optionKeys.map((key) => (
              <button key={key} type="button" aria-pressed={option === key} onClick={() => setOption(key)}>
                {subscription.options[key].label}
              </button>
            ))}
          </div>
          <div aria-live="polite">
            <p className="ps-price-amount">
              {selected.price}
              <span className="ps-price-amount__unit">{selected.unit}</span>
            </p>
            <p className="ps-price-sub">{selected.sub}</p>
          </div>
          <ul className="ps-price-list">
            {subscription.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <p className="ps-included">{pricing.included}</p>
          <CheckoutLink
            planKey={selected.planKey}
            url={checkoutUrls[selected.planKey]}
            className="ps-btn--sage"
            label={subscription.cta}
          />
        </article>
      </div>
    </TermsGate>
  )
}
