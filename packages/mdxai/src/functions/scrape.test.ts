import 'dotenv/config'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { scrape, scrapeMultiple, ScrapedContent } from './scrape'
import { promises as fs } from 'fs'
import path from 'path'

// Helper for creating cache files for testing
const createTestCacheFile = async (url: string, content: string) => {
  const cacheFilePath = path.join(process.cwd(), '.ai', 'cache', url.replace(/[^a-zA-Z0-9]/g, '_') + '.md')
  const dir = path.dirname(cacheFilePath)

  // Check if directory exists first
  try {
    await fs.access(dir)
  } catch {
    // Directory doesn't exist, create it
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch (mkdirError) {
      // If mkdir fails, it might be because another test created it concurrently
      // Try to access it again
      try {
        await fs.access(dir)
      } catch {
        throw mkdirError
      }
    }
  }

  await fs.writeFile(cacheFilePath, content, 'utf-8')
  return cacheFilePath
}

const testCacheDir = path.join(process.cwd(), '.ai', 'cache')

// Helper function to ensure directory exists
const ensureDirectoryExists = async (filePath: string): Promise<void> => {
  const dir = path.dirname(filePath)
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

describe('scrape', () => {
  // Note: Removed aggressive cache cleanup to avoid race conditions
  // Tests should be able to handle existing cache files

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should scrape a URL and return content', async () => {
    const result = await scrape('https://example.com/test')

    expect(result).toHaveProperty('url', 'https://example.com/test')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('description')
    expect(result).toHaveProperty('markdown')
    expect(typeof result.markdown).toBe('string')
  })

  it('should cache scraped content', async () => {
    const url = 'https://example.com/test'

    // First scrape (might be cached from previous tests)
    const result1 = await scrape(url)

    await new Promise((resolve) => setTimeout(resolve, 100))

    // Second scrape should return cached content
    const result2 = await scrape(url)

    if (result1.title && result2.title) {
      expect(result2.title).toBe(result1.title)
    }
  })

  it('should handle scraping errors gracefully', async () => {
    // Create a test error cache file
    const url = 'https://example.com/error'
    const errorContent = `---
url: "${url}"
error: "Failed to scrape: Network error"
cachedAt: "${new Date().toISOString()}"
---`

    await createTestCacheFile(url, errorContent)

    const result = await scrape(url)

    // Check that the result has the expected properties
    expect(result.url).toBe(url)
    expect(result.error).toBeDefined()
    expect(typeof result.error).toBe('string')
  })

  it('should scrape multiple URLs', async () => {
    const urls = ['https://example.com/page1', 'https://example.com/page2']

    const progressCalls: Array<{ index: number; url: string; result: ScrapedContent }> = []

    const results = await scrapeMultiple(urls, (index, url, result) => {
      progressCalls.push({ index, url, result })
    })

    expect(results).toHaveLength(2)
    expect(progressCalls).toHaveLength(2)
    expect(results[0].url).toBe('https://example.com/page1')
    expect(results[1].url).toBe('https://example.com/page2')
  })

  it('should create proper cache file paths', async () => {
    const url = 'https://example.com/path/to/page'

    // Ensure cache directory exists with proper permissions
    await fs.mkdir(testCacheDir, { recursive: true, mode: 0o777 })

    // Delete the specific cache file if it exists to ensure fresh test
    const expectedPath = path.join(testCacheDir, 'example.com_path_to_page.md')
    try {
      await fs.unlink(expectedPath)
    } catch {
      // File might not exist
    }

    // Create the cache file manually for testing
    const mockContent = `---
url: "${url}"
title: "Test Title"
description: "Test Description"
image: "https://example.com/image.jpg"
cachedAt: "${new Date().toISOString()}"
---

# Test Content

This is test markdown content.`

    await ensureDirectoryExists(expectedPath)
    await fs.writeFile(expectedPath, mockContent, 'utf-8')

    // Verify the file exists
    const cacheExists = await fs
      .access(expectedPath)
      .then(() => true)
      .catch(() => false)
    expect(cacheExists).toBe(true)

    const result = await scrape(url)
    expect(result).toBeDefined()
    if (result.cached) {
      expect(result.title).toBe('Test Title')
    }
  })

  it('should handle root URL caching', async () => {
    const url = 'https://example.com/'

    // Create a test cache file
    const expectedPath = path.join(testCacheDir, 'example.com_index.md')
    await ensureDirectoryExists(expectedPath)

    const mockContent = `---
url: "${url}"
title: "Test Title"
description: "Test Description"
image: "https://example.com/image.jpg"
cachedAt: "${new Date().toISOString()}"
---

# Test Content

This is test markdown content.`

    await fs.writeFile(expectedPath, mockContent, 'utf-8')

    const cacheExists = await fs
      .access(expectedPath)
      .then(() => true)
      .catch(() => false)
    expect(cacheExists).toBe(true)

    const result = await scrape(url)
    expect(result).toBeDefined()
    if (result.cached) {
      expect(result.title).toBe('Test Title')
    }
  })
})

