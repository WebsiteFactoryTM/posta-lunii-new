/**
 * Emailurile trimise de site (prin Resend): un cadru comun, în culorile
 * Poștei Lunii, și conținutul fiecărui mesaj. HTML simplu, cu tabele și stiluri
 * inline, ca să arate la fel în Gmail, Outlook și pe telefon.
 */

import { COMPANY, WITHDRAWAL_HREF } from './legal'
import { orderDeadline } from './order-deadline'
import { postaSecretaPlanByVariant } from './posta-secreta-plans'
import { absoluteUrl } from './site'

/** Adresa de expeditor. Domeniul trebuie verificat în Resend (Domains). */
export const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM || 'contact@postalunii.ro'
export const EMAIL_FROM_NAME = 'Poșta Lunii'
/** Unde ajung notificările pentru administrator (comenzi noi, retrageri). */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || COMPANY.email

export type Email = { subject: string; html: string; text: string }

const C = {
  paper: '#f6f0e4',
  card: '#fbf7ee',
  line: '#dccbae',
  ink: '#2a2a33',
  muted: '#5b5561',
  night: '#1b1836',
  moon: '#d4a857',
  moonInk: '#7a5a17',
}

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', Arial, sans-serif"

const p = (html: string) =>
  `<p style="margin:0 0 16px;font:16px/1.6 ${SANS};color:${C.ink}">${html}</p>`

const h2 = (text: string) =>
  `<h2 style="margin:28px 0 12px;font:600 18px/1.3 ${SERIF};color:${C.night}">${escapeHtml(text)}</h2>`

/** Tabel „etichetă — valoare”; valorile sunt text simplu (escapate aici). */
function details(rows: Array<[string, string | null | undefined]>) {
  const body = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px 8px 0;vertical-align:top;font:14px/1.5 ${SANS};color:${C.muted};white-space:nowrap">${escapeHtml(label)}</td><td style="padding:8px 0;vertical-align:top;font:15px/1.5 ${SANS};color:${C.ink}">${escapeHtml(value!).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;border-top:1px solid ${C.line};border-bottom:1px solid ${C.line}">${body}</table>`
}

const textDetails = (rows: Array<[string, string | null | undefined]>) =>
  rows
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')

const button = (href: string, label: string, colors: { bg: string; fg: string } = { bg: C.moon, fg: C.ink }) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="background:${colors.bg};border-radius:999px"><a href="${href}" style="display:inline-block;padding:12px 24px;font:600 15px ${SANS};color:${colors.fg};text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`

/** Antetul și nota din subsol diferă între Poșta Lunii și Poșta Secretă; restul cadrului e comun. */
const BRANDS = {
  'posta-lunii': {
    href: '/',
    mark: '☾ Poșta Lunii',
    color: C.night,
    note: 'Din fiecare plic, 15 lei merg către Adăpostul Speranța.<br>',
  },
  'posta-secreta': { href: '/posta-secreta', mark: '✉ Poșta Secretă', color: '#566848', note: '' },
} as const

/** Cadrul comun: antet cu numele, cardul cu conținut, subsol cu datele firmei. */
function layout({
  title,
  preheader,
  body,
  brand = 'posta-lunii',
}: {
  title: string
  preheader: string
  body: string
  brand?: keyof typeof BRANDS
}) {
  const b = BRANDS[brand]
  return `<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="padding:0 0 20px;text-align:center">
      <a href="${absoluteUrl(b.href)}" style="font:italic 600 26px ${SERIF};color:${b.color};text-decoration:none">${b.mark}</a>
    </td></tr>
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:32px 28px">
      <h1 style="margin:0 0 20px;font:600 24px/1.25 ${SERIF};color:${b.color}">${escapeHtml(title)}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:24px 8px 0;text-align:center;font:12px/1.6 ${SANS};color:${C.muted}">
      ${b.note}
      ${escapeHtml(COMPANY.name)} · CUI ${COMPANY.cui} · ${escapeHtml(COMPANY.address)}<br>
      <a href="mailto:${COMPANY.email}" style="color:${C.moonInk}">${COMPANY.email}</a> ·
      <a href="${absoluteUrl('/termeni-si-conditii')}" style="color:${C.moonInk}">Termeni</a> ·
      <a href="${absoluteUrl('/politica-de-confidentialitate')}" style="color:${C.moonInk}">Confidențialitate</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`
}

const TEXT_FOOTER = `\n\n—\nPoșta Lunii · ${COMPANY.name} · CUI ${COMPANY.cui}\n${COMPANY.address}\n${COMPANY.email}`

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('ro-RO', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)

export const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('ro-RO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Bucharest' }).format(date)

