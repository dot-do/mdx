import createMDX from '@next/mdx'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkFlexibleToc from 'remark-flexible-toc'
import fs from 'fs'
import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: false,
  },
  // Enable webpack aliases for user MDX components
  webpack: (config, { isServer }) => {
    // Allow importing user's mdx-components.js from process.cwd()
    const userMdxComponents = path.join(process.cwd(), 'mdx-components.js')
    const aliases = {}
    if (fs.existsSync(userMdxComponents)) {
      aliases['user-mdx-components'] = userMdxComponents
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      ...aliases,
    }

    // Handle binary files (.node) properly
    config.module.rules.push({
      test: /\.node$/,
      type: 'asset/resource',
    })

    // Ignore documentation and TypeScript declaration files from node_modules
    config.module.rules.push({
      test: /node_modules.*\.(md|txt|license|readme|d\.ts)$/i,
      type: 'asset/resource',
      generator: {
        emit: false,
      },
    })

    // Specifically exclude problematic libsql files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@libsql/darwin-arm64': false,
      '@libsql/linux-x64-gnu': false,
      '@libsql/win32-x64-msvc': false,
    }

    // Add externals for server-side only packages
    if (isServer) {
      config.externals.push({
        libsql: 'commonjs libsql',
        '@libsql/client': 'commonjs @libsql/client',
      })
    }

    // Exclude Node.js-only dependencies from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        esbuild: false,
      }

      // Exclude esbuild and other problematic modules
      config.externals = config.externals || []
      config.externals.push('esbuild')
    }

    return config
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      // Remove remark-mdx-frontmatter to avoid conflicts with next-mdx-remote-client
      remarkGfm,
      [remarkFlexibleToc, { exportRef: 'toc' }],
    ],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
