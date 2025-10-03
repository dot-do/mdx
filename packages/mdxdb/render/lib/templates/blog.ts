import type { TweakcnConfig } from '../tweakcn.js'
import type { MdxRenderResult } from '../mdx.js'

/**
 * Blog template - Optimized for blog posts with author, date, and reading time
 */
export interface BlogTemplateOptions {
  title?: string
  description?: string
  lang?: string
  siteName?: string
  siteUrl?: string
  author?: {
    name: string
    avatar?: string
    bio?: string
    url?: string
  }
  date?: string
  readingTime?: number
  tags?: string[]
  coverImage?: string
  relatedPosts?: Array<{ title: string; href: string; excerpt?: string }>
  showAuthor?: boolean
  showRelated?: boolean
}

export function renderBlogTemplate(
  content: MdxRenderResult,
  config: TweakcnConfig,
  options: BlogTemplateOptions = {}
): string {
  const {
    title = 'Blog Post',
    description = '',
    lang = 'en',
    siteName = 'Blog',
    siteUrl = '',
    author,
    date,
    readingTime,
    tags = [],
    coverImage,
    relatedPosts = [],
    showAuthor = true,
    showRelated = true,
  } = options

  const { html, css, frontmatter } = content
  const pageTitle = frontmatter?.title || title
  const pageDescription = frontmatter?.description || description
  const pageAuthor = frontmatter?.author || author
  const pageDate = frontmatter?.date || date
  const pageTags = frontmatter?.tags || tags
  const pageImage = frontmatter?.coverImage || coverImage

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)} | ${escapeHtml(siteName)}</title>
  ${pageDescription ? `<meta name="description" content="${escapeHtml(pageDescription)}">` : ''}

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(pageDescription)}">
  ${pageImage ? `<meta property="og:image" content="${pageImage}">` : ''}
  <meta property="og:type" content="article">
  ${siteUrl ? `<meta property="og:url" content="${siteUrl}">` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(pageDescription)}">
  ${pageImage ? `<meta name="twitter:image" content="${pageImage}">` : ''}

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  ${css ? `<style>\n${css}\n</style>` : ''}

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ${config.theme?.fonts?.body || 'Georgia'}, serif;
      color: ${config.theme?.colors?.foreground || '#1f2937'};
      background-color: ${config.theme?.colors?.background || '#ffffff'};
      line-height: 1.8;
    }

    .blog-container {
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .blog-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .blog-title {
      font-family: ${config.theme?.fonts?.heading || 'Inter'}, sans-serif;
      font-size: 3rem;
      font-weight: bold;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: ${config.theme?.colors?.foreground || '#1f2937'};
    }

    .blog-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: ${config.theme?.colors?.mutedForeground || '#6b7280'};
      font-size: 0.875rem;
    }

    .blog-cover {
      width: 100%;
      max-height: 500px;
      object-fit: cover;
      border-radius: 0.5rem;
      margin-bottom: 3rem;
    }

    .blog-content {
      font-size: 1.125rem;
    }

    .author-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      margin-top: 3rem;
      background-color: ${config.theme?.colors?.muted || '#f9fafb'};
      border-radius: 0.5rem;
    }

    .author-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 2rem;
    }

    .tag {
      padding: 0.25rem 0.75rem;
      background-color: ${config.theme?.colors?.primary || '#0ea5e9'};
      color: white;
      border-radius: 9999px;
      font-size: 0.875rem;
      text-decoration: none;
    }

    .related-posts {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid ${config.theme?.colors?.border || '#d1d5db'};
    }

    .related-post {
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid ${config.theme?.colors?.border || '#d1d5db'};
      border-radius: 0.5rem;
      text-decoration: none;
      display: block;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .related-post:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .blog-title {
        font-size: 2rem;
      }

      .blog-content {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <article class="blog-container">
    <!-- Header -->
    <header class="blog-header">
      <h1 class="blog-title">${escapeHtml(pageTitle)}</h1>

      ${pageDescription ? `<p style="font-size: 1.25rem; color: ${config.theme?.colors?.mutedForeground || '#6b7280'}; margin-bottom: 1.5rem;">${escapeHtml(pageDescription)}</p>` : ''}

      <div class="blog-meta">
        ${pageDate ? `<time datetime="${pageDate}">${formatDate(pageDate)}</time>` : ''}
        ${readingTime ? `<span>• ${readingTime} min read</span>` : ''}
        ${pageAuthor && typeof pageAuthor === 'object' ? `<span>• ${escapeHtml(pageAuthor.name)}</span>` : ''}
      </div>
    </header>

    <!-- Cover image -->
    ${pageImage ? `<img src="${pageImage}" alt="${escapeHtml(pageTitle)}" class="blog-cover">` : ''}

    <!-- Content -->
    <div class="blog-content">
      ${html}
    </div>

    <!-- Tags -->
    ${
      pageTags.length > 0
        ? `
      <div class="tags">
        ${pageTags.map(tag => `<a href="/tags/${encodeURIComponent(tag)}" class="tag">${escapeHtml(tag)}</a>`).join('\n')}
      </div>
    `
        : ''
    }

    <!-- Author card -->
    ${showAuthor && pageAuthor && typeof pageAuthor === 'object' ? renderAuthorCard(pageAuthor, config) : ''}

    <!-- Related posts -->
    ${showRelated && relatedPosts.length > 0 ? renderRelatedPosts(relatedPosts, config) : ''}
  </article>
</body>
</html>`
}

function renderAuthorCard(
  author: { name: string; avatar?: string; bio?: string; url?: string },
  config: TweakcnConfig
): string {
  return `
  <div class="author-card">
    ${author.avatar ? `<img src="${author.avatar}" alt="${escapeHtml(author.name)}" class="author-avatar">` : ''}
    <div>
      <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">
        ${author.url ? `<a href="${author.url}" style="color: ${config.theme?.colors?.foreground || '#1f2937'}; text-decoration: none;">${escapeHtml(author.name)}</a>` : escapeHtml(author.name)}
      </h3>
      ${author.bio ? `<p style="margin: 0.25rem 0 0; color: ${config.theme?.colors?.mutedForeground || '#6b7280'};">${escapeHtml(author.bio)}</p>` : ''}
    </div>
  </div>
  `
}

function renderRelatedPosts(posts: Array<{ title: string; href: string; excerpt?: string }>, config: TweakcnConfig): string {
  return `
  <section class="related-posts">
    <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem;">Related Posts</h2>
    ${posts
      .map(
        post => `
      <a href="${post.href}" class="related-post">
        <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: ${config.theme?.colors?.foreground || '#1f2937'};">
          ${escapeHtml(post.title)}
        </h3>
        ${post.excerpt ? `<p style="margin: 0.5rem 0 0; color: ${config.theme?.colors?.mutedForeground || '#6b7280'};">${escapeHtml(post.excerpt)}</p>` : ''}
      </a>
    `
      )
      .join('\n')}
  </section>
  `
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