// ---------------------------------------------------------------------------
// Comenzi
// ---------------------------------------------------------------------------

export type OrderEmailData = {
  reference: string
  variant: 'lunar' | 'anual-recurent' | 'anual-integral' | null
  variantName: string
  amount: number
  currency: string
  name?: string | null
  email?: string | null
  phone?: string | null
  shippingAddress?: string | null
  createdAt: Date
  stripeSessionId: string
  livemode: boolean
}

/** Ce urmează, pe înțelesul clientului, după varianta cumpărată (conform Termenilor). */
function nextSteps(order: OrderEmailData): string[] {
  const delivery =
    'Plicul fiecărei luni pleacă spre tine la finalul lunii precedente, ca să ajungă la începutul lunii ediției. Dacă ai comandat după ce ediția curentă a fost expediată, primul tău plic pleacă la următoarea expediere.'
  switch (order.variant) {
    case 'lunar':
      return ['Primești ediția lunii următoare, o singură dată, fără alte plăți.', delivery]
    case 'anual-integral':
      return [
        'Ai plătit integral abonamentul de 12 luni: primești 12 ediții consecutive, începând cu ediția lunii următoare. Abonamentul se încheie automat și nu se reînnoiește.',
        delivery,
      ]
    case 'anual-recurent':
      return [
        `Abonamentul tău de 12 luni se plătește lunar: ${formatMoney(order.amount, order.currency)} acum, apoi aceeași sumă retrasă automat de pe card, la aceeași dată a fiecărei luni, 12 plăți în total.`,
        `Poți anula oricând, fără penalități, scriindu-ne la ${COMPANY.email}, înainte de data următoarei plăți.`,
        delivery,
      ]
    default:
      return [delivery]
  }
}

export function orderCustomerEmail(order: OrderEmailData): Email {
  const firstName = order.name?.trim().split(/\s+/)[0]
  const greeting = firstName ? `Bună, ${escapeHtml(firstName)},` : 'Bună,'
  const steps = nextSteps(order)
  const rows: Array<[string, string | null | undefined]> = [
    ['Comanda', order.reference],
    ['Varianta', order.variantName],
    ['Plătit acum', formatMoney(order.amount, order.currency)],
    ['Data', formatDateTime(order.createdAt)],
    ['Livrare la', order.shippingAddress],
  ]

  const html = layout({
    title: 'Mulțumim! Comanda ta e confirmată',
    preheader: `Comanda ${order.reference}: ${order.variantName}, ${formatMoney(order.amount, order.currency)}.`,
    body: [
      p(greeting),
      p(
        'Îți mulțumim că ai ales Poșta Lunii. Plata a fost confirmată, iar plicurile tale încep curând drumul prin poștă. Iar 15 lei din fiecare plic merg către animalele din Adăpostul Speranța. 🐾',
      ),
      details(rows),
      h2('Ce urmează'),
      steps.map((step) => p(escapeHtml(step))).join(''),
      p(
        `Dacă adresa de livrare de mai sus nu e corectă, răspunde la acest email cât mai repede și o corectăm înainte de expediere.`,
      ),
      h2('Dreptul de retragere'),
      p(
        `Te poți retrage din contract în 14 zile de la primirea primului plic, fără să ne spui motivul. Cel mai simplu, din formularul de pe site:`,
      ),
      button(absoluteUrl(WITHDRAWAL_HREF), 'Formularul de retragere'),
      p(`Chitanța plății îți vine separat, de la Stripe. Pentru orice întrebare, răspunde la acest email.`),
      p(`Cu drag,<br>Adina, de la Poșta Lunii`),
    ].join(''),
  })

  const text = [
    `${firstName ? `Bună, ${firstName},` : 'Bună,'}`,
    '',
    'Îți mulțumim că ai ales Poșta Lunii. Plata a fost confirmată.',
    '',
    textDetails(rows),
    '',
    'Ce urmează:',
    ...steps.map((step) => `- ${step}`),
    '',
    'Dacă adresa de livrare nu e corectă, răspunde la acest email cât mai repede.',
    '',
    `Dreptul de retragere: 14 zile de la primirea primului plic. Formular: ${absoluteUrl(WITHDRAWAL_HREF)}`,
    '',
    'Cu drag,\nAdina, de la Poșta Lunii',
  ].join('\n')

  return { subject: `Comanda ta Poșta Lunii e confirmată (${order.reference})`, html, text: text + TEXT_FOOTER }
}

