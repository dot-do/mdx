import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    background: 'src/background.ts',
    content: 'src/content-unified.ts',
  },
  format: ['cjs'],
  outDir: 'dist',
  dts: false,
  clean: true,
  minify: true, // Enable minification for size reduction
  sourcemap: false, // Disable sourcemaps for production to save ~12MB
  // Self-contained Safari extension scripts - bundle everything except chrome API
  external: ['chrome'],
  outExtension({ format }) {
    return {
      js: `.js`,
    }
  },
  // Bundle Shiki and other dependencies
  noExternal: ['shiki'],
  treeshake: true, // Enable tree-shaking
  splitting: false, // Disable code splitting for Safari extension
})
