// Conținutul paginii Poșta Secretă — text final, aprobat.
// NU reformula, NU adăuga texte, prețuri sau beneficii noi.
// Mută fișierul unde țin proiectul conținutul (ex. src/content/) sau
// inline-uiește textele în componente, dar păstrează-le identice.

export const postaSecreta = {
  meta: {
    title: "Poșta Secretă — Scrisori din Pădurea Fermecată | Poșta Lunii",
    description:
      "Un abonament lunar pentru copii de 5–8 ani: o scrisoare de la Vivi, poștașul Pădurii Fermecate, cu o misiune de rezolvat, livrată prin poștă pe numele copilului tău.",
  },

  hero: {
    wordmark: {
      src: "/posta-secreta/wordmark-verde-auriu.webp",
      alt: "Poșta Secretă din Pădurea Fermecată",
      width: 800,
      height: 382,
    },
    eyebrow: "Pentru copii de 5–8 ani",
    title: "Fiecare lună aduce o misiune nouă din Pădurea Fermecată.",
    subtitle:
      "O dată pe lună, Vivi, poștașul pădurii, îi trimite copilului tău prin poștă o scrisoare și provocări din Pădurea Fermecată.",
    cta: { label: "Trimite-i primul dosar →", href: "#preturi" },
    image: {
      src: "/posta-secreta/plic-si-continut.webp",
      alt: "Plicul Poștei Secrete: scrisoarea de la Vivi, cartonașul de colecție și enigma",
      width: 1164,
      height: 1400,
    },
  },

  contents: {
    title: "Ce găsește copilul în plic",
    // Imaginea are deja săgeți și etichete. Se afișează mare, centrat, exact așa.
    image: {
      src: "/posta-secreta/continutul-plicului-explicat.webp",
      alt: "Conținutul plicului: scrisoarea, cartonașul de colecție, pagina de jurnal și enigma",
      width: 1600,
      height: 1339,
    },
  },

  benefits: {
    eyebrow: "Pentru părinți",
    title: "Ce câștigă copilul tău",
    items: [
      { icon: "puzzle", title: "Logică", text: "Enigme pe măsura vârstei lui" },
      { icon: "moon", title: "Imaginație", text: "O lume în care el e Ajutorul Poștei Secrete" },
      {
        icon: "journal",
        title: "Desen, scris, jocuri, provocări",
        text: "O pagină de jurnal doar a lui (adaptat vârstei: cei mari scriu, cei mici desenează)",
      },
      { icon: "no-screen", title: "Fără ecrane", text: "20–30 de minute de joacă împreună" },
    ],
  },

  band: {
    text: "Poți începe oricând. Fiecare plic e o poveste întreagă.",
    decoration: { src: "/posta-secreta/ciuperci.webp", width: 324, height: 360 },
  },

  about: {
    title: "Cine scrie scrisorile",
    photo: { src: "/posta-secreta/adina-poza.webp", alt: "Adina Slach", width: 800, height: 664 },
    paragraphs: [
      "Sunt Adina Slach, profesor pentru învățământul primar. Lucrez de 10 ani printre copii care pun o mie de întrebări și se luminează la față când primesc o misiune. Am văzut cât de mult învață un copil prin joacă - logica, răbdarea și atenția vin singure dacă îi dai o poveste în care să creadă.",
      "Așa s-a născut Poșta Secretă: o scrisoare dintr-o lume imaginară, pentru el, cu un mister de rezolvat și o pagină de jurnal pentru desen, scris, jocuri și emoții. Fiecare plic e gândit ca o mică lecție, deghizată în joacă.",
    ],
    signature: "Adina",
  },

  pricing: {
    id: "preturi",
    title: "Alege cum vrei să primească scrisorile",
    included: "Livrarea prin poștă e inclusă.",
    single: {
      planKey: "posta-secreta-o-luna",
      title: "O lună",
      subtitle: "Un singur plic",
      price: 60,
      unit: "lei",
      bullets: [
        "Primești ediția lunii următoare, livrată prin Poșta Română, fără cost de transport.",
      ],
      cta: "Aleg o lună →",
      decoration: { src: "/posta-secreta/semiluna.webp", width: 296, height: 300 },
    },
    subscription: {
      title: "Abonament lunar",
      badge: "Cel mai ales",
      toggleLabel: "Cum vrei să plătești?",
      options: {
        lunar: {
          planKey: "posta-secreta-lunar",
          label: "Lunar",
          price: 55,
          unit: "lei / lună",
          sub: "55 lei în fiecare lună, plată recurentă. Se poate opri oricând.",
        },
        integral: {
          planKey: "posta-secreta-integral",
          label: "Integral",
          price: 660,
          unit: "lei",
          sub: "660 lei o singură dată, pentru 12 luni.",
        },
      },
      defaultOption: "lunar" as const,
      bullets: [
        "Primești 12 plicuri și ai 5 lei reducere la fiecare lună. Economisești 60 lei — adică o lună este din partea noastră. 💌",
        "Poți alege: plata integrală, o singură dată — sau plata recurentă, lună de lună. Poți anula oricând.",
        // ATENȚIE: „31 noiembrie” e textul primit, dar noiembrie are 30 de zile — de confirmat cu Ernest.
        "Primul plic: ediția lunii următoare. Comandă până pe 31 noiembrie ca să primești plicul de decembrie.",
      ],
      cta: "Aleg abonamentul →",
    },
    deliveryNote: {
      text: "La plată, completează adresa completă: stradă, număr, bloc, scară, etaj, apartament, localitate, județ și cod poștal. Plicul vine prin Poșta Română, de obicei la cutia poștală. Dacă nu poate fi lăsat acolo, îl poți ridica de la oficiul poștal de care aparții.",
      decoration: { src: "/posta-secreta/arici-cutie-postala.webp", width: 154, height: 360 },
    },
  },
} as const;
