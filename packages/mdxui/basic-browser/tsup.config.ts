import { defineConfig } from 'tsup'

export default defineConfig([
  // ESM build for modern bundlers and React apps
  {
    entry: {
      index: 'src/index.tsx',
    },
    format: ['esm'],
    dts: true,
    clean: true,
    external: ['react', 'react-dom'],
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    treeshake: true,
    target: 'es2020',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    // Include CSS in the bundle
    injectStyle: true,
  },

  // CommonJS build for Node.js compatibility
  {
    entry: {
      index: 'src/index.tsx',
    },
    format: ['cjs'],
    clean: false,
    external: ['react', 'react-dom'],
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    target: 'es2020',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    outExtension: () => ({ js: '.cjs' }),
    injectStyle: true,
  },

  // UMD build for browser extensions (Chrome/Safari)
  {
    entry: {
      index: 'src/index.tsx',
    },
    format: ['iife'],
    globalName: 'MdxuiBasicBrowser',
    clean: false,
    // Don't externalize for UMD build - bundle everything except React
    external: ['react', 'react-dom'],
    outDir: 'dist',
    outExtension: () => ({ js: '.umd.js' }),
    minify: true,
    sourcemap: true,
    target: 'es2020',
    define: {
      'process.env.NODE_ENV': '"production"',
      global: 'globalThis',
    },
    // Bundle Monaco editor for browser extensions
    noExternal: ['monaco-editor'],
    injectStyle: true,
    esbuildOptions: (options) => {
      // Handle Monaco editor workers in browser context
      options.define = {
        ...options.define,
        'process.env': '{}',
        'process.env.NODE_ENV': '"production"',
        global: 'globalThis',
      }
    },
  },
])
