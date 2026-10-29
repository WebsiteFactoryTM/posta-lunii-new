import type { CollectionConfig } from 'payload'

/**
 * Comenzile plătite prin Stripe. Se creează doar din webhook-ul Stripe
 * (`/webhooks/stripe`), o singură dată per sesiune de checkout — adică doar la
 * prima plată; plățile lunare următoare ale abonamentelor rămân în Stripe.
 * Din admin se pot urmări (stare, note) și șterge comenzile de test.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Comandă', plural: 'Comenzi' },
  admin: {
    useAsTitle: 'reference',
    group: 'Comenzi',
    defaultColumns: ['reference', 'productLine', 'name', 'variant', 'amount', 'status', 'createdAt'],
    description: 'Comenzi noi primite prin Stripe. Plățile lunare următoare ale abonamentelor se văd în Stripe.',
  },
  defaultSort: '-createdAt',
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'reference', type: 'text', label: 'Număr comandă', required: true, unique: true, admin: { readOnly: true, width: '50%' } },
        {
          name: 'status',
          type: 'select',
          label: 'Stare',
          defaultValue: 'new',
          admin: { width: '50%' },
          options: [
            { label: 'Nouă', value: 'new' },
            { label: 'Activă / în livrare', value: 'active' },
            { label: 'Finalizată', value: 'done' },
            { label: 'Anulată / rambursată', value: 'cancelled' },
          ],
        },
      ],
    },
    {
      // Din metadata Stripe `linie` (sau din referința butonului de pe site).
      name: 'productLine',
      type: 'select',
      label: 'Produs',
      defaultValue: 'posta-lunii',
      admin: { readOnly: true },
      options: [
        { label: 'Poșta Lunii', value: 'posta-lunii' },
        { label: 'Poșta Secretă', value: 'posta-secreta' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'variant',
          type: 'select',
          label: 'Varianta',
          admin: { readOnly: true, width: '34%' },
          options: [
            { label: 'Lunar (un plic)', value: 'lunar' },
            { label: 'Anual, plată recurentă', value: 'anual-recurent' },
            { label: 'Anual, plată integrală', value: 'anual-integral' },
          ],
        },
        { name: 'amount', type: 'number', label: 'Încasat la comandă', admin: { readOnly: true, width: '33%' } },
        { name: 'currency', type: 'text', label: 'Monedă', admin: { readOnly: true, width: '33%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Nume', admin: { readOnly: true, width: '34%' } },
        { name: 'email', type: 'email', label: 'Email', admin: { readOnly: true, width: '33%' } },
        { name: 'phone', type: 'text', label: 'Telefon', admin: { readOnly: true, width: '33%' } },
      ],
    },
    { name: 'shippingAddress', type: 'textarea', label: 'Adresa de livrare', admin: { readOnly: true } },
    { name: 'notes', type: 'textarea', label: 'Note interne' },
    {
      type: 'collapsible',
      label: 'Detalii tehnice',
      admin: { initCollapsed: true },
      fields: [
        { name: 'stripeSessionId', type: 'text', label: 'Sesiune Stripe', required: true, unique: true, index: true, admin: { readOnly: true } },
        {
          type: 'row',
          fields: [
            { name: 'stripeCustomerId', type: 'text', label: 'Client Stripe', admin: { readOnly: true, width: '50%' } },
            { name: 'stripeSubscriptionId', type: 'text', label: 'Abonament Stripe', admin: { readOnly: true, width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'livemode', type: 'checkbox', label: 'Plată reală (live)', admin: { readOnly: true, width: '34%' } },
            { name: 'customerEmailSent', type: 'checkbox', label: 'Email client trimis', admin: { readOnly: true, width: '33%' } },
            { name: 'adminEmailSent', type: 'checkbox', label: 'Email admin trimis', admin: { readOnly: true, width: '33%' } },
          ],
        },
      ],
    },
  ],
}
