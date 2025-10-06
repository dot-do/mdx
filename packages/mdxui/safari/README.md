# @mdxui/safari - Safari Extension for MDX Files

Safari extension for rendering text, Markdown, MDX, and MDXLD files with Monaco Editor and syntax highlighting. Built on top of `@mdxui/browser` with Safari-specific optimizations.

## Features

- **File Format Support** - Renders `.txt`, `.md`, `.mdx`, `.mdxld`, and `.yaml` files
- **Monaco Editor** - Full-featured code editor with IntelliSense
- **Syntax Highlighting** - Powered by Shiki for beautiful code highlighting
- **Live Preview** - Real-time rendering of MDX content
- **Schema.org Support** - Visualizes YAML-LD frontmatter with schema.org types
- **Safari Native** - Optimized for Safari browser extensions API

## Installation

### Development

```bash
pnpm install
pnpm build
```

### Loading in Safari

1. Build the extension: `pnpm build`
2. Open Safari → Settings → Extensions
3. Enable "Allow Unsigned Extensions" (Developer menu)
4. Load the `dist/` directory as an unpacked extension

## Architecture

This package extends `@mdxui/browser` with Safari-specific functionality:

```typescript
import { createBrowserExtension } from '@mdxui/browser'
import { safariConfig } from '@mdxui/safari'

// Safari-specific configuration
const extension = createBrowserExtension(safariConfig)
```

## File Structure

```
safari/
├── src/
│   ├── background.ts          # Safari background script
│   ├── content-unified.ts     # Content script with unified pipeline
│   ├── constants/             # Extension constants
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── manifest.json              # Safari extension manifest
├── dist/                      # Build output
└── package.json
```

## Dependencies

- **@mdxui/browser** - Base browser extension functionality
- **monaco-editor** - Code editor component
- **shiki** - Syntax highlighting engine

## Differences from Chrome Extension

Safari extensions have some differences from Chrome:

1. **Manifest Version** - Uses Safari-specific manifest format
2. **Background Scripts** - Different event model from Chrome
3. **Content Security Policy** - Stricter CSP requirements
4. **File Access** - Different permissions model

## Development

```bash
# Build the extension
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Usage

Once installed, the extension automatically renders MDX files when you navigate to them in Safari:

1. **Direct file access** - Open local `.mdx` files
2. **Web URLs** - View `.mdx` files from GitHub, GitLab, etc.
3. **Inline editor** - Click "Edit" to open Monaco editor

## Configuration

The extension uses the same configuration as `@mdxui/browser`:

```typescript
{
  editor: {
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
  },
  preview: {
    autoRefresh: true,
    showLineNumbers: true,
  }
}
```

## Browser Support

- **Safari 16+** - Full support
- **Safari 15** - Limited support (missing some APIs)
- **Safari 14 and below** - Not supported

## Known Limitations

1. **Large files** - Files over 10MB may impact performance
2. **Complex MDX** - Some advanced MDX features may not render correctly
3. **Network requests** - Limited CORS support compared to Chrome

## Comparison with Other Extensions

| Feature | @mdxui/safari | @mdxui/chrome | @mdxui/browser |
|---------|---------------|---------------|----------------|
| Monaco Editor | ✅ | ✅ | ✅ |
| Syntax Highlighting | ✅ | ✅ | ✅ |
| Live Preview | ✅ | ✅ | ✅ |
| File System Access | Limited | Full | Partial |
| Performance | Good | Excellent | Good |

## License

MIT

## Related Packages

- [@mdxui/browser](../browser) - Base browser extension
- [@mdxui/chrome](../chrome) - Chrome extension variant
- [@mdxui/core](../core) - Core UI components
