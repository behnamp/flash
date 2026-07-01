import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'plannersPage',
  title: 'Planners Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroSub',
      title: 'Hero Subheadline',
      type: 'text',
      rows: 2,
      description: 'Paragraph below the hero headline',
    }),
    defineField({
      name: 'plans',
      title: 'Plans',
      description: 'Leave empty to use the default plan data from code',
      type: 'array',
      of: [{
        type: 'object',
        name: 'plan',
        preview: { select: { title: 'name', subtitle: 'price' } },
        fields: [
          defineField({ name: 'id', type: 'string', title: 'Plan ID', description: 'Must match Stripe: dj, venue, or agency' }),
          defineField({ name: 'name', type: 'string', title: 'Display Name' }),
          defineField({ name: 'price', type: 'string', title: 'Price (e.g. $39)' }),
          defineField({ name: 'period', type: 'string', title: 'Period (e.g. /mo)' }),
          defineField({ name: 'tagline', type: 'string', title: 'Tagline' }),
          defineField({ name: 'events', type: 'string', title: 'Events limit' }),
          defineField({ name: 'guests', type: 'string', title: 'Guests limit' }),
          defineField({ name: 'highlight', type: 'boolean', title: 'Highlighted (Most Popular)' }),
          defineField({ name: 'badge', type: 'string', title: 'Badge text (leave blank for none)' }),
          defineField({
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{ type: 'string' }],
          }),
        ],
      }],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [{
        type: 'object',
        name: 'testimonial',
        preview: { select: { title: 'author', subtitle: 'role' } },
        fields: [
          defineField({ name: 'quote', type: 'text', title: 'Quote', rows: 3 }),
          defineField({ name: 'author', type: 'string', title: 'Author Name' }),
          defineField({ name: 'role', type: 'string', title: 'Role / Title' }),
        ],
      }],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [{
        type: 'object',
        name: 'faqItem',
        preview: { select: { title: 'q' } },
        fields: [
          defineField({ name: 'q', type: 'string', title: 'Question' }),
          defineField({ name: 'a', type: 'text', title: 'Answer', rows: 3 }),
        ],
      }],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Planners Page' }),
  },
})
