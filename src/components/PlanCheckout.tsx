'use client'

import { useId, useState } from 'react'
import { checkoutVariant, encodeCheckoutRef } from '@/lib/checkout'
import type { Plan } from '@/lib/content'
import { readMetaIds, trackMeta } from '@/lib/meta-pixel'
import { hasMarketingConsent } from './CookieConsent'
import { useTerms } from './TermsConsent'

type Props = { plan: Plan }

const isExternal = (url: string) => /^https?:\/\//.test(url)

/** Linkurile Stripe primesc `client_reference_id`, preluat apoi de pagina de confirmare și de webhook. */
const isStripeLink = (url: string) => /^https:\/\/buy\.stripe\.com\//.test(url)

/**
 * Butonul de checkout al unui plan. Dacă planul are cel puțin două variante de
 * plată (ex. lunar / integral), afișează întâi un selector, iar butonul duce la
 * linkul variantei alese.
 */
export function PlanCheckout({ plan }: Props) {
  const name = useId()
  const options = (plan.paymentOptions ?? []).filter((option) => option.label && option.checkoutUrl)
  const [selected, setSelected] = useState(0)
  const { requireAcceptance } = useTerms()

  const hasChoice = options.length >= 2
  const href = (hasChoice ? options[selected]?.checkoutUrl : plan.checkoutUrl) || '#'
  const variant = checkoutVariant(plan, hasChoice ? options[selected] : undefined)

  return (
    <>
      {hasChoice ? (
        <fieldset className="pl-paychoice">
          <legend className="pl-paychoice__legend">Cum vrei să plătești?</legend>
          {options.map((option, index) => (
            <label key={`${option.label}-${index}`} className="pl-paychoice__option">
              <input
                type="radio"
                name={name}
                value={index}
                checked={selected === index}
                onChange={() => setSelected(index)}
              />
              <span className="pl-paychoice__text">
                <b>{option.label}</b>
                {option.detail ? <span>{option.detail}</span> : null}
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}
      <a
        className={`pl-btn ${plan.featured ? 'pl-btn--gold' : 'pl-btn--ghost'} pl-btn--block`}
        href={href}
        onClick={(event) => {
          if (!requireAcceptance()) {
            event.preventDefault()
            return
          }

          trackMeta('InitiateCheckout', {
            content_name: variant.name,
            content_type: 'product',
            content_ids: [variant.key],
            num_items: 1,
            currency: 'RON',
            ...(variant.value ? { value: variant.value } : {}),
          })

          // Varianta aleasă (și, cu acord de marketing, _fbp/_fbc) ajung în Stripe
          // ca client_reference_id. Linkul e schimbat chiar înainte de navigare.
          if (isStripeLink(href)) {
            const marketing = hasMarketingConsent()
            const url = new URL(href)
            url.searchParams.set(
              'client_reference_id',
              encodeCheckoutRef({ variant: variant.key, marketing, ...(marketing ? readMetaIds() : {}) }),
            )
            event.currentTarget.href = url.toString()
          }
        }}
        {...(isExternal(href) ? { rel: 'noopener', target: '_blank' } : {})}
      >
        {plan.ctaLabel}
        {plan.featured ? (
          <>
            {' '}
            <span className="pl-btn__arrow" aria-hidden="true">
              →
            </span>
          </>
        ) : null}
      </a>
    </>
  )
}