export function orderAdminEmail(order: OrderEmailData, adminUrl: string): Email {
  const rows: Array<[string, string | null | undefined]> = [
    ['Comanda', order.reference],
    ['Varianta', order.variantName],
    ['Încasat', formatMoney(order.amount, order.currency)],
    ['Data', formatDateTime(order.createdAt)],
    ['Nume', order.name],
    ['Email', order.email],
    ['Telefon', order.phone],
    ['Adresa de livrare', order.shippingAddress],
    ['Sesiune Stripe', order.stripeSessionId],
    ['Mod', order.livemode ? 'Live' : 'TEST (Stripe test mode)'],
  ]
  const title = `Comandă nouă: ${order.variantName}`
  const html = layout({
    title,
    preheader: `${order.name ?? 'Client nou'} · ${formatMoney(order.amount, order.currency)}`,
    body: [
      p('A intrat o comandă nouă pe site.'),
      details(rows),
      button(adminUrl, 'Vezi comanda în admin'),
      p(
        `<span style="font-size:14px;color:${C.muted}">Plățile lunare următoare ale abonamentelor nu generează comenzi noi; le vezi în Stripe.</span>`,
      ),
    ].join(''),
  })
  return {
    subject: `[Poșta Lunii] Comandă nouă — ${order.variantName}, ${formatMoney(order.amount, order.currency)}`,
    html,
    text: `A intrat o comandă nouă.\n\n${textDetails(rows)}\n\nAdmin: ${adminUrl}`,
  }
}

// ---------------------------------------------------------------------------
// Comenzi Poșta Secretă (produsele Stripe cu metadata `linie: posta-secreta`)
// ---------------------------------------------------------------------------

/**
 * Unde își schimbă clientul adresa sau își oprește abonamentul: linkul de
 * autentificare al portalului de clienți Stripe (Settings → Billing → Customer
 * portal → „Link”). Fără el, trimitem la adresa de contact.
 */
const CUSTOMER_PORTAL_URL = process.env.STRIPE_CUSTOMER_PORTAL_URL || ''

const MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']

/** Luna primului plic, cu anul: „decembrie 2026”. Același termen ca pe site (order-deadline.ts). */
function firstEditionLabel(createdAt: Date) {
  const { editionMonth } = orderDeadline(createdAt)
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest', year: 'numeric', month: 'numeric' }).formatToParts(createdAt)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value) - 1
  const editionIndex = MONTHS_RO.indexOf(editionMonth)
  return `${editionMonth} ${editionIndex < month ? year + 1 : year}`
}

/** „55 lei”, „660 lei” — fără zecimale inutile. */
const formatLei = (value: number) => `${new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 }).format(value)} lei`

const secretProductName = (order: OrderEmailData) => postaSecretaPlanByVariant(order.variant)?.name ?? order.variantName

