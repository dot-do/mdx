# @mdxui/chrome - MDX File Viewer Extension

A Chrome extension that transforms how you view Markdown, MDX, and text files by providing rich syntax highlighting and an interactive Monaco editor. Features dual rendering modes: streaming Shiki syntax highlighting for beautiful browsing and Monaco editor for editing capabilities.

## 🌟 Features

### Dual Rendering Modes
- **Browse Mode (Shiki)**: Streaming syntax-highlighted rendering with real-time code block processing
- **Edit Mode (Monaco)**: Full-featured Monaco editor loaded via CDN for editing capabilities
- **Seamless Mode Switching**: Toggle between modes with `Cmd/Ctrl + Shift + L` or the floating toggle button

### File Type Support
- **Markdown**: `.md`, `.markdown` files
- **MDX**: `.mdx` files with embedded JSX
- **Text Files**: `.txt`, `llms.txt`, and other plain text formats
- **Code Files**: `.js`, `.ts`, `.tsx`, `.jsx`, `.json`, `.html`, `.css`, `.scss`, `.yaml`, `.yml`

### Advanced Markdown Processing
- **Streaming Code Blocks**: Real-time syntax highlighting as content loads
- **HTML Block Processing**: Special handling for `<usage>`, `<thinking>`, and other HTML blocks
- **Frontmatter Support**: YAML frontmatter parsing and highlighting
- **Incomplete Block Handling**: Graceful rendering of streaming/incomplete content

### Rich UI Features
- **Auto-scroll**: Intelligent scrolling for streaming content
- **Dark Theme**: GitHub Dark theme for optimal readability
- **Responsive Design**: Adapts to different screen sizes
- **Visual Indicators**: Shows streaming status and incomplete blocks

## 📁 Project Structure

```
src/
├── background.ts           # Service worker - Monaco CDN injection
├── content-unified.ts      # Main content script - dual mode rendering
├── constants/
│   └── index.ts           # Configuration constants
├── types/
│   └── index.ts           # TypeScript type definitions
└── utils/
    ├── chrome-utils.ts    # Chrome extension utilities
    ├── dom-utils.ts       # DOM manipulation helpers
    ├── file-detection.ts  # File type detection logic
    └── monaco-renderer.ts # Monaco editor integration
```

## 🏗️ Architecture

### Mode Architecture
The extension operates in two distinct modes:

1. **Browse Mode (Shiki)**
   - Bundles Shiki (~8.9MB) for offline syntax highlighting
   - Streams content processing for real-time updates
   - Handles incomplete/streaming markdown gracefully
   - Optimized for reading and browsing

2. **Edit Mode (Monaco)**
   - Loads Monaco Editor from CDN (0 bundle impact)
   - Full editing capabilities with IntelliSense
   - Cross-world communication between isolated and main contexts
   - Optimized for editing and code manipulation

### Content Script Communication
- **Isolated World**: Extension context with Shiki bundled
- **Main World**: Page context with Monaco loaded via CDN
- **Cross-World Events**: Custom events for Monaco editor control
- **Background Script**: Handles Monaco CDN injection and tab management

### File Detection Strategy
- **URL-based**: Detects file extensions and patterns
- **MIME-type**: Validates content types for accuracy
- **Special Cases**: Handles `llms.txt` and direct file access
- **Website Protection**: Only activates on actual files, not regular websites

## 🚀 Usage

### Installation
1. Build the extension:
   ```bash
   cd packages/mdxui/chrome
   pnpm install
   pnpm build
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### File Access
Enable file access in Chrome extension settings to view local files:
1. Go to `chrome://extensions/`
2. Find "@mdxui/chrome - MDX File Viewer"
3. Click "Details"
4. Enable "Allow access to file URLs"

### Keyboard Shortcuts
- **`Cmd/Ctrl + Shift + L`**: Toggle between Browse and Edit modes
- **Auto-scroll**: Automatically follows streaming content (can be disabled by scrolling manually)

### Mode Switching
- **Toggle Button**: Floating button in top-right corner
- **Visual Indicators**: 
  - 👁️ Browse mode (Shiki rendering)
  - ✏️ Edit mode (Monaco editor)

## 🔧 Configuration

### Build Configurations

#### Standard Build (`pnpm build`)
- **Target**: `chrome91`
- **Output**: `dist/`
- **Bundle Size**: ~8.9MB (includes Shiki)
- **Minification**: Enabled
- **Tree-shaking**: Enabled

