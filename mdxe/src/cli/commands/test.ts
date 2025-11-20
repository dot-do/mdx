import path from 'node:path'
import { findMdxFiles, extractMdxCodeBlocks } from '../utils/mdx-parser'
import { bundleCodeForTesting, runTestsWithVitest } from '../utils/test-runner'

/**
 * Run tests for MDX files in the project
 */
export async function runTestCommand(cwd: string = process.cwd(), watch: boolean = false): Promise<void> {
  try {
    console.log('🧪 MDXE Test Runner')
    console.log(`📁 Current directory: ${cwd}`)
    console.log('')

    console.log('🔍 Looking for MDX files...')
    const mdxFiles = await findMdxFiles(cwd)
    console.log(`📄 Found ${mdxFiles.length} MDX files:`)
    mdxFiles.forEach((file) => console.log(`  - ${path.relative(cwd, file)}`))

    if (mdxFiles.length === 0) {
      console.log('⚠️ No MDX files found in this directory.')
      return
    }

    let testFilesCount = 0
    let testBlocksCount = 0
    let successCount = 0
    let failureCount = 0
    let skippedCount = 0

    for (const filePath of mdxFiles) {
      try {
        console.log(`\n🔍 Analyzing ${path.relative(cwd, filePath)}...`)
        const { testBlocks, codeBlocks } = await extractMdxCodeBlocks(filePath)

        console.log(`  - Found ${codeBlocks.length} code blocks`)
        console.log(`  - Found ${testBlocks.length} test blocks`)

        if (testBlocks.length === 0) {
          console.log(`  - Skipping (no test blocks)`)
          continue
        }

        testFilesCount++
        testBlocksCount += testBlocks.length

        console.log(`\n📝 Testing ${path.relative(cwd, filePath)} (${testBlocks.length} test blocks)`)

        try {
          console.log('  - Bundling code...')
          const bundledCode = await bundleCodeForTesting(codeBlocks, testBlocks)

          console.log('  - Running tests with Vitest...')
          const { success, output, skipped } = await runTestsWithVitest(bundledCode, filePath, watch)

          if (success) {
            successCount++
            console.log(`✅ Tests passed for ${path.relative(cwd, filePath)}`)
            if (skipped) {
              skippedCount += skipped
              console.log(`⚠️ ${skipped} test blocks were skipped due to syntax errors`)
            }
          } else {
            failureCount++
            console.log(`❌ Tests failed for ${path.relative(cwd, filePath)}`)
            console.log(output)
          }
        } catch (error) {
          console.error(`Error processing ${path.relative(cwd, filePath)}:`, error)
          skippedCount += testBlocks.length
        }
      } catch (error) {
        console.error(`Error parsing ${path.relative(cwd, filePath)}:`, error)
      }
    }

    console.log('\n📊 Test Summary:')
    console.log(`📁 Files with tests: ${testFilesCount}/${mdxFiles.length}`)
    console.log(`🧪 Total test blocks: ${testBlocksCount}`)
    console.log(`✅ Passed: ${successCount}`)
    console.log(`❌ Failed: ${failureCount}`)
    console.log(`⚠️ Skipped: ${skippedCount}`)

    if (failureCount > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('Error running tests:', error)
    process.exit(1)
  }
}