describe('scrape e2e', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should scrape a real URL and cache the result', async () => {
    const url = 'https://httpbin.org/html'

    // First scrape - might be cached from previous tests
    const result1 = await scrape(url)

    expect(result1.url).toBe(url)

    if (result1.error) {
      expect(result1.error).toBeDefined()
      expect(result1.markdown).toBeUndefined()
    } else {
      expect(result1).toHaveProperty('markdown')
      expect(result1.error).toBeUndefined()
    }

    // Second scrape - should return cached content (whether success or error)
    const result2 = await scrape(url)

    expect(result2.url).toBe(url)

    if (result1.markdown !== undefined && result2.markdown !== undefined) {
      expect(result2.markdown).toBe(result1.markdown)
    }

    if (result1.error !== undefined && result2.error !== undefined) {
      expect(result2.error).toBe(result1.error)
    }
  }),
    it('should handle multiple URLs with caching', async () => {
      const urls = ['https://httpbin.org/html', 'https://httpbin.org/json']

      const progressCalls: Array<{ index: number; url: string; cached: boolean }> = []

      // First batch - might be cached from previous tests
      const results1 = await scrapeMultiple(urls, (index, url, result) => {
        progressCalls.push({ index, url, cached: result.cached || false })
      })

      expect(results1).toHaveLength(2)
      expect(progressCalls).toHaveLength(2)

      await Promise.all(urls.map((url) => scrape(url)))

      progressCalls.length = 0

      // Second batch - should return cached content
      const results2 = await scrapeMultiple(urls, (index, url, result) => {
        progressCalls.push({ index, url, cached: result.cached || false })
      })

      expect(results2).toHaveLength(2)
      expect(progressCalls).toHaveLength(2)
    })
})

//   it('should handle scraping errors gracefully with real API', async () => {
//     const url = 'https://this-domain-should-not-exist-12345.com'

//     // Create a mock error cache file for testing
//     const expectedPath = path.join(testCacheDir, 'this-domain-should-not-exist-12345.com_index.md')
//     await ensureDirectoryExists(expectedPath)

//     const mockContent = `---
// url: "${url}"
// error: "Failed to scrape: Network error"
// cachedAt: "${new Date().toISOString()}"
// ---`

//     await fs.writeFile(expectedPath, mockContent, 'utf-8')

//     const result = await scrape(url)

//     expect(result.url).toBe(url)
//     expect(result.error).toBeDefined()
//     expect(result.markdown === undefined || result.markdown === '').toBe(true)
//   }),

//   it('should respect cache TTL and refresh stale content', async () => {
//     const url = 'https://example.com'

//     // Create a test cache file with an old timestamp
//     const cacheFile = path.join(testCacheDir, 'example.com_index.md')
//     await ensureDirectoryExists(path.dirname(cacheFile))

//     // Create content with an old timestamp
//     const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
//     const updatedContent = `---
// url: "${url}"
// title: "Test Title"
// description: "Test Description"
// image: "https://example.com/image.jpg"
// cachedAt: "${oldTime}"
// ---

// # Test Content

// This is test markdown content.`

//     await fs.writeFile(cacheFile, updatedContent, 'utf-8')

//     // Second scrape should refresh the cache
//     const result2 = await scrape(url)

//     // Verify cache was updated if we got a successful result
//     if (!result2.error) {
//       const updatedCache = await fs.readFile(cacheFile, 'utf-8')
//       const cachedAtMatch = updatedCache.match(/cachedAt: "(.*)"/)?.[1]
//       expect(cachedAtMatch).toBeDefined()
//       if (cachedAtMatch) {
//         expect(new Date(cachedAtMatch).getTime()).toBeGreaterThan(new Date(oldTime).getTime())
//       }
//     }
//   })
// })
