import Image from 'next/image'
import type { NavigationContent } from '@/lib/content'
import { CrossLink, type CrossLinkKind } from './CrossLink'

type Props = {
  navigation: NavigationContent
  siteName: string
  /** Pe alte pagini decât home: logo-ul duce la „/” și header-ul e mereu vizibil. */
  homeHref?: string
  stuck?: boolean
  /** Pastila spre celălalt produs (Poșta Secretă ↔ Poșta Lunii). */
  crossLink?: CrossLinkKind
}

export function Header({ navigation, siteName, homeHref = '#top', stuck = false, crossLink }: Props) {
  return (
    <header className={`pl-header${stuck ? ' is-stuck' : ''}`} data-header>
      <div className="pl-wrap pl-header__bar">
        <a href={homeHref} aria-label={`${siteName} — ${homeHref === '#top' ? 'început' : 'pagina principală'}`}>
          <Image
            className="pl-header__logo"
            src="/assets/posta-lunii-logo.webp"
            alt={siteName}
            width={1200}
            height={291}
            sizes="150px"
            priority
          />
        </a>
        <nav className="pl-header__nav" aria-label="Navigare">
          {navigation.items.map((item) => (
            <a key={`${item.href}-${item.label}`} href={item.href}>
              {item.label}
            </a>
          ))}
          {crossLink ? <CrossLink kind={crossLink} /> : null}
          <a className="pl-btn pl-btn--gold pl-btn--sm" href={navigation.ctaHref}>
            {navigation.ctaLabel}
          </a>
        </nav>
      </div>
    </header>
  )
}
