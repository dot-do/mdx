#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

// Map of packages that need updating
const updates = {
  // React 19.1.0
  'apps/mdxui.org/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'demo/voice/package.json': {
    'react': '^19.1.0',
    'ink': '^6.0.1',
    '@types/react': '^19.1.0'
  },
  'examples/deck/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'examples/slides/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'examples-archive/agents/package.json': {
    'react': '^19.1.0',
    'ink': '^6.0.1',
    '@types/react': '^19.1.0'
  },
  'examples-archive/cli/package.json': {
    'react': '^19.1.0',
    'ink': '^6.0.1',
    'pastel': '^3.0.0',
    '@types/react': '^19.1.0'
  },
  'packages/mdxai/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    'ink': '^6.0.1',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxdb/fs/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    'ink': '^6.0.1',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxdb/velite/package.json': {
    'vitest': '^3.1.4'
  },
  'packages/mdxe/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    'vitest': '^3.1.4',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxld/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxui/basic-browser/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    'vitest': '^3.1.4',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxui/browser/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxui/core/package.json': {
    'react': '^19.1.0',
    '@types/react': '^19.1.0'
  },
  'packages/mdxui/ink/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxui/magicui/package.json': {
    'react': '^19.1.0',
    '@types/react': '^19.1.0'
  },
  'packages/mdxui/mcp/package.json': {
    'vitest': '^3.1.4'
  },
  'packages/mdxui/package.json': {
    'react': '^19.1.0',
    'motion': '^12.23.3',
    '@types/react': '^19.1.0'
  },
  'packages/mdxui/react/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxui/remotion/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'packages/mdxui/reveal/package.json': {
    'react': '^19.1.0',
    '@types/react': '^19.1.0'
  },
  'packages/mdxui/semantic-mapping/package.json': {
    'react': '^19.1.0',
    '@types/react': '^19.1.0'
  },
  'packages/mdxui/shadcn/package.json': {
    'react': '^19.1.0',
    '@types/react': '^19.1.0'
  },
  'packages/mdxui/types/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  },
  'tests/package.json': {
    'react': '^19.1.0',
    'react-dom': '^19.1.0',
    '@types/react': '^19.1.0',
    '@types/react-dom': '^19.1.0'
  }
}

let updatedCount = 0
let errorCount = 0

console.log('Updating critical dependencies across all packages...\n')

for (const [filePath, deps] of Object.entries(updates)) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const pkg = JSON.parse(content)

    let modified = false

    // Update dependencies
    for (const [depName, targetVersion] of Object.entries(deps)) {
      if (pkg.dependencies && pkg.dependencies[depName]) {
        if (pkg.dependencies[depName] !== targetVersion) {
          console.log(`✓ ${pkg.name}: ${depName} ${pkg.dependencies[depName]} → ${targetVersion}`)
          pkg.dependencies[depName] = targetVersion
          modified = true
        }
      }

      if (pkg.devDependencies && pkg.devDependencies[depName]) {
        if (pkg.devDependencies[depName] !== targetVersion) {
          console.log(`✓ ${pkg.name}: ${depName} ${pkg.devDependencies[depName]} → ${targetVersion}`)
          pkg.devDependencies[depName] = targetVersion
          modified = true
        }
      }

      if (pkg.peerDependencies && pkg.peerDependencies[depName]) {
        if (pkg.peerDependencies[depName] !== targetVersion) {
          console.log(`✓ ${pkg.name}: ${depName} ${pkg.peerDependencies[depName]} → ${targetVersion}`)
          pkg.peerDependencies[depName] = targetVersion
          modified = true
        }
      }
    }

    if (modified) {
      // Write back with proper formatting
      writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
      updatedCount++
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message)
    errorCount++
  }
}

console.log(`\n✅ Updated ${updatedCount} package.json files`)
if (errorCount > 0) {
  console.log(`⚠️  ${errorCount} errors encountered`)
}

console.log('\nRunning pnpm install to update lockfile...')
try {
  execSync('pnpm install', { stdio: 'inherit' })
  console.log('✅ Dependencies installed successfully')
} catch (error) {
  console.error('⚠️  Error running pnpm install:', error.message)
  console.log('Please run "pnpm install" manually to complete the update')
}
