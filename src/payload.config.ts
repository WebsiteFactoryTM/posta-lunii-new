import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { ro } from '@payloadcms/translations/languages/ro'
import sharp from 'sharp'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Orders } from '@/collections/Orders'
import { Withdrawals } from '@/collections/Withdrawals'
import { Settings } from '@/globals/Settings'
import { Navigation } from '@/globals/Navigation'
import { Landing } from '@/globals/Landing'
import { EMAIL_FROM_ADDRESS, EMAIL_FROM_NAME } from '@/lib/email'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · Poșta Lunii',
    },
  },
  collections: [Users, Media, Orders, Withdrawals],
  globals: [Landing, Navigation, Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  // Postgres (Neon, conectat din Vercel). Schema se schimbă doar prin migrări
  // (src/migrations), rulate o singură dată înainte de build (`pnpm build`).
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    push: false,
  }),
  // Emailuri prin Resend (confirmări de comandă și de retragere). Fără cheie,
  // Payload doar scrie emailurile în consolă.
  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          apiKey: process.env.RESEND_API_KEY,
          defaultFromAddress: EMAIL_FROM_ADDRESS,
          defaultFromName: EMAIL_FROM_NAME,
        }),
      }
    : {}),
  sharp,
  upload: { limits: { fileSize: 8_000_000 } },
  graphQL: { disable: false },
  i18n: { fallbackLanguage: 'ro', supportedLanguages: { ro, en } },
})