export function postaSecretaCustomerEmail(order: OrderEmailData): Email {
  const firstName = order.name?.trim().split(/\s+/)[0]
  const product = secretProductName(order)
  const portal = CUSTOMER_PORTAL_URL
    ? `<a href="${escapeHtml(CUSTOMER_PORTAL_URL)}" style="color:#566848">${escapeHtml(CUSTOMER_PORTAL_URL)}</a>`
    : `<a href="mailto:${COMPANY.email}" style="color:#566848">${COMPANY.email}</a>`
  const portalText = CUSTOMER_PORTAL_URL || COMPANY.email
  const when = 'plicurile lunii următoare pleacă prin Poșta Română în ultima săptămână a lunii curente.'
  const rows: Array<[string, string | null | undefined]> = [
    ['Ce ai ales', product],
    ['Dosarul secret pleacă spre', order.shippingAddress],
    ['Când', when],
  ]
  const tips = (link: string) => [
    'De obicei, plicul ajunge direct în cutia poștală. Uneori poștașul te poate suna sau poate lăsa un aviz, iar plicul se ridică de la oficiul poștal de care aparții.',
    `Dacă vrei să schimbi adresa sau să oprești abonamentul, o poți face oricând de aici: ${link}`,
    'Pentru orice întrebare, răspunde la acest email.',
  ]
  const intro =
    'Îți mulțumesc! Comanda ta a ajuns la Oficiul Poștal al Pădurii Fermecate, iar Vivi a notat deja în registru un nou Ajutor al Poștei Secrete.'
  // Datele comenzii și dreptul de retragere: confirmarea pe suport durabil cerută de lege.
  const legal = `Comanda ${order.reference} · plătit ${formatMoney(order.amount, order.currency)} · ${formatDateTime(order.createdAt)}. Chitanța plății îți vine separat, de la Stripe. Te poți retrage din contract în 14 zile de la primirea primului plic, fără să ne spui motivul:`

  const html = layout({
    brand: 'posta-secreta',
    title: 'Bun venit în Poșta Secretă!',
    preheader: `${product} · Vivi a notat deja în registru un nou Ajutor al Poștei Secrete.`,
    body: [
      p(firstName ? `Bună, ${escapeHtml(firstName)},` : 'Bună,'),
      p(intro),
      details(rows),
      p('Câteva lucruri bune de știut:'),
      // Textele sunt fixe; doar linkul portalului e HTML (escapat mai sus).
      `<ul style="margin:0 0 16px;padding-left:20px">${tips(portal)
        .map((tip) => `<li style="margin:0 0 8px;font:16px/1.6 ${SANS};color:${C.ink}">${tip}</li>`)
        .join('')}</ul>`,
      p(
        `Cu drag,<br>Adina<br>Poșta Secretă · Scrisori din Pădurea Fermecată<br><a href="${absoluteUrl('/')}" style="color:#566848">postalunii.ro</a>`,
      ),
      `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${C.line};font:13px/1.6 ${SANS};color:${C.muted}">${escapeHtml(legal)} <a href="${absoluteUrl(WITHDRAWAL_HREF)}" style="color:${C.muted}">formularul de retragere</a>.</p>`,
    ].join(''),
  })

  const text = [
    firstName ? `Bună, ${firstName},` : 'Bună,',
    '',
    intro,
    '',
    `Ce ai ales: ${product}`,
    ...(order.shippingAddress ? [`Dosarul secret pleacă spre: ${order.shippingAddress.replace(/\n/g, ', ')}`] : []),
    `Când: ${when}`,
    '',
    'Câteva lucruri bune de știut:',
    ...tips(portalText).map((tip) => `• ${tip}`),
    '',
    'Cu drag,\nAdina\nPoșta Secretă · Scrisori din Pădurea Fermecată\npostalunii.ro',
    '',
    `${legal} ${absoluteUrl(WITHDRAWAL_HREF)}`,
  ].join('\n')

  return { subject: 'Bun venit în Poșta Secretă! ✉️', html, text: text + TEXT_FOOTER }
}

