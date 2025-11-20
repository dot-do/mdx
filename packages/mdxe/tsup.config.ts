import { defineConfig } from 'tsup'

export default defineConfig([
  // CLI build without DTS due to React bundling issues
  {
    entry: ['src/cli/index.ts'],
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    external: ['ink', 'react', 'react-dom', 'acorn', 'acorn-jsx', '@mdx-js/esbuild'],
    platform: 'node',
    target: 'node18',
    outDir: 'dist/cli',
    outExtension: () => ({ js: '.js' }),
  },
  // API builds with DTS (excluding test module due to TypeScript dependencies)
  {
    entry: ['src/index.ts', 'src/esbuild/index.ts', 'src/core/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true, // Changed to true to clean the dist directory
    minify: false,
    external: ['next', 'payload', 'esbuild', 'react', 'react-dom', 'ink', 'acorn', 'acorn-jsx', '@mdx-js/esbuild'],
    outDir: 'dist',
    tsconfig: 'tsconfig.api.json',
    onSuccess: 'cp -r src/template dist/ || echo "No template directory found"',
  },
  // Test module build without DTS
  {
    entry: ['src/test/index.ts'],
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false, // Keep false since this runs after the main build
    minify: false,
    external: ['typescript'],
    outDir: 'dist',
  },
])
