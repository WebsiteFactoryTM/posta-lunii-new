type Props = { icon: 'puzzle' | 'moon' | 'journal' | 'no-screen' }

/** Iconițele cardurilor „Ce câștigă copilul tău” — copiate exact din macheta aprobată. */
export function BenefitIcon({ icon }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon === 'puzzle' ? (
        <>
          <path d="M17 8h8v5a3 3 0 1 0 6 0V8h9v9h-5a3 3 0 1 0 0 6h5v17H17v-6a3 3 0 1 0-6 0v6" />
          <path d="M17 8v9h-5a3 3 0 1 0 0 6h5" />
        </>
      ) : null}
      {icon === 'moon' ? (
        <>
          <path d="M30 8a14 14 0 1 0 10 22A12 12 0 0 1 30 8z" />
          <circle cx="37" cy="12" r="1.2" fill="currentColor" />
          <circle cx="41" cy="18" r="1.2" fill="currentColor" />
          <circle cx="35" cy="20" r="1.2" fill="currentColor" />
        </>
      ) : null}
      {icon === 'journal' ? (
        <>
          <rect x="9" y="7" width="24" height="34" rx="2.5" />
          <path d="M15 16h12M15 22h12M15 28h7" />
          <path d="M38 14l3 3-11 11-4 1 1-4z" />
        </>
      ) : null}
      {icon === 'no-screen' ? (
        <>
          <rect x="15" y="7" width="18" height="30" rx="3" />
          <path d="M22 33h4" />
          <path d="M9 9l30 30" />
        </>
      ) : null}
    </svg>
  )
}
