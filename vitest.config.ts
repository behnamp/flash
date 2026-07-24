import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Canvas-dependent tests opt into jsdom via a per-file // @vitest-environment comment
    environmentMatchGlobs: [['tests/filterCanvas.test.ts', 'jsdom']],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
