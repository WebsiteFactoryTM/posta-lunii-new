/**
 * Poșta Lunii — conținutul implicit al paginii.
 *
 * Acest fișier este singura sursă de adevăr pentru textele paginii:
 *  1. alimentează `defaultValue` pentru câmpurile din Payload (admin-ul pornește
 *     deja completat corect),
 *  2. alimentează seed-ul (`pnpm seed`),
 *  3. este fallback-ul folosit la randare dacă baza de date e goală sau
 *     indisponibilă — pagina arată identic chiar înainte de primul seed.
 *
 * Designul (clase, rotații, variante de cartonaș) rămâne în cod. În Payload se
 * editează doar textul și linkurile.
 */

export type ItemVariant = 'letter' | 'journal' | 'book' | 'gift'

export type EnvelopeItem = {
  variant: ItemVariant
  title: string
  note?: string | null
}

export type PaymentOption = {
  label: string
  detail?: string | null
  checkoutUrl: string
}

export type Plan = {
  name: string
  price: string
  priceSuffix?: string | null
  description: string
  savings?: string | null
  descriptionAfter?: string | null
  fine?: string | null
  ctaLabel: string
  checkoutUrl: string
  /** Variante de plată pentru același plan (ex. lunar vs. integral). Cu cel puțin
   *  două, cardul afișează un selector și butonul urmează alegerea. */
  paymentOptions?: PaymentOption[] | null
  featured?: boolean | null
  badge?: string | null
}

export type FaqItem = { question: string; answer: string }

export type LandingContent = {
  hero: {
    subtitle: string
    text: string
    donationBefore: string
    donationAmount: string
    donationAfter: string
    ctaLabel: string
    ctaNote: string
  }
  envelope: {
    eyebrow: string
    title: string
    items: EnvelopeItem[]
    outro: string
  }
  about: {
    photoCaption: string
    photoAlt: string
    paragraphs: { text: string }[]
    signature: string
  }
  donation: {
    eyebrow: string
    titleAmount: string
    titleMiddle: string
    titleTarget: string
    text: string
    refrainLeft: string
    refrainRight: string
  }
  pricing: {
    eyebrow: string
    title: string
    plans: Plan[]
    note: string
  }
  closing: {
    text: string
    ctaLabel: string
  }
  faq: {
    enabled: boolean
    eyebrow: string
    title: string
    items: FaqItem[]
  }
  footer: {
    instagramLabel: string
    baseNote: string
    copyright: string
  }
}

export type NavItem = { label: string; href: string }

export type NavigationContent = {
  items: NavItem[]
  ctaLabel: string
  ctaHref: string
}

export type SettingsContent = {
  siteName: string
  tagline: string
  metaTitle: string
  metaDescription: string
  keywords: string
  instagramUrl: string
  donationAmount: string
  shelterName: string
  priceFrom: string
  priceMonthly: string
  currency: string
}

export const defaultSettings: SettingsContent = {
  siteName: 'Poșta Lunii',
  tagline: 'Un plic pentru tine. Un mic ajutor pentru un animal din adăpost.',
  metaTitle: 'Poșta Lunii — abonament lunar prin poștă, cu 15 lei pentru adăpost',
  metaDescription:
    'Un abonament lunar prin poștă: o scrisoare, un exercițiu de journaling, o recomandare de carte și mici surprize. 15 lei din fiecare plic merg către Adăpostul Speranța.',
  keywords:
    'abonament lunar, scrisoare prin poștă, journaling, jurnal, recomandare de carte, cadou, Poșta Lunii, adăpost animale, Adăpostul Speranța',
  instagramUrl: 'https://www.instagram.com/adina.creeaza/',
  donationAmount: '15 lei',
  shelterName: 'Adăpostul Speranța',
  priceFrom: '55',
  priceMonthly: '60',
  currency: 'RON',
}

export const defaultNavigation: NavigationContent = {
  items: [
    { label: 'Ce primești', href: '#plic' },
    { label: 'Despre', href: '#adina' },
    { label: 'Prețuri', href: '#preturi' },
  ],
  ctaLabel: 'Abonează-te',
  ctaHref: '#preturi',
}

