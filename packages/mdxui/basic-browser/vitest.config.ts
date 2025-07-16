import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  assetsInclude: ['**/*.html'],
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    globals: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      all: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.d.ts'],
    },
  },
  esbuild: {
    target: 'es2022',
  },
  resolve: {
    alias: {
      'monaco-editor': path.resolve(__dirname, './test-mocks/monaco-editor.ts'),
      'bun': path.resolve(__dirname, './test-mocks/bun.ts'),
    },
  },
})
