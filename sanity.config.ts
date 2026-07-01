import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'flash-cms',
  title: 'Flash CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'not-configured',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})
