import type { Metadata } from 'next'
import Link from 'next/link'

import { LegalPage, LegalSection, LegalToc } from '@/components/LegalPage'
import { ANSPDCP, COMPANY } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Politica de confidențialitate',
  description:
    'Cum prelucrează Poșta Lunii datele tale personale: ce date colectăm, de ce, cât le păstrăm, cui le transmitem și ce drepturi ai conform GDPR.',
  alternates: { canonical: '/politica-de-confidentialitate' },
}

const SECTIONS = [
  { id: 'operator', title: '1. Cine răspunde de datele tale' },
  { id: 'ce-date', title: '2. Ce date prelucrăm, de ce și pe ce temei' },
  { id: 'destinatari', title: '3. Cui transmitem datele' },
  { id: 'transferuri', title: '4. Transferuri în afara SEE' },
  { id: 'pastrare', title: '5. Cât timp păstrăm datele' },
  { id: 'drepturi', title: '6. Drepturile tale' },
  { id: 'securitate', title: '7. Securitatea datelor' },
  { id: 'altele', title: '8. Alte informații' },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      intro={
        <p>
          Îți explicăm aici, pe înțelesul tuturor, ce date personale folosim când vizitezi site-ul sau cumperi Poșta
          Lunii. Politica respectă Regulamentul (UE) 2016/679 (GDPR) și legislația română privind protecția datelor.
        </p>
      }
    >
      <LegalToc items={SECTIONS} />

      <LegalSection id="operator" title="1. Cine răspunde de datele tale">
        <p>Operatorul datelor tale este:</p>
        <ul>
          <li>
            <b>{COMPANY.name}</b>, cu sediul în {COMPANY.address}
          </li>
          <li>
            CUI {COMPANY.cui}, nr. de ordine în Registrul Comerțului {COMPANY.regCom}, EUID {COMPANY.euid}
          </li>
          <li>
            Email pentru orice întrebare sau cerere privind datele: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </li>
        </ul>
        <p>
          Nu avem obligația de a numi un responsabil cu protecția datelor (DPO). Pentru orice cerere, scrie-ne la adresa de
          mai sus.
        </p>
      </LegalSection>

      <LegalSection id="ce-date" title="2. Ce date prelucrăm, de ce și pe ce temei">
        <div className="pl-legal__table-wrap">
          <table className="pl-legal__table">
            <thead>
              <tr>
                <th scope="col">Situația</th>
                <th scope="col">Ce date</th>
                <th scope="col">De ce</th>
                <th scope="col">Temeiul legal (GDPR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Comanzi un plic sau un abonament</td>
                <td>
                  Nume, adresa de livrare, email, telefon (dacă îl dai), produsul ales, istoricul plăților și al livrărilor
                </td>
                <td>Încheierea și executarea contractului: încasare, expediere, comunicări despre comandă</td>
                <td>Art. 6 alin. (1) lit. b) — executarea contractului</td>
              </tr>
              <tr>
                <td>Plata</td>
                <td>
                  Datele cardului sunt introduse direct la Stripe; noi primim doar informații limitate (de ex. tipul
                  cardului, ultimele 4 cifre, starea plății)
                </td>
                <td>Încasarea plății, plăți recurente, rambursări, prevenirea fraudei</td>
                <td>Art. 6 alin. (1) lit. b) — contract; lit. f) — interes legitim (prevenirea fraudei)</td>
              </tr>
              <tr>
                <td>Evidența contabilă</td>
                <td>Nume, adresă, sume, date ale tranzacțiilor, documente fiscale</td>
                <td>Respectarea obligațiilor fiscale și contabile</td>
                <td>Art. 6 alin. (1) lit. c) — obligație legală</td>
              </tr>
              <tr>
                <td>Ne scrii (email, Instagram) sau trimiți o reclamație</td>
                <td>Numele, datele de contact, conținutul mesajului</td>
                <td>Să-ți răspundem și să rezolvăm cererea</td>
                <td>Art. 6 alin. (1) lit. b) — contract (când ține de comandă); lit. f) — interes legitim</td>
              </tr>
              <tr>
                <td>Te retragi din contract</td>
                <td>Nume, email, identificarea comenzii, adresa, mențiunile tale</td>
                <td>Înregistrarea retragerii, confirmarea de primire, rambursarea</td>
                <td>Art. 6 alin. (1) lit. c) — obligație legală (OUG nr. 34/2014)</td>
              </tr>
              <tr>
                <td>Îți exerciți drepturile GDPR</td>
                <td>Datele din cerere și cele necesare verificării identității</td>
                <td>Să răspundem cererii și să putem dovedi că am făcut-o</td>
                <td>Art. 6 alin. (1) lit. c) — obligație legală</td>
              </tr>
              <tr>
                <td>Vizitezi site-ul</td>
                <td>Adresa IP, tipul de browser, pagina accesată, data și ora (jurnale tehnice ale serverului)</td>
                <td>Funcționarea și securitatea site-ului, prevenirea abuzurilor</td>
                <td>Art. 6 alin. (1) lit. f) — interes legitim</td>
              </tr>
              <tr>
                <td>Accepți cookie-urile de statistică</td>
                <td>
                  Identificatori de cookie, pagini vizitate, durata vizitei, tipul de dispozitiv, locația aproximativă
                  (oraș/țară)
                </td>
                <td>Statistici despre vizite, ca să îmbunătățim site-ul (Google Analytics 4)</td>
                <td>Art. 6 alin. (1) lit. a) — consimțământul tău, pe care îl poți retrage oricând</td>
              </tr>
              <tr>
                <td>Accepți cookie-urile de marketing (Meta Pixel)</td>
                <td>
                  Identificatorii de cookie Meta (<code>_fbp</code>, <code>_fbc</code>), paginile vizitate și acțiunile
                  de pe site (vizualizarea prețurilor, începerea comenzii, cumpărarea, cu varianta și suma plătită),
                  adresa IP și tipul de browser. Dacă cumperi, transmitem și emailul, telefonul, numele, prenumele,
                  orașul, codul poștal și țara, criptate ireversibil (hash SHA-256) înainte de trimitere
                </td>
                <td>
                  Măsurarea eficienței reclamelor noastre pe Facebook și Instagram și afișarea lor către persoane
                  interesate (Meta Pixel și Conversions API)
                </td>
                <td>Art. 6 alin. (1) lit. a) — consimțământul tău, pe care îl poți retrage oricând</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Când prelucrăm date pe temeiul interesului legitim, am verificat că interesul nostru (un site sigur, prevenirea
          fraudei, răspunsuri la mesaje) nu prevalează asupra drepturilor tale. Te poți opune oricând acestor prelucrări.
        </p>
        <p>
          Datele de comandă sunt necesare pentru încheierea contractului: fără ele nu putem încasa plata și nu îți putem
          trimite plicul. Nu vindem datele tale și nu luăm decizii automate (inclusiv profilare) care să producă efecte
          juridice asupra ta. Nu îți trimitem newslettere sau mesaje de marketing fără acordul tău separat.
        </p>
        <p>
          <b>Meta Pixel și Conversions API.</b> Doar dacă accepți cookie-urile de marketing, folosim Meta Pixel, un
          instrument al Meta Platforms Ireland Limited, ca să aflăm dacă reclamele noastre de pe Facebook și Instagram
          aduc vizite și comenzi și ca să le arătăm oamenilor care ar putea fi interesați de Poșta Lunii. Pixelul
          transmite către Meta paginile vizitate și acțiunile de pe site (de exemplu, vizualizarea prețurilor, începerea
          unei comenzi, cumpărarea), împreună cu identificatorii de cookie, adresa IP și tipul de browser. Când plata
          este confirmată, serverul nostru trimite către Meta și evenimentul de cumpărare (Conversions API), cu varianta
          și suma plătită, plus emailul, telefonul, numele, prenumele, orașul, codul poștal și țara, criptate ireversibil
          (hash SHA-256) înainte de trimitere. Meta le folosește ca să potrivească evenimentul cu un cont Facebook sau
          Instagram, dacă există. Plățile recurente lunare nu sunt raportate. Pentru colectarea și transmiterea acestor
          date suntem operatori asociați cu Meta (art. 26 GDPR); prelucrarea ulterioară este responsabilitatea Meta,
          conform{' '}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">
            Politicii de confidențialitate Meta
          </a>{' '}
          și{' '}
          <a href="https://www.facebook.com/legal/controller_addendum" target="_blank" rel="noopener">
            acordului de operator asociat
          </a>
          . Dacă refuzi sau îți retragi acordul din „Setări cookie”, pixelul nu se încarcă (sau se oprește), iar
          comenzile tale nu mai sunt raportate către Meta.
        </p>
      </LegalSection>

      <LegalSection id="destinatari" title="3. Cui transmitem datele">
        <p>Transmitem datele doar atât cât este necesar, către:</p>
        <ul>
          <li>
            <b>Stripe</b> (Stripe Payments Europe, Limited, Irlanda) — procesarea plăților și a abonamentelor. Pentru unele
            prelucrări (de ex. prevenirea fraudei, obligații financiare) Stripe acționează ca operator independent; vezi{' '}
            <a href="https://stripe.com/ro/privacy" target="_blank" rel="noopener">
              politica de confidențialitate Stripe
            </a>
            .
          </li>
          <li>
            <b>Servicii poștale</b> (de regulă Compania Națională Poșta Română S.A.) — numele și adresa de livrare, pentru
            expedierea plicurilor.
          </li>
          <li>
            <b>Vercel Inc.</b> (SUA) — găzduirea site-ului și a jurnalelor tehnice, ca persoană împuternicită.
          </li>
          <li>
            <b>Furnizori de infrastructură</b> pentru baza de date a site-ului și pentru email — ca persoane
            împuternicite, doar pentru a ne furniza serviciul.
          </li>
          <li>
            <b>Google Ireland Limited</b> — Google Analytics 4, doar dacă ai acceptat cookie-urile de statistică.
          </li>
          <li>
            <b>Meta Platforms Ireland Limited</b> — Meta Pixel și Conversions API, doar dacă ai acceptat cookie-urile de
            marketing (operator asociat pentru colectare și transmitere; vezi secțiunea 2).
          </li>
          <li>
            <b>Contabilul</b> sau firma de contabilitate cu care lucrăm — datele din documentele fiscale.
          </li>
          <li>
            <b>Autorități publice</b> (de ex. ANAF, ANPC, instanțe) — doar când legea ne obligă.
          </li>
        </ul>
        <p>
          Cu persoanele împuternicite avem contracte care le obligă să folosească datele doar după instrucțiunile noastre
          și să le protejeze. Adăpostul Speranța nu primește datele tale personale.
        </p>
      </LegalSection>

      <LegalSection id="transferuri" title="4. Transferuri în afara Spațiului Economic European">
        <p>
          Unii furnizori (Vercel, Stripe, Google, Meta) pot prelucra date în Statele Unite. Aceste transferuri se fac pe baza
          deciziei de adecvare a Comisiei Europene pentru Cadrul UE-SUA privind protecția datelor (EU-U.S. Data Privacy
          Framework), pentru furnizorii certificați, și/sau pe baza clauzelor contractuale standard aprobate de Comisia
          Europeană, împreună cu măsuri suplimentare de securitate. Ne poți cere o copie a garanțiilor folosite.
        </p>
      </LegalSection>

      <LegalSection id="pastrare" title="5. Cât timp păstrăm datele">
        <ul>
          <li>
            <b>Datele de comandă și livrare</b> — pe durata contractului și apoi până la 3 ani, termenul general de
            prescripție, pentru eventuale reclamații.
          </li>
          <li>
            <b>Documentele financiar-contabile</b> — pe durata prevăzută de legislația contabilă și fiscală (în prezent, în
            general 5 ani, respectiv 10 ani pentru anumite registre și situații).
          </li>
          <li>
            <b>Declarațiile de retragere și reclamațiile</b> — 3 ani de la soluționare.
          </li>
          <li>
            <b>Mesajele</b> fără legătură cu o comandă — cel mult 1 an de la ultimul schimb de mesaje.
          </li>
          <li>
            <b>Jurnalele tehnice</b> ale serverului — perioade scurte, stabilite de furnizorul de găzduire (de regulă zile
            sau câteva săptămâni).
          </li>
          <li>
            <b>Datele Google Analytics</b> — 14 luni, apoi sunt șterse automat.
          </li>
          <li>
            <b>Cookie-urile Meta</b> (<code>_fbp</code>, <code>_fbc</code>) — 90 de zile în browserul tău; datele
            transmise către Meta sunt păstrate de Meta conform politicii sale.
          </li>
          <li>
            <b>Alegerea ta privind cookie-urile</b> — 6 luni, apoi te întrebăm din nou.
          </li>
        </ul>
        <p>La expirarea acestor termene, datele sunt șterse sau anonimizate.</p>
      </LegalSection>

      <LegalSection id="drepturi" title="6. Drepturile tale">
        <p>Conform GDPR, ai dreptul:</p>
        <ul>
          <li>
            <b>de acces</b> — să afli ce date avem despre tine și să primești o copie;
          </li>
          <li>
            <b>la rectificare</b> — să corectăm datele inexacte sau incomplete;
          </li>
          <li>
            <b>la ștergere</b> — să ștergem datele, când nu mai avem un temei să le păstrăm;
          </li>
          <li>
            <b>la restricționarea prelucrării</b> — de exemplu, cât timp verificăm o contestație;
          </li>
          <li>
            <b>la portabilitate</b> — să primești datele furnizate de tine într-un format structurat, care poate fi citit
            automat;
          </li>
          <li>
            <b>la opoziție</b> — față de prelucrările bazate pe interesul legitim;
          </li>
          <li>
            <b>de a-ți retrage consimțământul</b> oricând (de exemplu, pentru cookie-uri, din „Setări cookie” din josul
            paginii), fără a afecta prelucrarea făcută înainte de retragere;
          </li>
          <li>
            <b>de a depune plângere</b> la {ANSPDCP.name}, {ANSPDCP.address},{' '}
            <a href={ANSPDCP.url} target="_blank" rel="noopener">
              dataprotection.ro
            </a>
            , {ANSPDCP.email}.
          </li>
        </ul>
        <p>
          Pentru a-ți exercita drepturile, scrie-ne la <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Îți
          răspundem gratuit, în cel mult o lună de la primirea cererii (termen care se poate prelungi cu încă două luni
          pentru cereri complexe, caz în care te anunțăm). Putem să-ți cerem informații suplimentare pentru a-ți confirma
          identitatea.
        </p>
      </LegalSection>

      <LegalSection id="securitate" title="7. Securitatea datelor">
        <p>
          Site-ul folosește conexiune criptată (HTTPS). Plățile se fac direct pe infrastructura Stripe, certificată PCI
          DSS. Accesul la panoul de administrare este protejat prin parolă și limitat la persoanele care au nevoie de
          el. Dacă s-ar produce o încălcare a securității datelor care îți pune în pericol drepturile, te vom anunța și
          vom notifica autoritatea, potrivit legii.
        </p>
      </LegalSection>

      <LegalSection id="altele" title="8. Alte informații">
        <p>
          Nu vindem produse persoanelor sub 18 ani și nu colectăm cu bună știință date despre copii. Site-ul conține
          linkuri către alte site-uri (de exemplu Instagram sau Stripe), care au propriile politici de confidențialitate.
        </p>
        <p>
          Despre cookie-uri și Google Analytics găsești detalii în <Link href="/politica-cookies">Politica de
          cookie-uri</Link>. Putem actualiza această politică; data ultimei actualizări este afișată sus, iar modificările
          importante ți le comunicăm și pe email, dacă ești client.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
