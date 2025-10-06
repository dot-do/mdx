#!/usr/bin/env node

import { readFileSync } from 'fs'
import { glob } from 'glob'
import { resolve, relative, dirname } from 'path'

const rootDir = resolve(dirname(new URL(import.meta.url).pathname), '..')

async function checkCircularDependencies() {
  console.log('# Circular Dependency Analysis\n')

  // Find all package.json files
  const packageFiles = await glob('**/package.json', {
    cwd: rootDir,
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  })

  const packages = new Map()
  const graph = new Map()

  // Parse all packages
  for (const file of packageFiles) {
    const fullPath = resolve(rootDir, file)
    const content = JSON.parse(readFileSync(fullPath, 'utf-8'))

    if (content.name) {
      packages.set(content.name, {
        name: content.name,
        path: relative(rootDir, fullPath),
        dependencies: new Set(),
      })

      // Collect workspace dependencies
      const allDeps = { ...content.dependencies, ...content.devDependencies }
      const workspaceDeps = Object.keys(allDeps).filter((dep) => allDeps[dep].startsWith('workspace:'))

      graph.set(content.name, workspaceDeps)
    }
  }

  console.log(`Analyzing ${packages.size} packages...\n`)

  // Check for circular dependencies using DFS
  const visited = new Set()
  const recursionStack = new Set()
  const cycles = []

  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node)
      const cycle = [...path.slice(cycleStart), node]
      cycles.push(cycle)
      return true
    }

    if (visited.has(node)) {
      return false
    }

    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const deps = graph.get(node) || []
    for (const dep of deps) {
      if (packages.has(dep)) {
        dfs(dep, [...path])
      }
    }

    recursionStack.delete(node)
    return false
  }

  // Check each package
  for (const pkgName of packages.keys()) {
    visited.clear()
    recursionStack.clear()
    dfs(pkgName)
  }

  if (cycles.length > 0) {
    console.log(`⚠️  Found ${cycles.length} circular dependencies:\n`)
    cycles.forEach((cycle, i) => {
      console.log(`${i + 1}. ${cycle.join(' → ')}`)
    })
  } else {
    console.log('✅ No circular dependencies found!')
  }
  console.log('')

  // Print dependency depth analysis
  console.log('## Dependency Depth Analysis\n')

  function getDepth(node, visited = new Set()) {
    if (visited.has(node)) return 0
    visited.add(node)

    const deps = graph.get(node) || []
    if (deps.length === 0) return 0

    const depths = deps.map((dep) => (packages.has(dep) ? getDepth(dep, new Set(visited)) : 0))

    return 1 + Math.max(...depths, 0)
  }

  const depths = []
  packages.forEach((pkg, name) => {
    const depth = getDepth(name)
    depths.push({ name, depth })
  })

  depths.sort((a, b) => b.depth - a.depth)

  console.log('### Packages by Dependency Depth:\n')
  const byDepth = {}
  depths.forEach(({ name, depth }) => {
    if (!byDepth[depth]) byDepth[depth] = []
    byDepth[depth].push(name)
  })

  Object.keys(byDepth)
    .sort((a, b) => b - a)
    .forEach((depth) => {
      console.log(`**Depth ${depth}:**`)
      byDepth[depth].forEach((name) => console.log(`  - ${name}`))
      console.log('')
    })

  // Print foundation packages (depth 0)
  console.log('## Foundation Packages (No Internal Dependencies)\n')
  const foundation = depths.filter((d) => d.depth === 0)
  foundation.forEach((pkg) => {
    console.log(`- ${pkg.name}`)
  })
  console.log('')

  // Print dependency fan-out
  console.log('## Most Depended Upon Packages\n')
  const dependents = new Map()
  graph.forEach((deps, pkg) => {
    deps.forEach((dep) => {
      if (packages.has(dep)) {
        if (!dependents.has(dep)) dependents.set(dep, [])
        dependents.get(dep).push(pkg)
      }
    })
  })

  const mostUsed = Array.from(dependents.entries())
    .map(([name, users]) => ({ name, count: users.length, users }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  mostUsed.forEach(({ name, count, users }) => {
    console.log(`- **${name}** (${count} dependents)`)
    console.log(`  ${users.slice(0, 5).join(', ')}${users.length > 5 ? '...' : ''}`)
  })
  console.log('')
}

checkCircularDependencies().catch(console.error)
