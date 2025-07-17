import { build } from 'esbuild'
import fs from 'fs'
import path from 'path'

async function analyzeBuild() {
  console.log('Building with metafile for analysis...')

  const result = await build({
    entryPoints: {
      background: 'src/background.ts',
      content: 'src/content-unified.ts',
    },
    bundle: true,
    format: 'cjs',
    target: 'chrome91',
    outdir: 'dist-analysis',
    minify: true,
    sourcemap: false,
    external: ['chrome'],
    metafile: true,
    treeShaking: true,
  })

  // Write metafile for analysis
  fs.writeFileSync('dist-analysis/metafile.json', JSON.stringify(result.metafile, null, 2))

  console.log('Build complete! Metafile written to dist-analysis/metafile.json')

  // Analyze the metafile
  const metafile = result.metafile

  // Get output file sizes
  console.log('\n📊 Output Files:')
  for (const [file, info] of Object.entries(metafile.outputs)) {
    const size = (info.bytes / 1024 / 1024).toFixed(2)
    console.log(`  ${file}: ${size} MB (${info.bytes.toLocaleString()} bytes)`)
  }

  // Analyze largest inputs
  console.log('\n📦 Largest Input Dependencies:')
  const inputs = Object.entries(metafile.inputs)
    .map(([file, info]) => ({
      file,
      bytes: info.bytes,
      imports: info.imports?.length || 0,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20)

  for (const input of inputs) {
    const size = (input.bytes / 1024).toFixed(1)
    const isNodeModule = input.file.includes('node_modules')
    const emoji = isNodeModule ? '📦' : '📄'
    console.log(`  ${emoji} ${input.file}: ${size} KB (${input.imports} imports)`)
  }

  // Find Shiki-related files
  console.log('\n🎨 Shiki-related files:')
  const shikiFiles = inputs.filter((input) => input.file.includes('shiki') || input.file.includes('textmate') || input.file.includes('vscode'))

  let totalShikiSize = 0
  for (const file of shikiFiles) {
    const size = (file.bytes / 1024).toFixed(1)
    totalShikiSize += file.bytes
    console.log(`  🎨 ${file.file}: ${size} KB`)
  }

  console.log(`\n🎯 Total Shiki-related: ${(totalShikiSize / 1024 / 1024).toFixed(2)} MB`)

  // Language files analysis
  console.log('\n🌐 Language files:')
  const languageFiles = inputs.filter((input) => input.file.includes('/languages/') || input.file.includes('/langs/'))

  let totalLangSize = 0
  for (const file of languageFiles) {
    const size = (file.bytes / 1024).toFixed(1)
    totalLangSize += file.bytes
    const langName = path.basename(file.file, '.mjs')
    console.log(`  🌐 ${langName}: ${size} KB`)
  }

  console.log(`\n🎯 Total Language files: ${(totalLangSize / 1024 / 1024).toFixed(2)} MB`)

  console.log('\n✨ Analysis complete! Check dist-analysis/metafile.json for detailed data.')
}

analyzeBuild().catch(console.error)
