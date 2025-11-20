import { createMixedConfig } from '@repo/tsup-config'

export default createMixedConfig(
  {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    'cli-simple': 'src/cli-simple.ts',
    'agent/index': 'src/agent/index.ts',
    'agent/cli': 'src/agent/cli.ts',
    'agent/tools': 'src/agent/tools.ts',
    'functions/code': 'src/functions/code.ts',
  },
  {
    esbuildOptions: (options) => {
      options.jsx = 'automatic'
      return options
    },
    external: ['react', 'react-dom', 'ink', 'p-queue'],
  },
)
