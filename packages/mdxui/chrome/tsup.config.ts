import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    background: 'src/background.ts',
    content: 'src/content.ts',
  },
  format: ['iife'],
  target: 'chrome91',
  outDir: 'dist',
  clean: true,
  minify: false,
  sourcemap: true,
  external: ['chrome', 'react', 'react-dom'],
  esbuildOptions(options) {
    options.external = ['chrome', 'react', 'react-dom', 'react/jsx-runtime']
  },
})
