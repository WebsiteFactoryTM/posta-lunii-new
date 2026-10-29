'use client'

import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { NavItem } from '@/lib/content'
import { CrossLink, type CrossLinkKind } from './CrossLink'

type Props = {
  items: NavItem[]
  ctaLabel: string
  ctaHref: string
  note: string
  crossLink?: CrossLinkKind
}

/**
 * Meniul de pe mobil. Butonul hamburger apare exact sub 860px, acolo unde
 * linkurile din bara de sus se ascund. Panoul se închide la Escape, la click în
 * afară și la alegerea unui link (fiind ancore în aceeași pagină), iar focusul
 * este ținut înăuntru cât e deschis.
 */
export function MobileMenu({ items, ctaLabel, ctaHref, note, crossLink }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    document.body.classList.add('pl-menu-open')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button')
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    // Peste 860px meniul nu mai există; dacă cineva rotește telefonul sau lărgește
    // fereastra cu meniul deschis, îl închidem ca să nu blocheze scroll-ul.
    const wide = window.matchMedia('(min-width: 861px)')
    const onWide = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    wide.addEventListener('change', onWide)

    const firstLink = panelRef.current?.querySelector<HTMLElement>('a[href]')
    firstLink?.focus()

    return () => {
      document.body.classList.remove('pl-menu-open')
      document.removeEventListener('keydown', onKeyDown)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="pl-burger"
        aria-label={open ? 'Închide meniul' : 'Deschide meniul'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="pl-burger__box" aria-hidden="true">
          <span className="pl-burger__bar" />
          <span className="pl-burger__bar" />
          <span className="pl-burger__bar" />
        </span>
      </button>

      <div className={`pl-menu${open ? ' is-open' : ''}`} id={panelId}>
        <button
          type="button"
          className="pl-menu__scrim"
          tabIndex={-1}
          aria-hidden="true"
          onClick={close}
        />
        <div className="pl-menu__panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Meniu">
          <nav aria-label="Navigare principală">
            <ul className="pl-menu__list">
              {items.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <a
                    className="pl-menu__link"
                    href={item.href}
                    onClick={close}
                    tabIndex={open ? undefined : -1}
                  >
                    {item.label}
                    <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            className="pl-btn pl-btn--gold"
            href={ctaHref}
            onClick={close}
            tabIndex={open ? undefined : -1}
          >
            {ctaLabel}
            <span className="pl-btn__arrow" aria-hidden="true">
              →
            </span>
          </a>
          {crossLink ? (
            <CrossLink kind={crossLink} className="pl-xlink--menu" onClick={close} tabIndex={open ? undefined : -1} />
          ) : null}
          <p className="pl-menu__note">
            <Image src="/assets/paw.webp" alt="" width={400} height={395} sizes="22px" />
            {note}
          </p>
        </div>
      </div>
    </>
  )
}
