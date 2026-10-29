import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'

import { Header } from '@/components/Header'
import { MobileMenu } from '@/components/MobileMenu'
import { Footer } from '@/components/Footer'
import { BenefitIcon } from '@/components/posta-secreta/BenefitIcon'
import { PostaSecretaPricing } from '@/components/posta-secreta/PostaSecretaPricing'

import { postaSecreta } from '@/content/posta-secreta'
import { getLanding, getNavigation, getSettings } from '@/lib/payload-content'
import { getPostaSecretaCheckoutUrls } from '@/lib/posta-secreta-checkout'
import { LOCALE } from '@/lib/site'

import '@/styles/posta-secreta.css'

export const revalidate = 300

const { meta, hero, contents, benefits, band, about, pricing } = postaSecreta

const HERO_SIZES = '(min-width: 900px) 470px, 300px'

/** Întârzierea apariției la scroll (vezi `.pl-reveal` în site.css), pentru carduri în cascadă. */
const stagger = (index: number): CSSProperties => (index > 0 ? { ['--rd' as string]: `${index * 0.1}s` } : {})

export const metadata: Metadata = {
  // `absolute`: titlul din conținut include deja „| Poșta Lunii”.
  title: { absolute: meta.title },
  description: meta.description,
  alternates: { canonical: '/posta-secreta' },
  openGraph: {
    type: 'website',
    locale: LOCALE,
    url: '/posta-secreta',
    title: meta.title,
    description: meta.description,
    images: [{ url: hero.image.src, width: hero.image.width, height: hero.image.height, alt: hero.image.alt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    images: [hero.image.src],
  },
}

/**
 * Meniul e același ca pe home („Ce primești”, „Despre”, „Prețuri”), dar aici duce
 * la secțiunile echivalente ale paginii. Orice altă ancoră ține de home.
 */
const LOCAL_ANCHORS = new Set(['#plic', '#adina', '#preturi'])
const toLocal = (href: string) => (href.startsWith('#') && !LOCAL_ANCHORS.has(href) ? `/${href}` : href)

export default async function PostaSecretaPage() {
  const [landing, navigation, settings] = await Promise.all([getLanding(), getNavigation(), getSettings()])
  const navItems = navigation.items.map((item) => ({ ...item, href: toLocal(item.href) }))
  const ctaHref = toLocal(navigation.ctaHref)

  return (
    <div className="pl ps" id="top">
      <Header
        navigation={{ ...navigation, items: navItems, ctaHref }}
        siteName={settings.siteName}
        homeHref="/"
        stuck
        crossLink="lunii"
      />
      <MobileMenu
        items={navItems}
        ctaLabel={navigation.ctaLabel}
        ctaHref={ctaHref}
        note={landing.footer.baseNote}
        crossLink="lunii"
      />

      <main>
        {/* 1. Hero */}
        <section className="ps-section ps-hero ps-bg-cream">
          <div className="pl-wrap ps-hero__grid">
            <div className="ps-hero__top">
              <Image
                className="ps-hero__wordmark"
                src={hero.wordmark.src}
                alt={hero.wordmark.alt}
                width={hero.wordmark.width}
                height={hero.wordmark.height}
                sizes="240px"
                loading="eager"
              />
              <p className="ps-eyebrow ps-hero__eyebrow">{hero.eyebrow}</p>
              <h1 className="ps-hero__title">{hero.title}</h1>
            </div>
            <div className="ps-hero__img">
              {/* Aceeași imagine în două straturi: plicul cu scrisoarea (vizibil de la prima
                  pictare, e LCP) și paginile din față, care „ies” din plic și se așază lângă el. */}
              <div className="ps-art">
                <Image
                  className="ps-art__base"
                  src={hero.image.src}
                  alt={hero.image.alt}
                  width={hero.image.width}
                  height={hero.image.height}
                  sizes={HERO_SIZES}
                  preload
                />
                <span className="ps-art__fill" aria-hidden="true">
                  <i className="ps-art__paper" />
                  <i className="ps-art__kraft ps-art__kraft--side" />
                  <i className="ps-art__kraft ps-art__kraft--bottom" />
                </span>
                <Image
                  className="ps-art__front"
                  src={hero.image.src}
                  alt=""
                  aria-hidden="true"
                  width={hero.image.width}
                  height={hero.image.height}
                  sizes={HERO_SIZES}
                  loading="eager"
                />
              </div>
            </div>
            <div className="ps-hero__bottom">
              <p className="ps-lead-serif">{hero.subtitle}</p>
              <a href={hero.cta.href} className="pl-btn ps-btn--sage">
                {hero.cta.label.replace(/\s*→$/, '')}{' '}
                <span className="pl-btn__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. Ce găsește copilul în plic */}
        <section className="ps-section ps-bg-white" id="plic" aria-labelledby="ps-contents-title">
          <div className="pl-wrap ps-center">
            <h2 id="ps-contents-title" className="ps-h2 pl-reveal">
              {contents.title}
            </h2>
            <div className="ps-content-shot pl-reveal">
              <Image
                src={contents.image.src}
                alt={contents.image.alt}
                width={contents.image.width}
                height={contents.image.height}
                sizes="(min-width: 1048px) 1000px, 100vw"
              />
            </div>
          </div>
        </section>

        {/* 3. Ce câștigă copilul tău */}
        <section className="ps-section ps-bg-cream" aria-labelledby="ps-benefits-title">
          <div className="pl-wrap">
            <div className="ps-center pl-reveal">
              <p className="ps-eyebrow">{benefits.eyebrow}</p>
              <h2 id="ps-benefits-title" className="ps-h2">
                {benefits.title}
              </h2>
            </div>
            <div className="ps-benefits">
              {benefits.items.map((item, index) => (
                <div key={item.title} className="ps-benefit pl-reveal" style={stagger(index)}>
                  <BenefitIcon icon={item.icon} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Bandă */}
        <div className="ps-band">
          <div className="pl-wrap ps-band__inner">
            <p className="ps-lead-serif">{band.text}</p>
            <Image
              className="ps-band__mushrooms"
              src={band.decoration.src}
              alt=""
              aria-hidden="true"
              width={band.decoration.width}
              height={band.decoration.height}
              sizes="120px"
            />
          </div>
        </div>

        {/* 5. Cine scrie scrisorile */}
        <section className="ps-section ps-bg-white" id="adina" aria-labelledby="ps-about-title">
          <div className="pl-wrap">
            <h2 id="ps-about-title" className="ps-h2 ps-center pl-reveal">
              {about.title}
            </h2>
            <div className="ps-about">
              <div className="ps-about__photo pl-reveal">
                <Image
                  src={about.photo.src}
                  alt={about.photo.alt}
                  width={about.photo.width}
                  height={about.photo.height}
                  sizes="(min-width: 820px) 300px, 240px"
                />
              </div>
              <div className="ps-about__text pl-reveal" style={stagger(1)}>
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
                <p className="ps-signature">{about.signature}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Prețuri */}
        <section className="ps-section ps-bg-cream" id={pricing.id} aria-labelledby="ps-pricing-title">
          <div className="pl-wrap">
            <h2 id="ps-pricing-title" className="ps-h2 ps-center pl-reveal">
              {pricing.title}
            </h2>

            <PostaSecretaPricing checkoutUrls={getPostaSecretaCheckoutUrls()} />

            <div className="ps-delivery-note pl-reveal">
              <Image
                src={pricing.deliveryNote.decoration.src}
                alt=""
                aria-hidden="true"
                width={pricing.deliveryNote.decoration.width}
                height={pricing.deliveryNote.decoration.height}
                sizes="96px"
              />
              <p>{pricing.deliveryNote.text}</p>
            </div>
          </div>
        </section>
      </main>

      <Footer footer={landing.footer} instagramUrl={settings.instagramUrl} />
    </div>
  )
}
