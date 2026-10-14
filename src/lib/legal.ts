/**
 * Datele de identificare ale comerciantului și constantele folosite de
 * documentele legale, bannerul de cookie și funcția de retragere.
 *
 * Sunt în cod, nu în CMS, pentru că apar în texte cu valoare juridică: o
 * modificare aici trebuie să fie conștientă și să actualizeze și `LEGAL_UPDATED`.
 */

export const COMPANY = {
  name: 'SLACH MARIA-ADINA PERSOANĂ FIZICĂ AUTORIZATĂ',
  shortName: 'Slach Maria-Adina PFA',
  address: 'Strada Bega, Nr. 47, Sat Ghiroda, Comuna Ghiroda, Jud. Timiș, România',
  cui: '53872078',
  regCom: 'F2026007027006',
  euid: 'ROONRC.F2026007027006',
  email: 'contact@adinaslach.com',
  vatPayer: false,
} as const

/** Data ultimei actualizări a documentelor legale (afișată în pagini). */
export const LEGAL_UPDATED = '14 octombrie 2026'

/** Versiunea consimțământului pentru cookie. Crește-o când se schimbă lista de
 *  cookie-uri opționale, ca bannerul să ceară din nou acordul. */
// v2: a apărut categoria „Marketing” (Meta Pixel).
export const CONSENT_VERSION = 2
export const CONSENT_COOKIE = 'pl_consent'
export const CONSENT_MAX_AGE_DAYS = 180

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-G5E9T34WP3'

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1441607221249526'

export const LEGAL_LINKS = [
  { href: '/termeni-si-conditii', label: 'Termeni și condiții' },
  { href: '/politica-de-confidentialitate', label: 'Politica de confidențialitate' },
  { href: '/politica-cookies', label: 'Politica de cookie-uri' },
] as const

export const WITHDRAWAL_HREF = '/retragere'

export const ANPC = {
  sal: 'https://anpc.ro/ce-este-sal/',
  sol: 'https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO',
  home: 'https://anpc.ro',
} as const

export const ANSPDCP = {
  name: 'Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)',
  address: 'B-dul G-ral. Gheorghe Magheru nr. 28-30, Sector 1, cod poștal 010336, București',
  url: 'https://www.dataprotection.ro',
  email: 'anspdcp@dataprotection.ro',
} as const
