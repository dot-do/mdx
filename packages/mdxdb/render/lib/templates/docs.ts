import type { TweakcnConfig } from '../tweakcn.js'
import type { MdxRenderResult } from '../mdx.js'

/**
 * Documentation template - With sidebar, table of contents, and navigation
 */
export interface DocsTemplateOptions {
  title?: string
  description?: string
  lang?: string
  siteName?: string
  logo?: string
  navigation?: Array<{ title: string; href: string; children?: Array<{ title: string; href: string }> }>
  tableOfContents?: Array<{ level: number; text: string; id: string }>
  editUrl?: string
  showToc?: boolean
  showNav?: boolean
}

export function renderDocsTemplate(
  content: MdxRenderResult,
  config: TweakcnConfig,
  options: DocsTemplateOptions = {}
): string {
  const {
    title = 'Documentation',
    description = '',
    lang = 'en',
    siteName = 'Docs',
    logo,
    navigation = [],
    tableOfContents = [],
    editUrl,
    showToc = true,
    showNav = true,
  } = options

  const { html, css, frontmatter } = content
  const pageTitle = frontmatter?.title || title

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)} | ${escapeHtml(siteName)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  ${css ? `<style>\n${css}\n</style>` : ''}

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ${config.theme?.fonts?.body || 'Inter'}, -apple-system, sans-serif;
      color: ${config.theme?.colors?.foreground || '#1e293b'};
      background-color: ${config.theme?.colors?.background || '#ffffff'};
    }

    .docs-layout {
      display: grid;
      grid-template-columns: ${showNav ? '250px' : '0'} 1fr ${showToc ? '200px' : '0'};
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .docs-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background-color: ${config.theme?.colors?.background || '#ffffff'};
      border-bottom: 1px solid ${config.theme?.colors?.border || '#cbd5e1'};
      padding: 1rem 0;
    }

    .docs-sidebar {
      position: sticky;
      top: 80px;
      height: calc(100vh - 80px);
      overflow-y: auto;
      padding: 2rem 0;
      border-right: 1px solid ${config.theme?.colors?.border || '#cbd5e1'};
    }

    .docs-content {
      padding: 2rem 0;
      min-width: 0;
    }

    .docs-toc {
      position: sticky;
      top: 80px;
      height: calc(100vh - 80px);
      overflow-y: auto;
      padding: 2rem 0;
    }

    .nav-link {
      display: block;
      padding: 0.5rem 1rem;
      color: ${config.theme?.colors?.foreground || '#1e293b'};
      text-decoration: none;
      border-radius: 0.375rem;
      transition: background-color 0.2s;
    }

    .nav-link:hover {
      background-color: ${config.theme?.colors?.muted || '#f1f5f9'};
    }

    .nav-link.active {
      background-color: ${config.theme?.colors?.primary || '#2563eb'};
      color: white;
    }

    .toc-link {
      display: block;
      padding: 0.25rem 0;
      color: ${config.theme?.colors?.mutedForeground || '#64748b'};
      text-decoration: none;
      font-size: 0.875rem;
    }

    .toc-link:hover {
      color: ${config.theme?.colors?.primary || '#2563eb'};
    }

    @media (max-width: 1024px) {
      .docs-layout {
        grid-template-columns: 1fr;
      }

      .docs-sidebar,
      .docs-toc {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="docs-header">
    <div class="docs-layout">
      <div style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          ${logo ? `<img src="${logo}" alt="${siteName}" style="height: 32px;">` : ''}
          <h1 style="margin: 0; font-size: 1.5rem; font-weight: bold; color: ${config.theme?.colors?.primary || '#2563eb'};">
            ${escapeHtml(siteName)}
          </h1>
        </div>
      </div>
    </div>
  </header>

  <!-- Main layout -->
  <div class="docs-layout">
    <!-- Sidebar navigation -->
    ${showNav ? renderNavigation(navigation, config) : ''}

    <!-- Main content -->
    <main class="docs-content">
      ${html}

      ${editUrl ? `
      <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid ${config.theme?.colors?.border || '#cbd5e1'};">
        <a href="${editUrl}" style="color: ${config.theme?.colors?.primary || '#2563eb'}; text-decoration: none;">
          Edit this page
        </a>
      </div>
      ` : ''}
    </main>

    <!-- Table of contents -->
    ${showToc ? renderTableOfContents(tableOfContents, config) : ''}
  </div>

  <script>
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Highlight active TOC item on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
              link.style.color = '${config.theme?.colors?.primary || '#2563eb'}';
              link.style.fontWeight = 'bold';
            }
          });
        }
      });
    }, { rootMargin: '-100px 0px -80% 0px' });

    document.querySelectorAll('[id]').forEach(el => {
      observer.observe(el);
    });
  </script>
</body>
</html>`
}

function renderNavigation(
  navigation: Array<{ title: string; href: string; children?: Array<{ title: string; href: string }> }>,
  config: TweakcnConfig
): string {
  return `
  <nav class="docs-sidebar">
    ${navigation
      .map(
        item => `
      <div style="margin-bottom: 1.5rem;">
        <a href="${item.href}" class="nav-link" style="font-weight: 600;">
          ${escapeHtml(item.title)}
        </a>
        ${
          item.children
            ? `
          <div style="margin-left: 1rem;">
            ${item.children.map(child => `<a href="${child.href}" class="nav-link">${escapeHtml(child.title)}</a>`).join('\n')}
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('\n')}
  </nav>
  `
}

function renderTableOfContents(toc: Array<{ level: number; text: string; id: string }>, config: TweakcnConfig): string {
  return `
  <aside class="docs-toc">
    <h3 style="font-size: 0.875rem; font-weight: 600; text-transform: uppercase; color: ${config.theme?.colors?.mutedForeground || '#64748b'}; margin-bottom: 1rem;">
      On this page
    </h3>
    <nav>
      ${toc
        .map(
          item => `
        <a href="#${item.id}" class="toc-link" style="padding-left: ${(item.level - 1) * 0.75}rem;">
          ${escapeHtml(item.text)}
        </a>
      `
        )
        .join('\n')}
    </nav>
  </aside>
  `
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m] || m)
}
