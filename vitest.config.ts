import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

const env = config({ path: '.env' })

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: env.parsed,
    testTimeout: 300000, // 5 minutes for long-running tests
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/.git/**',
      '**/examples/**/node_modules/**',
      // Exclude deeply nested paths that cause ENAMETOOLONG
      '**/node_modules/.pnpm/node_modules/**',
      '**/examples/minimal/node_modules/**',
    ],
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 4,
        minForks: 1,
      },
    },
    // Workspace projects configuration
    projects: [
      // Root tests
      {
        test: {
          include: ['tests/**/*.test.ts'],
          name: 'tests',
          environment: 'node',
        },
      },
      // Package configurations
      'packages/*/vitest.config.ts',
      'packages/*/*/vitest.config.ts',
      // Examples
      {
        test: {
          include: ['examples/**/test/**/*.test.ts', 'examples/**/*.test.ts'],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.next/**',
            // Specifically exclude problematic nested paths
            '**/examples/minimal/node_modules/**',
            '**/mdxe-esbuild-example/**',
          ],
          name: 'examples',
          environment: 'node',
        },
      },
    ],
  },
})
