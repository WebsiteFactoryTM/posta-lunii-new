'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Apariția la scroll și logo-ul mic din header — portul observatorilor din machetă.
 *
 * Clasa `.pl-js` este randată pe server, direct pe <html>, ca elementele care
 * urmează să apară să fie ascunse încă de la prima pictare (fără sclipire) și ca
 * React să hidrateze exact HTML-ul pe care l-a trimis. Aici nu se mai atinge
 * <html>: se adaugă doar clase pe elemente, după hidratare.
 *
 * Deschiderea plicului este pur CSS (vezi `pl-env-in` / `pl-env-open`), deci nu
 * întârzie dacă pachetul JavaScript se încarcă greu.
 *
 * Componenta stă în layout, care nu se remontează la navigarea între pagini
 * (next/link). De aceea observatorii se refac la fiecare schimbare de rută —
 * altfel elementele `.pl-reveal` ale paginii noi ar rămâne ascunse.
 */
export function Motion() {
  const pathname = usePathname()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('.pl-reveal, [data-reveal-group]'),
    )

    let revealObserver: IntersectionObserver | undefined

    if (!('IntersectionObserver' in window) || reduce) {
      targets.forEach((el) => el.classList.add('is-in'))
    } else {
      // Ce e deja în ecran apare imediat; restul, pe măsură ce se derulează.
      const below = targets.filter((el) => {
        const isBelow = el.getBoundingClientRect().top > window.innerHeight * 0.9
        if (!isBelow) el.classList.add('is-in')
        return isBelow
      })

      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-in')
            revealObserver?.unobserve(entry.target)
          })
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
      )
      below.forEach((el) => revealObserver?.observe(el))
    }

    // Logo-ul mic din header apare când cel din hero a ieșit din ecran.
    const header = document.querySelector('[data-header]')
    const heroLogo = document.querySelector('.pl-hero__logo')
    let headerObserver: IntersectionObserver | undefined

    if (header && heroLogo && 'IntersectionObserver' in window) {
      headerObserver = new IntersectionObserver((entries) => {
        header.classList.toggle('is-stuck', !entries[0].isIntersecting)
      })
      headerObserver.observe(heroLogo)
    }

    return () => {
      revealObserver?.disconnect()
      headerObserver?.disconnect()
    }
  }, [pathname])

  return null
}
