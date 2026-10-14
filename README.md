# Poșta Lunii

Landing page-ul Poșta Lunii, reconstruit în **Next.js 16** (App Router) cu
**Payload CMS 3** pentru editarea textelor. Designul, culorile și animațiile sunt
identice cu macheta din `index.html` — verificate pixel cu pixel.

Scopul paginii rămâne unul singur: abonarea.

---

## Pornire rapidă

```bash
pnpm install
cp .env.example .env          # apoi pune o cheie nouă în PAYLOAD_SECRET
pnpm seed                     # creează baza de date, conținutul și contul de admin
pnpm dev
```

- Site: <http://localhost:3000>
- Administrare: <http://localhost:3000/admin>

Contul creat de seed: `admin@postalunii.ro` / `PostaLunii2026!` —
**schimbă parola la prima autentificare.** Poți alege alte date prin
`SEED_ADMIN_EMAIL` și `SEED_ADMIN_PASSWORD`.

## Comenzi

| Comandă | Ce face |
| --- | --- |
| `pnpm dev` | server de dezvoltare |
| `pnpm build` / `pnpm start` | build și rulare în producție |
| `pnpm seed` | scrie conținutul implicit și creează primul admin (idempotent) |
| `pnpm lint` / `pnpm typecheck` | verificări |
| `pnpm generate:types` | regenerează `src/payload-types.ts` după schimbări în schemă |
| `pnpm generate:importmap` | regenerează import map-ul adminului |
| `node scripts/generate-brand-assets.mjs` | regenerează imaginea OG și icoanele |

---

## Ce se editează din admin

Panoul este în română, la `/admin`.

**Conținut → Pagina principală** — opt taburi, câte unul pentru fiecare secțiune:

1. Hero · 2. Ce găsești în plic · 3. Despre Adina · 4. Donația
5. Prețuri · 6. Închidere · 7. Întrebări (AEO) · 8. Footer

**Site → Meniu** — linkurile din bara de sus și din meniul de mobil.
**Site → Setări site & SEO** — titlu/descriere meta, imagine social, sumă donată, prețuri.
**Conținut → Imagini** — încărcări noi (pozele paginii rămân fișiere statice, vezi mai jos).

După fiecare salvare, pagina publică se reconstruiește imediat
(`src/hooks/revalidate.ts`) — nu aștepți expirarea cache-ului.

### Butoanele de plată

În **Prețuri**, fiecare plan are un câmp **Link checkout**. Acolo se pune URL-ul
de la procesatorul de plăți (Stripe, Netopia, EuPlătesc…). Cât timp rămâne `#`,
butonul nu duce nicăieri, iar în datele structurate oferta trimite către `/#preturi`.

Un plan poate avea și **Variante de plată** (ex. abonamentul de 12 luni: *Lunar* →
link Stripe recurent, *Integral* → link Stripe unic). Cu cel puțin două variante,
cardul afișează un selector, iar butonul urmează alegerea. Pe o bază de date deja
populată, `pnpm seed:plans` rescrie doar planurile din `src/lib/content.ts`.

Butoanele de plată funcționează doar după ce clientul bifează acordul cu Termenii
și condițiile (`src/components/TermsConsent.tsx`).

---

## Conformitate legală (GDPR, consumatori, cookie-uri)

| Ce | Unde |
| --- | --- |
| Datele PFA, emailul de contact, ID-ul GA4, data actualizării | `src/lib/legal.ts` |
| Termeni și condiții (+ formularul model de retragere) | `/termeni-si-conditii` |
| Politica de confidențialitate | `/politica-de-confidentialitate` |
| Politica de cookie-uri | `/politica-cookies` |
| Funcția „Retrage-te din contract aici” (Directiva UE 2023/2673) | `/retragere` → **Comenzi → Retrageri din contract** în admin |
| Banner cookie + Google Analytics 4 | `src/components/CookieConsent.tsx`, `src/lib/consent.ts` |

**Cum merge Google Analytics:** Consent Mode v2 pornește cu totul pe „denied”
(script inline în `<head>`). `gtag.js` se încarcă **doar** după „Accept” — înainte
nu pleacă nicio cerere către Google. „Refuz” are același stil ca „Accept”, iar
alegerea se schimbă oricând din footer („Setări cookie”); retragerea acordului
șterge cookie-urile `_ga`. Alegerea se ține 6 luni în cookie-ul `pl_consent`.
Dacă adaugi cookie-uri opționale noi, crește `CONSENT_VERSION` și actualizează
politica de cookie-uri.