export function postaSecretaAdminEmail(order: OrderEmailData, adminUrl: string): Email {
  const product = secretProductName(order)
  const buyer = [order.name, order.email].filter(Boolean).join(', ')
  const rows: Array<[string, string | null | undefined]> = [
    ['Produs', `${product} (${formatLei(order.amount)})`],
    ['Adresa de livrare', order.shippingAddress],
    ['Telefon', order.phone],
    ['Cumpărător', buyer],
    ['Primul plic', firstEditionLabel(order.createdAt)],
    ['Comanda', order.reference],
    ['Mod', order.livemode ? 'Live' : 'TEST (Stripe test mode)'],
  ]
  const html = layout({
    brand: 'posta-secreta',
    title: `Comandă nouă Poșta Secretă: ${product}`,
    preheader: `${order.name ?? 'Client nou'} · ${formatLei(order.amount)}`,
    body: [
      details(rows),
      button(adminUrl, 'Vezi comanda în admin', { bg: '#566848', fg: '#ffffff' }),
      p(
        `<span style="font-size:14px;color:${C.muted}">Plățile lunare următoare ale abonamentelor nu generează comenzi noi; le vezi în Stripe.</span>`,
      ),
    ].join(''),
  })
  return {
    subject: `Comandă nouă Poșta Secretă: ${product}`,
    html,
    text: `${textDetails(rows)}\n\nAdmin: ${adminUrl}`,
  }
}

// ---------------------------------------------------------------------------
// Retrageri din contract
// ---------------------------------------------------------------------------

export type WithdrawalEmailData = {
  reference: string
  submittedAt: string
  name: string
  email: string
  productLabel: string
  contract: string
  address?: string
  message?: string
}

const withdrawalRows = (w: WithdrawalEmailData): Array<[string, string | null | undefined]> => [
  ['Număr de înregistrare', w.reference],
  ['Primită la', w.submittedAt],
  ['Nume', w.name],
  ['Email', w.email],
  ['Produs', w.productLabel],
  ['Identificarea comenzii', w.contract],
  ['Adresa de livrare', w.address],
  ['Mențiuni', w.message],
]

export function withdrawalCustomerEmail(w: WithdrawalEmailData): Email {
  const rows = withdrawalRows(w)
  const html = layout({
    title: 'Am primit declarația ta de retragere',
    preheader: `Număr de înregistrare ${w.reference}`,
    body: [
      p(`Bună, ${escapeHtml(w.name)},`),
      p('Am primit declarația ta de retragere din contract. Acest email este confirmarea de primire.'),
      details(rows),
      p(
        'Îți returnăm toate sumele primite pentru produsele la care te-ai retras, cu aceeași metodă de plată, în cel mult 14 zile de la data de mai sus. Dacă ai primit deja plicuri, te rugăm să le trimiți înapoi în cel mult 14 zile; îți scriem adresa de retur.',
      ),
      p('Pentru orice întrebare, răspunde la acest email.'),
      p('Cu drag,<br>Poșta Lunii'),
    ].join(''),
  })
  return {
    subject: `Confirmare retragere din contract — ${w.reference}`,
    html,
    text:
      `Bună, ${w.name},\n\nAm primit declarația ta de retragere din contract. Acest email este confirmarea de primire.\n\n${textDetails(rows)}\n\n` +
      'Îți returnăm toate sumele primite, cu aceeași metodă de plată, în cel mult 14 zile. Dacă ai primit deja plicuri, te rugăm să le trimiți înapoi în cel mult 14 zile; îți scriem adresa de retur.\n\nCu drag,\nPoșta Lunii' +
      TEXT_FOOTER,
  }
}

export function withdrawalAdminEmail(w: WithdrawalEmailData, adminUrl: string): Email {
  const rows = withdrawalRows(w)
  const html = layout({
    title: 'Retragere nouă din contract',
    preheader: `${w.name} · ${w.reference}`,
    body: [
      p('A fost trimisă o declarație de retragere prin site. Rambursarea trebuie făcută în cel mult 14 zile.'),
      details(rows),
      button(adminUrl, 'Vezi cererea în admin'),
    ].join(''),
  })
  return {
    subject: `[Poșta Lunii] Retragere nouă din contract — ${w.reference}`,
    html,
    text: `A fost trimisă o declarație de retragere prin site.\n\n${textDetails(rows)}\n\nAdmin: ${adminUrl}`,
  }
}
