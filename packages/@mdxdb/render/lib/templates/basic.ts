import type { TweakcnConfig } from '../tweakcn.js'
import type { MdxRenderResult } from '../mdx.js'

/**
 * Basic template - Minimal HTML structure
 */
export interface BasicTemplateOptions {
  title?: string
  description?: string
  lang?: string
  charset?: string
  viewport?: string
  bodyClass?: string
}

export function renderBasicTemplate(
  content: MdxRenderResult,
  config: TweakcnConfig,
  options: BasicTemplateOptions = {}
): string {
  const {
    title = 'MDX Document',
    description = '',
    lang = 'en',
    charset = 'UTF-8',
    viewport = 'width=device-width, initial-scale=1.0',
    bodyClass = '',
  } = options

  const { html, css } = content

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="${charset}">
  <meta name="viewport" content="${viewport}">
  <title>${escapeHtml(title)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  ${css ? `<style>\n${css}\n</style>` : ''}

  <style>
    /* Basic reset and typography */
    body {
      margin: 0;
      padding: 0;
      font-family: ${config.theme?.fonts?.body || 'system-ui'}, -apple-system, sans-serif;
      color: ${config.theme?.colors?.foreground || '#000000'};
      background-color: ${config.theme?.colors?.background || '#ffffff'};
      line-height: 1.6;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
  </style>
</head>
<body class="${bodyClass}">
  <div class="container">
    ${html}
  </div>
</body>
</html>`
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
