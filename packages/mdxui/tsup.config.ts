import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  external: ['react', 'react-dom', 'motion', '@tremor/react', 'zod'],
  banner: {
    js: '"use client";',
  },
  noExternal: [],
  platform: 'browser',
  target: 'es2020',
})
