/**
 * Termenul de comandă: ce comanzi până la ziua limită a lunii curente primești
 * în plicul lunii următoare. Calculat în ora României.
 */

/**
 * Ziua limită din fiecare lună. `null` = ultima zi a lunii.
 * Pentru o zi fixă (ex. 22), pune numărul: după acea zi, comenzile intră la
 * plicul de peste două luni. Dacă o schimbi, actualizează și Termenii (secțiunea 8).
 */
export const ORDER_DEADLINE_DAY: number | null = null

const MONTHS = [
  'ianuarie',
  'februarie',
  'martie',
  'aprilie',
  'mai',
  'iunie',
  'iulie',
  'august',
  'septembrie',
  'octombrie',
  'noiembrie',
  'decembrie',
]

export type OrderDeadline = {
  /** „Comandă până pe 31 octombrie ca să primești plicul de noiembrie.” */
  text: string
  /** Varianta scurtă, pentru hero: „Comandă până pe 31 octombrie pentru plicul de noiembrie.” */
  short: string
  /** „noiembrie” — luna ediției pe care o primește cine comandă acum. */
  editionMonth: string
}

/** Anul, luna (0–11) și ziua în fusul orar Europe/Bucharest. */
function bucharestToday(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now)
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return { year: get('year'), month: get('month') - 1, day: get('day') }
}

const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

export function orderDeadline(now: Date = new Date()): OrderDeadline {
  const today = bucharestToday(now)
  let year = today.year
  let month = today.month

  const deadlineIn = (y: number, m: number) => Math.min(ORDER_DEADLINE_DAY ?? daysInMonth(y, m), daysInMonth(y, m))

  // A trecut ziua limită (posibil doar cu o zi fixă): termenul e cel de luna viitoare.
  if (today.day > deadlineIn(year, month)) {
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
  }

  const day = deadlineIn(year, month)
  const deadlineMonth = MONTHS[month]
  const editionMonth = MONTHS[(month + 1) % 12]

  return {
    text: `Comandă până pe ${day} ${deadlineMonth} ca să primești plicul de ${editionMonth}.`,
    short: `Comandă până pe ${day} ${deadlineMonth} pentru plicul de ${editionMonth}.`,
    editionMonth,
  }
}
