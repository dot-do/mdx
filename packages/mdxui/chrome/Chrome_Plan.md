# Chrome Extension Implementation Plan

## Current State Analysis

### Existing Architecture
The current Chrome package has a solid foundation with these components:

1. **Package Structure**:
   - `background.ts` - Service worker with basic tab management and extension toggle
   - `content.ts` - Content script focused on Monaco editor integration
   - `content-shiki.ts` - NEW: Comprehensive Shiki-based renderer with streaming support
   - `fileDetection.ts` - Robust file type detection for multiple formats
   - `monacoRenderer.ts` - Complex Monaco setup with CSP bypass via `chrome.scripting`
   - `manifest.json` - Well-configured with proper permissions

2. **Current Capabilities**:
   - ✅ File detection (.md, .mdx, .markdown, .txt, various code files)
   - ✅ Monaco editor integration with GitHub Dark theme
   - ✅ CSP bypass using `chrome.scripting` API
   - ✅ Extension enable/disable toggle via background script
   - ✅ Streaming content support (in content-shiki.ts)
   - ✅ Shiki syntax highlighting (in content-shiki.ts)
   - ✅ URL link detection and conversion (in content-shiki.ts)

3. **Key Technical Insights**:
   - The Monaco implementation uses a sophisticated main-world injection pattern to bypass CSP
   - The new Shiki implementation has comprehensive markdown processing with frontmatter support
   - File detection supports a wide range of formats beyond just markdown
   - The extension has proper state management via chrome.storage

## Mode Design Analysis

### Naming Options for Dual Modes

**Option 1: Browse/Edit** (Recommended)
- **Browse Mode**: Natural reading/viewing experience 
- **Edit Mode**: Clear intent for modification
- Pros: Clear distinction, intuitive for users
- Cons: "Browse" might imply navigation rather than viewing

**Option 2: View/Edit**
- **View Mode**: Standard terminology for read-only display
- **Edit Mode**: Clear editing intent
- Pros: Very standard terminology
- Cons: Less distinctive than "browse"

**Option 3: Preview/Draft**
- **Preview Mode**: Implies final rendered output
- **Draft Mode**: Suggests work-in-progress editing
- Pros: Publishing workflow metaphor
- Cons: "Draft" might confuse users (is content saved as draft?)

**Option 4: Render/Source**
- **Render Mode**: Technical but accurate (processed output)
- **Source Mode**: Clear raw content editing
- Pros: Technically precise
- Cons: Too technical for general users

**Recommendation: Browse/Edit** - Most intuitive while being distinctive.

### Control Mechanism Options

**Option 1: Floating Toggle Button** (Recommended)
- Position: Top-right corner, semi-transparent
- Design: GitHub-style toggle switch with icons
- Advantages: Always visible, doesn't interfere with content
- Implementation: CSS fixed positioning with z-index

**Option 2: Extension Popup Integration**
- Add mode toggle to extension's action popup
- Advantages: Integrated with existing extension UI
- Disadvantages: Requires extra click to access

**Option 3: Keyboard Shortcut**
- Cmd/Ctrl + E to toggle modes
- Advantages: Power user friendly, no UI clutter
- Disadvantages: Not discoverable, needs visual indicator

**Option 4: Context Menu**
- Right-click context menu option
- Advantages: Standard browser pattern
- Disadvantages: Hidden, requires right-click

**Recommendation: Floating Toggle Button + Keyboard Shortcut** for best UX.

## Implementation Plan

### Phase 1: Code Integration & Refactoring

#### 1.1 Content Script Architecture
- **Merge content.ts and content-shiki.ts** into a unified system
- Create a `ModeManager` class to handle Browse/Edit switching
- Preserve the Monaco CSP bypass pattern from `monacoRenderer.ts`
- Keep the robust file detection from `fileDetection.ts`

#### 1.2 Mode Management System
```typescript
interface ViewMode {
  type: 'browse' | 'edit'
  renderer: 'shiki' | 'monaco'
}

class ModeManager {
  private currentMode: ViewMode = { type: 'browse', renderer: 'shiki' }
  private content: string = ''
  private container: HTMLElement | null = null
  
  switchMode(mode: ViewMode['type']): Promise<void>
  renderBrowseMode(): Promise<void>  // Uses Shiki
  renderEditMode(): Promise<void>    // Uses Monaco
  addModeToggle(): void             // Floating toggle button
}
```

