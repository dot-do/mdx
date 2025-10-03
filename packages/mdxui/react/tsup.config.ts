import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/marketing/index': 'src/components/marketing/index.ts',
    'components/backgrounds/index': 'src/components/backgrounds/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  external: ['react', 'react-dom', 'framer-motion'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    }
  },
})