**Retragerea din contract:** cererea se salvează în admin și primește un număr de
înregistrare. Clientul primește confirmarea pe email, iar administratorul o
notificare (prin Resend, `RESEND_API_KEY`).

**Comenzile:** webhook-ul Stripe (`/webhooks/stripe`) salvează fiecare comandă
nouă în admin (Comenzi) și trimite emailurile de confirmare către client și de
notificare către administrator. Plățile lunare următoare ale abonamentelor nu
creează comenzi noi. Șabloanele emailurilor sunt în `src/lib/email.ts`.

Când schimbi un text legal, actualizează `LEGAL_UPDATED` din `src/lib/legal.ts`.

### Secțiunea de întrebări (tabul 7)

Este **dezactivată implicit**, ca pagina să arate exact ca macheta. Când o
activezi din bifa *„Afișează secțiunea în pagină”*:

- apare între Prețuri și Închidere, în același limbaj vizual (serif, linii fine, plus auriu);
- se adaugă automat datele structurate `FAQPage`, pe care le folosesc Google și
  asistenții AI ca să răspundă direct la întrebări despre abonament.

Este cel mai mare câștig de vizibilitate rămas pe masă. Răspunsurile sunt deja
scrise și apar oricum în `/llms.txt`.

---

## Decizii de arhitectură

**Designul stă în cod, textele în CMS.** CSS-ul din machetă a fost preluat
literal, în aceeași ordine a cascadei (`src/styles/tokens.css` + `site.css`).
Rotațiile cartonașelor, variantele de hârtie și ilustrațiile aparțin codului;
în Payload se editează doar cuvintele și linkurile. Așa designul nu se poate
strica dintr-o greșeală de editare.

**Pagina merge și fără bază de date.** `src/lib/content.ts` este singura sursă
de adevăr pentru textele implicite: alimentează valorile din admin, seed-ul și
fallback-ul de la randare. Conținutul din Payload se suprapune peste ele,
ignorând câmpurile goale (`src/lib/payload-content.ts`). Un build curat, înainte
de primul `pnpm seed`, randează pagina corect.

**Animațiile cer cât mai puțin JavaScript.** Macheta le rezolva pe toate dintr-un
script care adăuga clase pe `<html>`. Aici sunt împărțite pe trei nivele, ca
nimic să nu depindă de hidratare mai mult decât trebuie:

- **Stelele** sunt generate pe server, cu același generator cu sămânță fixă ca în
  machetă (`src/lib/stars.ts`): cad în exact aceleași poziții și ajung gata în
  HTML, fără nicio linie de JavaScript în browser.
- **Deschiderea plicului** este o animație CSS pură (`pl-env-in`, `pl-env-open`),
  cu aceleași durate și întârzieri ca originalul. Pornește la prima pictare, deci
  nu se blochează dacă pachetul JavaScript se încarcă greu.
- **Apariția la scroll și logo-ul din header** rulează după hidratare, într-un
  singur component client (`src/components/Motion.tsx`) — sunt oricum sub linia
  de plutire.

Clasa `.pl-js` este randată pe server, direct pe `<html>`. Așa elementele care
urmează să apară sunt ascunse încă de la prima pictare (fără sclipire), iar React
hidratează exact HTML-ul pe care l-a trimis — un script care ar modifica `<html>`
înainte de hidratare ar produce o eroare de hidratare. Pentru vizitatorii fără
JavaScript, un `<noscript>` din layout anulează ascunderea.

**Meniul de mobil** este singura piesă care are nevoie de React
(`src/components/MobileMenu.tsx`): stare, focus capturat, închidere la Escape /
click în afară / alegerea unui link, blocarea scroll-ului. Butonul și panoul stau
în afara `<header>` — când header-ul devine „stuck” capătă `backdrop-filter`,
iar acesta ar deveni bloc de referință pentru orice descendent `position: fixed`
și ar rupe panoul.

**Imaginile rămân fișiere statice** în `public/assets/`, cu aceleași nume. Două
motive: măștile CSS (hârtia ruptă, marginea ruptă) le referă prin `url()`, iar
randarea rămâne identică cu macheta. Trec totuși prin `next/image`, cu `sizes`
setat pe fiecare, deci pe telefon se descarcă variante mici în AVIF/WebP în loc
de fișierele de 150–170 KB.

**Fonturile sunt servite de pe domeniul propriu** prin `next/font` (Fraunces cu
axele SOFT, WONK, opsz; Instrument Sans; Caveat). Zero cereri către
`fonts.googleapis.com`, fără CLS.

