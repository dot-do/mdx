#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const rootDir = process.cwd()

// Critical dependencies to check
const criticalDeps = {
  react: '^19.1.0',
  'react-dom': '^19.1.0',
  motion: '^12.23.3',
  ink: '^6.0.1',
  vitest: '^3.1.4',
  pastel: '^3.0.0',
}

function findPackageJsonFiles(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
      continue
    }

    if (entry.isDirectory()) {
      findPackageJsonFiles(fullPath, files)
    } else if (entry.name === 'package.json') {
      files.push(fullPath)
    }
  }

  return files
}

function analyzePackages() {
  const packageFiles = findPackageJsonFiles(rootDir)
  const results = {}

  for (const depName in criticalDeps) {
    results[depName] = {
      target: criticalDeps[depName],
      outdated: [],
      upToDate: [],
      notUsed: []
    }
  }

  for (const pkgPath of packageFiles) {
    try {
      const content = readFileSync(pkgPath, 'utf8')
      const pkg = JSON.parse(content)
      const relativePath = pkgPath.replace(rootDir + '/', '')

      for (const depName in criticalDeps) {
        const targetVersion = criticalDeps[depName]
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
          ...pkg.peerDependencies
        }

        if (allDeps[depName]) {
          const currentVersion = allDeps[depName]

          if (currentVersion === targetVersion || currentVersion === 'workspace:*') {
            results[depName].upToDate.push({
              path: relativePath,
              name: pkg.name,
              version: currentVersion
            })
          } else {
            results[depName].outdated.push({
              path: relativePath,
              name: pkg.name,
              current: currentVersion,
              target: targetVersion
            })
          }
        }
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  return results
}

function printResults(results) {
  console.log('# Critical Dependency Status\n')

  for (const [depName, data] of Object.entries(results)) {
    const outdatedCount = data.outdated.length
    const upToDateCount = data.upToDate.length
    const total = outdatedCount + upToDateCount

    console.log(`## ${depName}`)
    console.log(`Target version: ${data.target}`)
    console.log(`Status: ${upToDateCount}/${total} packages up to date\n`)

    if (outdatedCount > 0) {
      console.log(`### Packages needing update (${outdatedCount}):\n`)
      for (const pkg of data.outdated) {
        console.log(`- **${pkg.name}** (${pkg.path})`)
        console.log(`  Current: ${pkg.current} → Target: ${pkg.target}`)
      }
      console.log()
    }

    if (upToDateCount > 0 && outdatedCount > 0) {
      console.log(`### Already up to date (${upToDateCount}):\n`)
      for (const pkg of data.upToDate.slice(0, 5)) {
        console.log(`- ${pkg.name} (${pkg.version})`)
      }
      if (upToDateCount > 5) {
        console.log(`- ... and ${upToDateCount - 5} more`)
      }
      console.log()
    }

    console.log('---\n')
  }
}

const results = analyzePackages()
printResults(results)
