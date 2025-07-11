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
    if (fs.existsSync(userMdxComponents)) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'user-mdx-components': userMdxComponents,
      }
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
