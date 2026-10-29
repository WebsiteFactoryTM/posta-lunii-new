import Image from 'next/image'

import { Header } from '@/components/Header'
import { MobileMenu } from '@/components/MobileMenu'
import { Hero } from '@/components/Hero'
import { EnvelopeItems } from '@/components/EnvelopeItems'
import { About } from '@/components/About'
import { Donation } from '@/components/Donation'
import { Pricing } from '@/components/Pricing'
import { Faq } from '@/components/Faq'
import { Closing } from '@/components/Closing'
import { Footer } from '@/components/Footer'

import { getLanding, getNavigation, getSettings } from '@/lib/payload-content'
import { orderDeadline } from '@/lib/order-deadline'
import { buildJsonLd } from '@/lib/schema'

export const revalidate = 300

export default async function HomePage() {
  const [landing, navigation, settings] = await Promise.all([
    getLanding(),
    getNavigation(),
    getSettings(),
  ])

  const jsonLd = buildJsonLd(landing, settings)
  // Calculat la fiecare regenerare a paginii (revalidate = 5 min), deci se schimbă singur la început de lună.
  const deadline = orderDeadline()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="pl" id="top">
        <Header navigation={navigation} siteName={settings.siteName} crossLink="secreta" />
        <MobileMenu
          items={navigation.items}
          ctaLabel={navigation.ctaLabel}
          ctaHref={navigation.ctaHref}
          note={landing.footer.baseNote}
          crossLink="secreta"
        />

        <Hero hero={landing.hero} siteName={settings.siteName} ctaHref={navigation.ctaHref} deadline={deadline.short} />

        <Image
          className="pl-phases"
          src="/assets/moon-phases-ink.webp"
          alt=""
          aria-hidden="true"
          width={1200}
          height={406}
          sizes="300px"
        />

        <EnvelopeItems envelope={landing.envelope} />
        <About about={landing.about} />
        <Donation donation={landing.donation} />
        <Pricing pricing={landing.pricing} deadline={deadline} />
        <Faq faq={landing.faq} />
        <Closing closing={landing.closing} ctaHref={navigation.ctaHref} />
        <Footer footer={landing.footer} instagramUrl={settings.instagramUrl} />
      </div>
    </>
  )
}