#### CDN Build (`pnpm build:cdn`)
- **Target**: CDN-optimized version
- **Output**: `dist-cdn/`
- **Monaco**: Loaded externally via CDN
- **Shiki**: Still bundled for streaming capabilities

### Environment Variables
```typescript
// Monaco CDN Configuration
MONACO_CDN_VERSION = '0.45.0'
MONACO_CDN_BASE = 'https://unpkg.com/monaco-editor@0.45.0/min/vs'

// Rendering Settings
RENDER_DEBOUNCE_MS = 50        // Streaming render delay
SCROLL_THRESHOLD_PX = 50       // Auto-scroll sensitivity
MONACO_INIT_TIMEOUT_MS = 10000 // Monaco load timeout
```

## 🎨 Themes and Styling

### Shiki Theme
- **Default**: `github-dark`
- **Fallback**: Text rendering with monospace font
- **Custom CSS**: Responsive typography and spacing

### Monaco Theme
- **Base**: `vs-dark`
- **Custom**: GitHub Dark color scheme
- **Features**: Line highlighting, selection, cursor styling

## 🔍 Bundle Analysis

Use the included analyzer to understand bundle composition:

```bash
pnpm analyze
```

This generates:
- **Metafile**: Detailed dependency analysis
- **Size Report**: Per-file size breakdown
- **Largest Dependencies**: Top contributors to bundle size

## 📊 Performance Metrics

### Current Bundle Sizes
- **Background Script**: ~7.43 KB
- **Content Script**: ~8.87 MB (includes Shiki)
- **Total Extension**: ~8.9 MB

### Optimization Opportunities

#### 1. **Lazy Loading Strategies**
```typescript
// Dynamic Shiki import for specific languages
const { codeToHtml } = await import('shiki/bundle/web')
```

#### 2. **Language Subsetting**
```typescript
// Bundle only required languages
import { getHighlighter } from 'shiki/bundle/web'
const highlighter = await getHighlighter({
  themes: ['github-dark'],
  langs: ['javascript', 'typescript', 'markdown', 'json']
})
```

#### 3. **Tree-shaking Improvements**
```typescript
// More specific Shiki imports
import { codeToHtml } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine-oniguruma'
```

#### 4. **CDN Strategy for Shiki**
Consider implementing Shiki CDN loading similar to Monaco:
```typescript
// Potential CDN approach
const shiki = await loadShikiFromCDN({
  themes: ['github-dark'],
  langs: detectRequiredLanguages(content)
})
```

#### 5. **Service Worker Caching**
```typescript
// Cache frequently used themes/languages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('shiki-cache').then(cache => 
      cache.addAll(['/themes/github-dark.json'])
    )
  )
})
```

#### 6. **Incremental Loading**
```typescript
// Load languages on-demand
const loadLanguage = async (lang: string) => {
  if (!loadedLanguages.has(lang)) {
    await highlighter.loadLanguage(lang)
    loadedLanguages.add(lang)
  }
}
```

## 🐛 Debugging

### Console Output
The extension provides detailed logging:
- **Initialization**: Setup and file detection
- **Mode Switching**: Transition states and errors
- **Rendering**: Shiki processing and Monaco operations
- **Communication**: Cross-world message passing

### Common Issues
1. **Monaco Load Failures**: Check network connectivity and CDN availability
2. **File Detection**: Verify file extensions and MIME types
3. **Streaming Issues**: Monitor console for Shiki processing errors
4. **Cross-World Communication**: Check for Content Security Policy conflicts

## 🧪 Development

### Local Development
```bash
# Watch mode with auto-rebuild
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Bundle analysis
pnpm analyze
```

### Testing Strategy
- **Manual Testing**: Load various file types and test mode switching
- **Performance Testing**: Monitor memory usage and render times
- **Cross-Browser**: Test Monaco CDN loading across different networks

## 📈 Future Enhancements

### Short-term
- **Progressive Language Loading**: Load Shiki languages on-demand
- **Theme Customization**: User-configurable themes
- **Performance Monitoring**: Built-in performance metrics

### Long-term
- **Split Architecture**: Separate Shiki and Monaco into optional features
- **Cloud Highlighting**: Server-side syntax highlighting for ultra-light client
- **AI Integration**: LLM-powered code explanation and documentation
- **Multi-file Support**: Side-by-side file comparison

## 📄 License

MIT - See [LICENSE](../../../LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

**Bundle Size Note**: The current 8.9MB size is primarily due to Shiki's comprehensive language support. Consider the optimization strategies above for production deployments requiring smaller bundle sizes. 
