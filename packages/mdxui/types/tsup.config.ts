import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/marketing/index': 'src/components/marketing/index.ts',
    'components/docs/index': 'src/components/docs/index.ts',
    'components/dashboard/index': 'src/components/dashboard/index.ts',
    'components/chat/index': 'src/components/chat/index.ts',
    'theme/index': 'src/theme/index.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false
})