export const defaultLanding: LandingContent = {
  hero: {
    subtitle: 'Un plic pentru tine. Un mic ajutor pentru un animal din adăpost.',
    text: 'În fiecare lună primești în poștă o scrisoare, un exercițiu de scriere, o recomandare de carte potrivită pentru tema lunii și alte surprize — lucruri create să te scoată puțin din online și să-ți aducă bucuria de a primi ceva făcut cu grijă.',
    donationBefore: 'Iar',
    donationAmount: '15 lei',
    donationAfter: 'din fiecare plic cumpărat merg către Adăpostul Speranța.',
    ctaLabel: 'Vreau Poșta Lunii',
    ctaNote: 'de la 55 lei / lună · livrare inclusă prin Poșta Română',
  },
  envelope: {
    eyebrow: 'Ediția fiecărei luni',
    title: 'Ce găsești în plic?',
    items: [
      { variant: 'letter', title: 'O scrisoare', note: 'inspirată de tema lunii, pentru tine' },
      { variant: 'journal', title: 'Un exercițiu de scriere creativă sau journaling', note: '' },
      {
        variant: 'book',
        title: 'O recomandare de carte potrivită temei lunii, sub forma unui cartonaș',
        note: 'Cartea lunii',
      },
      { variant: 'gift', title: 'Mici surprize', note: 'care se schimbă în fiecare lună' },
    ],
    outro:
      'Un plic mic care face loc pentru două lucruri: ceva frumos pentru tine și puțin bine pentru un animal.',
  },
  about: {
    photoCaption: 'eu și Bella',
    photoAlt: 'Adina îmbrățișând-o pe Bella, cățelușa ei adoptată',
    paragraphs: [
      {
        text: 'Sunt Adina, iar Poșta Lunii a început din nevoia mea de a petrece mai mult timp offline și din iubirea pentru scris, cărți și câini.',
      },
      {
        text: 'Viața mea nu ar fi completă fără cei doi câini pe care i-am adoptat, dar gândurile mele zboară mereu și către cei care încă își așteaptă omul. De aceea, pentru mine este important să ajut animalele din adăpost. 🐾',
      },
      {
        text: 'Am vrut să creez ceva care să te scoată, măcar pentru o seară, din online: un plic pregătit cu drag, care îți oferă un motiv să-ți iei puțin timp doar pentru tine.',
      },
    ],
    signature: '— Adina 🌙',
  },
  donation: {
    eyebrow: 'Poșta Lunii înseamnă și…',
    titleAmount: '15 lei',
    titleMiddle: 'din fiecare plic',
    titleTarget: 'Adăpostul Speranța',
    text: 'Vreau ca Poșta Lunii să fie mai mult decât un abonament la lucruri drăguțe. Cu fiecare plic cumpărat, contribui direct la sprijinirea animalelor aflate în grija Adăpostului Speranța.',
    refrainLeft: 'Tu primești o scrisoare.',
    refrainRight: 'Un animal primește puțin ajutor.',
  },
  pricing: {
    eyebrow: 'Abonament',
    title: 'Alege cum vrei să primești Poșta Lunii',
    plans: [
      {
        name: '🌙 O lună',
        price: '60 lei',
        priceSuffix: '',
        description: 'Primești ediția lunii următoare, livrată prin Poșta Română, fără cost de transport.',
        ctaLabel: 'Cumpără plicul de luna viitoare',
        checkoutUrl: 'https://buy.stripe.com/14A28q4RX0vn7B6bBc3Ru00',
        featured: false,
      },
      {
        name: '✨ Un an de Poșta Lunii',
        price: '55 lei',
        priceSuffix: '/ lună',
        description: 'Primești 12 plicuri și ai 5 lei reducere la fiecare lună.',
        savings: 'Economisești 60 lei',
        descriptionAfter: '— adică o lună este practic din partea noastră. 💌',
        fine: 'Poți alege: plata integrală, o singură dată — sau plata recurentă, lună de lună.',
        ctaLabel: 'Abonează-mă pentru un an',
        checkoutUrl: 'https://buy.stripe.com/9B69ASesxgulf3ygVw3Ru01',
        paymentOptions: [
          {
            label: 'Lunar',
            detail: '55 lei în fiecare lună, plată recurentă',
            checkoutUrl: 'https://buy.stripe.com/9B69ASesxgulf3ygVw3Ru01',
          },
          {
            label: 'Integral',
            detail: '660 lei o singură dată, pentru 12 luni',
            checkoutUrl: 'https://buy.stripe.com/5kQ14m0BHdi92gMbBc3Ru02',
          },
        ],
        featured: true,
        badge: 'Recomandat',
      },
    ],
    note: 'Din fiecare plic, 15 lei merg către Adăpostul Speranța.',
  },
  closing: {
    text: 'Pentru cei care încă iubesc să primească scrisori, păstrează bilețele între paginile cărților și vor să iasă puțin din zgomotul online.',
    ctaLabel: 'Vreau Poșta Lunii',
  },
  faq: {
    enabled: false,
    eyebrow: 'Întrebări',
    title: 'Ce e bine să știi',
    items: [
      {
        question: 'Ce primesc în fiecare plic de la Poșta Lunii?',
        answer:
          'Fiecare plic conține o scrisoare scrisă în jurul temei lunii, un exercițiu de scriere creativă sau de journaling, un cartonaș cu o recomandare de carte potrivită temei și mici surprize care se schimbă lunar.',
      },
      {
        question: 'Cât costă abonamentul Poșta Lunii?',
        answer:
          'O singură lună costă 60 lei. Abonamentul anual costă 55 lei pe lună, pentru 12 plicuri — economisești 60 lei, adică practic o lună este din partea noastră.',
      },
      {
        question: 'Cum ajunge plicul la mine?',
        answer:
          'Plicul vine prin Poșta Română, direct în cutia poștală, la adresa completată la plată. Livrarea e inclusă în preț. Ca să ajungă fără probleme, scrie adresa completă: stradă, număr, bloc, scară, etaj, apartament, localitate, județ și cod poștal.',
      },
      {
        question: 'Livrați și în afara României? Pot face cadou?',
        answer:
          'Livrăm doar în România. Dacă Poșta Lunii e un cadou, completează la plată adresa persoanei care primește plicul.',
      },
      {
        question: 'Cât din preț merge la adăpost?',
        answer:
          'Din fiecare plic cumpărat, 15 lei merg către Adăpostul Speranța, pentru animalele aflate în grija lor.',
      },
      {
        question: 'Pot plăti anual o singură dată sau lunar?',
        answer:
          'Ambele variante sunt posibile pentru abonamentul anual: fie plata integrală, o singură dată, fie plata recurentă, lună de lună.',
      },
      {
        question: 'Cine este în spatele Poștei Lunii?',
        answer:
          'Adina, care a pornit Poșta Lunii din nevoia de a petrece mai mult timp offline și din iubirea pentru scris, cărți și câini. Are doi câini adoptați, iar o parte din fiecare plic merge la animalele din adăpost.',
      },
    ],
  },
  footer: {
    instagramLabel: '@adina.creeaza',
    baseNote: '15 lei din fiecare plic → Adăpostul Speranța',
    copyright: '© 2026 Poșta Lunii',
  },
}