#### 1.3 Updated Build Configuration
- Update `tsup.config.ts` to handle the merged content script
- Ensure Shiki is properly bundled (it's already a dependency)
- Maintain the existing Monaco injection pattern

### Phase 2: Browse Mode Implementation

#### 2.1 Shiki Integration
- Use the comprehensive processor from `content-shiki.ts`
- Maintain streaming support with `MutationObserver`
- Keep the sophisticated markdown processing with frontmatter
- Preserve the URL link conversion functionality

#### 2.2 Browse Mode Features
- GitHub Dark theme (already implemented in content-shiki.ts)
- Streaming content updates for dynamic files
- Proper HTML block and code block handling
- Clickable links with external navigation
- Auto-scroll for streaming content

#### 2.3 Styling Integration
- Use the comprehensive CSS from `content-shiki.ts`
- Add styles for the mode toggle button
- Ensure consistent theming between Browse and Edit modes

### Phase 3: Edit Mode Implementation

#### 3.1 Monaco Integration
- Adapt the existing Monaco setup from `monacoRenderer.ts`
- Maintain the CSP bypass pattern via `chrome.scripting`
- Preserve the GitHub Dark theme configuration
- Keep the sophisticated error handling

#### 3.2 Edit Mode Features
- Full Monaco editor with syntax highlighting
- Content synchronization between modes
- Save functionality (Cmd/Ctrl + S)
- Language detection based on file type
- Auto-layout on window resize

### Phase 4: Mode Toggle Implementation

#### 4.1 Toggle UI Component
```typescript
class ModeToggle {
  private element: HTMLElement
  private currentMode: ViewMode['type'] = 'browse'
  
  createToggle(): HTMLElement
  attachEventListeners(): void
  updateToggleState(mode: ViewMode['type']): void
  positionToggle(): void  // Fixed top-right positioning
}
```

#### 4.2 Toggle Design
- Icon-based toggle: 👁️ (Browse) / ✏️ (Edit)
- Smooth transition animations
- Keyboard shortcut support (Cmd/Ctrl + E)
- Tooltip with current mode and shortcut hint

#### 4.3 State Persistence
- Remember last used mode per domain/file type
- Use `chrome.storage.local` for persistence
- Respect user preferences across sessions

### Phase 5: Background Script Enhancement

#### 5.1 Extended Background Functionality
- Mode state management across tabs
- Keyboard shortcut registration
- Enhanced extension toggle with mode awareness
- Performance monitoring and error reporting

#### 5.2 Message Passing
```typescript
interface ExtensionMessage {
  type: 'toggleMode' | 'getMode' | 'setMode' | 'initializeMonaco'
  mode?: ViewMode['type']
  tabId?: number
}
```

### Phase 6: Quality & Polish

#### 6.1 Error Handling
- Graceful fallbacks when Shiki fails
- Monaco loading timeout handling
- Content extraction error recovery
- Network error handling for dynamic content

#### 6.2 Performance Optimization
- Lazy loading of Monaco when Edit mode is first accessed
- Debounced rendering for streaming content
- Memory cleanup when switching modes
- Efficient DOM manipulation

#### 6.3 Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management between modes

## Technical Implementation Details

### File Structure Changes
```
src/
├── background.ts              # Enhanced with mode management
├── content.ts                 # Unified content script
├── modes/
│   ├── BrowseMode.ts         # Shiki-based renderer
│   ├── EditMode.ts           # Monaco-based editor
│   └── ModeManager.ts        # Mode switching logic
├── components/
│   └── ModeToggle.ts         # Floating toggle UI
├── utils/
│   ├── fileDetection.ts      # Enhanced file detection
│   ├── monacoRenderer.ts     # Monaco integration utilities
│   └── shikiRenderer.ts     # Shiki processing utilities
└── types/
    └── index.ts              # Shared type definitions
```

### Key Integration Points

1. **Content Synchronization**: Ensure content changes in Edit mode are reflected in Browse mode
2. **Theme Consistency**: Maintain GitHub Dark theme across both modes
3. **Performance**: Lazy load heavy components (Monaco) only when needed
4. **State Management**: Preserve scroll position and user preferences when switching modes
5. **Error Recovery**: Fallback to plain text if both renderers fail

### Dependencies Already Available
- ✅ `shiki: ^3.8.0` - For syntax highlighting
- ✅ `monaco-editor: ^0.52.2` - For editing
- ✅ `@mdxui/browser: workspace:*` - Could provide additional utilities
- ✅ Chrome APIs - Proper permissions already configured

## Next Steps

1. **Phase 1**: Start with code integration - merge content scripts and create ModeManager
2. **Phase 2**: Implement Browse mode using existing Shiki code
3. **Phase 3**: Adapt Monaco integration for Edit mode
4. **Phase 4**: Build the toggle UI component
5. **Phase 5**: Enhance background script for mode management
6. **Phase 6**: Polish, test, and optimize

The existing code provides an excellent foundation - the Shiki implementation is comprehensive and the Monaco integration is sophisticated. The main work is architectural: creating a clean abstraction for mode switching while preserving the robust functionality already built. 
