/**
 * Emailurile trimise de site (prin Resend): un cadru comun, în culorile
 * Poștei Lunii, și conținutul fiecărui mesaj. HTML simplu, cu tabele și stiluri
 * inline, ca să arate la fel în Gmail, Outlook și pe telefon.
 */

import { COMPANY, WITHDRAWAL_HREF } from './legal'
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

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="background:${C.moon};border-radius:999px"><a href="${href}" style="display:inline-block;padding:12px 24px;font:600 15px ${SANS};color:${C.ink};text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`

/** Cadrul comun: antet cu numele, cardul cu conținut, subsol cu datele firmei. */
function layout({ title, preheader, body }: { title: string; preheader: string; body: string }) {
  return `<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="padding:0 0 20px;text-align:center">
      <a href="${absoluteUrl('/')}" style="font:italic 600 26px ${SERIF};color:${C.night};text-decoration:none">☾ Poșta Lunii</a>
    </td></tr>
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:32px 28px">
      <h1 style="margin:0 0 20px;font:600 24px/1.25 ${SERIF};color:${C.night}">${escapeHtml(title)}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:24px 8px 0;text-align:center;font:12px/1.6 ${SANS};color:${C.muted}">
      Din fiecare plic, 15 lei merg către Adăpostul Speranța.<br>
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
