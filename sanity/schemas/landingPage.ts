import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroSub',
      title: 'Hero Subheadline',
      type: 'text',
      rows: 2,
      description: 'The paragraph below the main headline',
    }),
    defineField({
      name: 'reviews',
      title: 'Reviews',
      type: 'array',
      of: [{
        type: 'object',
        name: 'review',
        preview: { select: { title: 'author' } },
        fields: [
          defineField({ name: 'title', type: 'string', title: 'Review Title' }),
          defineField({ name: 'body', type: 'text', title: 'Review Body', rows: 3 }),
          defineField({ name: 'author', type: 'string', title: 'Author Name' }),
          defineField({ name: 'date', type: 'string', title: 'Date (e.g. June 2026)' }),
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
    prepare: () => ({ title: 'Landing Page' }),
  },
})
