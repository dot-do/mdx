import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkFlexibleToc from 'remark-flexible-toc'
import rehypeSlug from 'rehype-slug'

/**
 * Common MDX options for consistent rendering with all available plugins
 */
export const getCommonMDXOptions = () => ({
  parseFrontmatter: true,
  vfileDataIntoScope: 'toc' as const,
  mdxOptions: {
    remarkPlugins: [
      remarkFrontmatter,
      // Remove remark-mdx-frontmatter since next-mdx-remote-client handles frontmatter
      remarkGfm,
      [remarkFlexibleToc, { exportRef: 'toc' }],
    ],
    rehypePlugins: [
      rehypeSlug, // Add proper id attributes to headings for TOC links
    ],
  },
})
