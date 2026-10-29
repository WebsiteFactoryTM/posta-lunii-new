import Image from 'next/image'
import Link from 'next/link'

/**
 * Pastila care leagă cele două produse: de pe Poșta Lunii spre Poșta Secretă
 * și invers. Stă în header (vizibilă și pe mobil, lângă hamburger) și în
 * meniul de pe mobil.
 */

export type CrossLinkKind = 'secreta' | 'lunii'

const LINKS = {
  secreta: {
    href: '/posta-secreta',
    label: 'Poșta Secretă',
    note: 'pentru copii',
    icon: { src: '/posta-secreta/ciuperci.webp', width: 324, height: 360 },
  },
  lunii: {
    href: '/',
    label: 'Poșta Lunii',
    note: 'pentru tine',
    icon: { src: '/assets/moon-crescent.webp', width: 541, height: 549 },
  },
} as const

type Props = {
  kind: CrossLinkKind
  className?: string
  onClick?: () => void
  tabIndex?: number
}

export function CrossLink({ kind, className = '', onClick, tabIndex }: Props) {
  const link = LINKS[kind]

  return (
    <Link
      href={link.href}
      className={`pl-xlink pl-xlink--${kind} ${className}`.trim()}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      <Image className="pl-xlink__icon" src={link.icon.src} alt="" aria-hidden="true" width={link.icon.width} height={link.icon.height} sizes="24px" />
      <span className="pl-xlink__label">{link.label}</span>
      <span className="pl-xlink__note">{link.note}</span>
    </Link>
  )
}
