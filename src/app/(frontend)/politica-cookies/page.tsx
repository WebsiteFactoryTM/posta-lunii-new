import type { Metadata } from 'next'
import Link from 'next/link'

import { CookieSettingsButton } from '@/components/CookieConsent'
import { LegalPage, LegalSection } from '@/components/LegalPage'
import { COMPANY, CONSENT_COOKIE, GA_MEASUREMENT_ID } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Politica de cookie-uri',
  description:
    'Ce cookie-uri folosește site-ul Poșta Lunii, de ce, cât timp și cum îți poți schimba oricând alegerea, inclusiv pentru Google Analytics 4.',
  alternates: { canonical: '/politica-cookies' },
}

const gaSuffix = GA_MEASUREMENT_ID.replace(/^G-/, '')

export default function CookiesPage() {
  return (
    <LegalPage
      title="Politica de cookie-uri"
      intro={
        <p>
          Folosim cât mai puține cookie-uri. Cele strict necesare funcționează mereu; cele de statistică (Google Analytics)
          și cele de marketing (Meta Pixel) se activează doar dacă le accepți.
        </p>
      }
    >
      <LegalSection id="ce-sunt" title="1. Ce sunt cookie-urile">
        <p>
          Cookie-urile sunt fișiere text mici pe care un site le salvează în browserul tău, ca să-și amintească anumite
          informații între vizite. Tehnologii asemănătoare (de exemplu, stocarea locală a browserului) sunt tratate în
          această politică la fel ca cookie-urile.
        </p>
        <p>
          Folosim cookie-urile potrivit Legii nr. 506/2004 privind prelucrarea datelor cu caracter personal și protecția
          vieții private în sectorul comunicațiilor electronice și Regulamentului (UE) 2016/679 (GDPR). Operatorul este{' '}
          {COMPANY.name}; detaliile de contact sunt în{' '}
          <Link href="/politica-de-confidentialitate">Politica de confidențialitate</Link>.
        </p>
      </LegalSection>

      <LegalSection id="lista" title="2. Ce cookie-uri folosim">
        <h3>Strict necesare — mereu active</h3>
        <p>Fără ele site-ul nu poate funcționa corect. Nu necesită acordul tău (art. 4 alin. (5) din Legea nr. 506/2004).</p>
        <div className="pl-legal__table-wrap">
          <table className="pl-legal__table">
            <thead>
              <tr>
                <th scope="col">Nume</th>
                <th scope="col">Furnizor</th>
                <th scope="col">Scop</th>
                <th scope="col">Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>{CONSENT_COOKIE}</code>
                </td>
                <td>Poșta Lunii</td>
                <td>Reține alegerea ta privind cookie-urile, ca să nu te întrebăm la fiecare pagină.</td>
                <td>6 luni</td>
              </tr>
              <tr>
                <td>
                  <code>payload-token</code>
                </td>
                <td>Poșta Lunii</td>
                <td>Autentificarea în panoul de administrare. Se setează doar pentru administratori, nu pentru vizitatori.</td>
                <td>8 ore</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Statistici — doar cu acordul tău</h3>
        <p>
          Folosim Google Analytics 4 (furnizat de Google Ireland Limited) ca să aflăm câți oameni vizitează site-ul, de unde
          vin și ce pagini îi interesează. Scriptul Google Analytics nu se încarcă deloc până nu accepți — înainte de acord
          nu se trimite nicio informație către Google. Folosim modul de consimțământ Google (Consent Mode v2) cu toate
          semnalele publicitare dezactivate: nu folosim datele pentru reclame și nu le legăm de contul tău Google.
        </p>
        <div className="pl-legal__table-wrap">
          <table className="pl-legal__table">
            <thead>
              <tr>
                <th scope="col">Nume</th>
                <th scope="col">Furnizor</th>
                <th scope="col">Scop</th>
                <th scope="col">Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>_ga</code>
                </td>
                <td>Google</td>
                <td>Deosebește vizitatorii între ei, printr-un identificator aleatoriu.</td>
                <td>2 ani</td>
              </tr>
              <tr>
                <td>
                  <code>_ga_{gaSuffix}</code>
                </td>
                <td>Google</td>
                <td>Păstrează starea sesiunii de vizită.</td>
                <td>2 ani</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Datele colectate prin Google Analytics pot fi transferate în SUA, pe baza Cadrului UE-SUA privind protecția
          datelor și a clauzelor contractuale standard. Detalii:{' '}
          <a href="https://policies.google.com/privacy?hl=ro" target="_blank" rel="noopener">
            politica de confidențialitate Google
          </a>{' '}
          și{' '}
          <a href="https://policies.google.com/technologies/partner-sites?hl=ro" target="_blank" rel="noopener">
            cum folosește Google datele de pe site-urile partenere
          </a>
          .
        </p>

        <h3>Marketing — doar cu acordul tău</h3>
        <p>
          Folosim Meta Pixel (furnizat de Meta Platforms Ireland Limited) ca să măsurăm dacă reclamele noastre de pe
          Facebook și Instagram aduc vizite și comenzi și ca să le arătăm oamenilor interesați. Scriptul Meta nu se
          încarcă deloc până nu accepți cookie-urile de marketing. Cu acordul tău, pixelul transmite către Meta paginile
          vizitate și acțiunile de pe site (vizualizarea prețurilor, începerea unei comenzi, cumpărarea). Detalii despre
          datele transmise, inclusiv la confirmarea plății, găsești în{' '}
          <Link href="/politica-de-confidentialitate">Politica de confidențialitate</Link>.
        </p>
        <div className="pl-legal__table-wrap">
          <table className="pl-legal__table">
            <thead>
              <tr>
                <th scope="col">Nume</th>
                <th scope="col">Furnizor</th>
                <th scope="col">Scop</th>
                <th scope="col">Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>_fbp</code>
                </td>
                <td>Meta</td>
                <td>Deosebește browserele între ele, ca vizitele și comenzile să poată fi atribuite reclamelor.</td>
                <td>90 de zile</td>
              </tr>
              <tr>
                <td>
                  <code>_fbc</code>
                </td>
                <td>Meta</td>
                <td>Reține că ai ajuns pe site dintr-o reclamă Facebook sau Instagram (identificatorul clicului).</td>
                <td>90 de zile</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Datele pot fi transferate în SUA, pe baza Cadrului UE-SUA privind protecția datelor și a clauzelor contractuale
          standard. Detalii:{' '}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">
            politica de confidențialitate Meta
          </a>
          .
        </p>

        <h3>Pagina de plată Stripe</h3>
        <p>
          Când apeși un buton de comandă, ești dus pe pagina de plată Stripe (buy.stripe.com). Acolo, Stripe folosește
          propriile cookie-uri, necesare pentru plată și prevenirea fraudei, sub responsabilitatea sa — vezi{' '}
          <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener">
            politica de cookie-uri Stripe
          </a>
          . Site-ul nostru nu încarcă scripturi Stripe.
        </p>
      </LegalSection>

      <LegalSection id="control" title="3. Cum îți schimbi alegerea">
        <p>
          La prima vizită îți arătăm un banner în care poți accepta sau refuza cookie-urile de statistică și pe cele de
          marketing — ambele variante
          sunt la fel de ușor de ales. Îți poți schimba oricând decizia:
        </p>
        <p>
          <CookieSettingsButton />
        </p>
        <p>
          Dacă îți retragi acordul, oprim Google Analytics, respectiv Meta Pixel, și ștergem cookie-urile{' '}
          <code>_ga</code>, respectiv <code>_fbp</code> și <code>_fbc</code>, de pe acest site. Poți
          șterge sau bloca oricând cookie-urile și din setările browserului; în acest caz bannerul va apărea din nou la
          următoarea vizită. Poți folosi și{' '}
          <a href="https://tools.google.com/dlpage/gaoptout?hl=ro" target="_blank" rel="noopener">
            extensia Google de dezactivare a Analytics
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="modificari" title="4. Modificări">
        <p>
          Dacă adăugăm cookie-uri noi care necesită acordul tău, te vom întreba din nou prin banner. Data ultimei
          actualizări este afișată în partea de sus a paginii.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