**Baza de date este Postgres** (Neon, conectat din Vercel prin `DATABASE_URL`).
Schema se schimbă prin migrări: după ce modifici o colecție sau un global, rulează
`pnpm payload migrate:create nume` și pune fișierul nou din `src/migrations` în
commit. `pnpm build` (deci și deploy-ul din Vercel) rulează întâi migrările. Local, `vercel env pull`
aduce `DATABASE_URL` (atenție: e aceeași bază ca în producție).

---

## SEO / AEO / GEO

| Ce | Unde |
| --- | --- |
| Titlu, descriere, canonical, OG, Twitter, `hreflang` | `src/app/(frontend)/layout.tsx`, editabile în **Setări site & SEO** |
| Date structurate schema.org — un singur graf legat prin `@id`: Organization, Person, WebSite, WebPage, BreadcrumbList, Product cu AggregateOffer (+ FAQPage când e activ) | `src/lib/schema.ts` |
| `robots.txt` — crawlerele AI (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) sunt lăsate să intre explicit | `src/app/robots.ts` |
| `sitemap.xml` cu `lastmod` real, luat din data ultimei salvări | `src/app/sitemap.ts` |
| `llms.txt` și `llms.xml` — rezumatul ofertei pentru asistenții AI, generat din același conținut ca pagina | `src/app/(frontend)/llms.txt`, `llms.xml`, `src/lib/llms.ts` |
| Imagine OG 1200×630, favicon, icoane PWA (inclusiv maskable) | `public/`, generate cu `scripts/generate-brand-assets.mjs` |
| `manifest.webmanifest` | `src/app/manifest.ts` |

Toate se actualizează singure când se schimbă textele din admin.

Pentru staging există bifa **Blochează indexarea** în Setări → SEO: pune
`noindex` în pagină și `Disallow: /` în `robots.txt`.

---

## Înainte de lansare

1. `NEXT_PUBLIC_SITE_URL` cu domeniul real — de el depind canonical, sitemap,
   OG și datele structurate.
2. `PAYLOAD_SECRET` nou (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. Linkurile de checkout în **Prețuri**.
4. Parola contului de admin schimbată.
5. Verifică linkul de Instagram (în brief era marcat „de verificat”).
6. Ia în calcul activarea secțiunii de întrebări.
7. `RESEND_API_KEY` și domeniul expeditorului verificat în Resend (`EMAIL_FROM`,
   implicit `contact@postalunii.ro`) — pentru emailurile de comandă, retragere și
   resetarea parolei de admin. Notificările ajung la `ADMIN_EMAIL`.
8. În Stripe (Settings → Public details / Checkout): URL-urile Termenilor și ale
   Politicii de confidențialitate, plus bifa „Require customers to accept your
   terms of service” pe fiecare Payment Link.
9. În Stripe, abonamentul lunar trebuie să se oprească după 12 plăți (Termenii
   promit asta) — de ex. setează-l să se anuleze automat după 12 cicluri.
10. În Google Analytics: Admin → Data retention → **14 luni** (cât scrie în politică)
    și dezactivează Google Signals.
11. Baza de date de producție trebuie să aibă tabelele noi (variante de plată,
    retrageri) — `push` e oprit în producție.

## Structura

```
src/
  app/
    (frontend)/      pagina publică, llms.txt, llms.xml, 404
    (payload)/       adminul și API-ul Payload (fișiere standard, nu se editează)
    robots.ts  sitemap.ts  manifest.ts
  collections/       Users, Media
  globals/           Landing (8 taburi), Navigation, Settings
  components/        secțiunile paginii + meniul de mobil
  lib/               conținut implicit, citire din Payload, schema.org, llms, stele
  hooks/             revalidare după salvare
  styles/            tokens.css + site.css (CSS-ul machetei, neschimbat)
  seed/              pnpm seed
public/assets/       imaginile machetei
scripts/             generatorul de imagine OG și icoane
```

## Note din brief

- Luna din logo-ul hero rămâne emoji 🌙, ca în machetă — deci arată diferit pe
  iPhone / Android / Windows. Pentru randare identică peste tot, înlocuiește
  `<span className="pl-hero__logomoon">` din `src/components/Hero.tsx` cu
  `<Image src="/assets/moon-crescent.webp" …>`.
- Culorile vin exclusiv din variabilele din `src/styles/tokens.css`. Nu adăuga
  culori în afara lor.
- Clasele păstrează prefixul `pl-`.
