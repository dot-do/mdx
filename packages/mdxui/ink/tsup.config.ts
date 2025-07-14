import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'cli-bundler': 'src/cli/bundler.ts',
    'cli/commands/render': 'src/cli/commands/render.ts',
    'cli/commands/bundle': 'src/cli/commands/bundle.ts',
    'cli/commands/workflow': 'src/cli/commands/workflow.ts',
  },
  format: ['esm'], // Only use ESM format since ink is ESM-only
  dts: false, // Use tsc for declaration files due to composite mode issues
  splitting: false,
  sourcemap: true,
  clean: true, // Clean output directory before build
  external: ['react', 'react-dom', 'ink', 'ink-big-text', 'figlet'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
  skipNodeModulesBundle: true,
  noExternal: [],
})
