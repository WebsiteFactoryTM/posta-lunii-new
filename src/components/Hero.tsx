import Image from 'next/image'
import { Stars } from './Stars'
import type { LandingContent } from '@/lib/content'

type Props = {
  hero: LandingContent['hero']
  siteName: string
  ctaHref: string
  /** Termenul de comandă, varianta scurtă (vezi `orderDeadline`). */
  deadline: string
}

export function Hero({ hero, siteName, ctaHref, deadline }: Props) {
  return (
    <section className="pl-hero pl-grain" aria-labelledby="hero-title">
      <Stars field="hero" />
      <div className="pl-wrap pl-hero__grid">
        <div className="pl-hero__head">
          <h1 id="hero-title" className="pl-sr">
            {siteName}
          </h1>
          <div className="pl-hero__brand">
            <Image
              className="pl-hero__logo"
              src="/assets/posta-lunii-logo-fara-luna.webp"
              alt={siteName}
              width={1200}
              height={291}
              sizes="(max-width: 860px) 330px, 470px"
              priority
            />
            {/* Luna din logo e emoji, deci se redă diferit pe iPhone / Android /
                Windows — la fel ca în machetă. Pentru un randament identic peste
                tot, se înlocuiește cu <Image src="/assets/moon-crescent.webp" />. */}
            <span className="pl-hero__logomoon" aria-hidden="true">
              🌙
            </span>
          </div>
          <p className="pl-hero__sub pl-lead-serif">{hero.subtitle}</p>
        </div>

        <div className="pl-hero__art" aria-hidden="true">
          <div className="pl-env__float" style={{ position: 'absolute', inset: 0 }}>
            <div className="pl-env">
              <div className="pl-env__layer pl-env__bottom">
                <Image
                  src="/assets/hero-envelope.webp"
                  alt=""
                  width={1400}
                  height={1601}
                  sizes="(max-width: 860px) 280px, 490px"
                  priority
                />
              </div>
              <div className="pl-env__layer pl-env__top">
                <Image
                  src="/assets/hero-envelope.webp"
                  alt=""
                  width={1400}
                  height={1601}
                  sizes="(max-width: 860px) 280px, 490px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pl-hero__copy">
          <p className="pl-hero__text">{hero.text}</p>
          <p className="pl-donation">
            <Image src="/assets/paw.webp" alt="" width={400} height={395} sizes="40px" />
            <span>
              {hero.donationBefore} <span className="pl-hand">{hero.donationAmount}</span>{' '}
              {hero.donationAfter}
            </span>
          </p>
          <div className="pl-hero__cta">
            <a className="pl-btn pl-btn--gold" href={ctaHref}>
              {hero.ctaLabel}{' '}
              <span className="pl-btn__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <span className="pl-hero__note">
              {hero.ctaNote}
              <span className="pl-hero__deadline">{deadline}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
