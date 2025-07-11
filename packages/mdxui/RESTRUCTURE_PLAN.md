# MDXUI Restructure Plan

<!-- Keep it by UI/Tech Package -->

## Overview

Transform the current chaotic mdxui package structure into a clean, maintainable, and extensible component system with separate packages for different environments and a powerful component registry.

## Current State Problems

- **Architectural Chaos**: Mixed purposes (web UI, terminal UI, browser extensions, slides, video)
- **Build System Inconsistencies**: Different tsup configs, TypeScript configurations
- **Dependency Management**: Circular dependencies, inconsistent React versions
- **Import/Export Mess**: Broken namespacing, direct file imports
- **Purpose Confusion**: No clear separation of concerns

## Target Architecture

### Package Structure

```
packages/
├── mdxui/                    # Meta-package (convenience imports)
├── mdxui-web/               # @mdxui/web - All web components, utilities, and types
├── mdxui-terminal/          # @mdxui/terminal - All terminal components, utilities, and types
├── mdxui-registry/          # @mdxui/registry - Component registry system
├── mdxui-extensions/        # @mdxui/extensions - Browser extensions
└── mdxui-integrations/      # @mdxui/integrations - Framework integrations
```

### Package Responsibilities

#### `@mdxui/web`

- **Purpose**: Complete web ecosystem for React DOM components
- **Contents**:
  - Basic components (Button, Card, Input, etc.)
  - Styled components (shadcn-ui integration)
  - Animated components (magicui integration)
  - Chart components (Tremor integration)
  - Layout components
  - Web-specific utilities (DOM helpers, CSS utilities)
  - Web-specific types (component props, styling types)
  - Design tokens and theming system
- **Dependencies**: React DOM, Tailwind, Motion, Tremor
- **Structure**:
  ```
  src/
  ├── components/
  │   ├── base/           # Unstyled headless components
  │   ├── styled/         # Styled variants (shadcn-ui)
  │   ├── animated/       # Motion components (magicui)
  │   ├── charts/         # Data visualization (Tremor)
  │   └── layout/         # Layout and container components
  ├── utils/              # Web-specific utilities
  ├── types/              # Web-specific types
  └── tokens/             # Design tokens and themes
  ```

#### `@mdxui/terminal`

- **Purpose**: Complete terminal ecosystem for CLI applications
- **Contents**:
  - Ink-based components
  - CLI workflow components
  - Terminal-specific utilities
  - ASCII art components
  - Terminal-specific types (CLI props, workflow types)
  - Process and TTY utilities
  - ANSI color and formatting helpers
- **Dependencies**: Ink, Node.js APIs
- **Keep existing**: Current ink package is well-developed, just reorganize structure

#### `@mdxui/registry`

- **Purpose**: Component registry system and extended components
- **Contents**:
  - Registry CLI tools
  - Component metadata system
  - Extended components and blocks
  - Template system
  - Web interface for browsing
- **Structure**:
  ```
  src/
  ├── cli/            # Registry CLI commands
  ├── components/     # Registry components
  ├── blocks/         # Composed sections
  ├── templates/      # Full page layouts
  ├── metadata/       # Component metadata
  └── web/            # Registry web interface
  ```

#### `@mdxui/extensions`

- **Purpose**: Browser extensions and web tools
- **Contents**:
  - Chrome extension
  - Safari extension
  - Monaco editor integration
  - Browser-specific utilities
- **Dependencies**: Browser APIs, Monaco

#### `@mdxui/integrations`

- **Purpose**: Framework-specific integrations
- **Contents**:
  - Next.js plugins
  - Vite plugins
  - Webpack loaders
  - MDX plugins
  - Framework adapters

#### `mdxui` (Meta-package)

- **Purpose**: Convenience package for common use cases
- **Contents**:
  - Re-exports from other packages
  - Convenience namespaces
  - Migration utilities
  - Documentation hub

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Establish clean foundation and build standards

#### Week 1: Audit and Cleanup

- [ ] **Inventory existing components**

  - Catalog all current components across packages
  - Identify which components actually work
  - Document current dependencies and conflicts
  - Assess component quality and usage

- [ ] **Dependency analysis**

  - Map all current dependencies
  - Identify circular dependencies
  - Document version conflicts
  - Plan dependency resolution strategy

- [ ] **User research**
  - Analyze how mdxui is currently used in examples
  - Identify most important components
  - Document current pain points
  - Survey community usage patterns

#### Week 2: Build Standards and Architecture

- [ ] **Establish build standards**

  - Create shared tsup configuration
  - Standardize TypeScript configs
  - Set up testing framework (Vitest)
  - Create linting and formatting rules
  - Document build patterns

- [ ] **Plan package architecture**
  - Design web package structure (components, utils, types, tokens)
  - Plan terminal package reorganization
  - Define registry system architecture
  - Create migration strategy from current structure

### Phase 2: Web Package (Weeks 3-5)

**Goal**: Create clean, comprehensive web component package

#### Week 3: Base Components

- [ ] **Create `@mdxui/web` package structure**

  - Set up package with components/, utils/, types/, tokens/ directories
  - Implement build system with tsup
  - Create proper TypeScript configuration
  - Set up testing framework

- [ ] **Migrate essential components**

  - Button (from current core)
  - Card (from current core)
  - Input, Textarea, Select
  - Basic layout components
  - Include component-specific utilities and types

- [ ] **Implement component architecture**
  - Headless base components
  - Styled variants system
  - Consistent prop interfaces
  - Proper TypeScript definitions
  - Accessibility implementation

#### Week 4: Styled and Animated Components

- [ ] **Integrate shadcn-ui components**

  - Migrate existing shadcn components
  - Implement variant system
  - Add proper styling with Tailwind
  - Ensure consistent design system

- [ ] **Integrate magicui components**
  - Migrate animation components
  - Implement motion system with Motion
  - Add animation presets
  - Ensure performance optimization

#### Week 5: Charts and Advanced Components

- [ ] **Integrate Tremor charts**

  - Clean up Tremor integration
  - Add chart component wrappers
  - Implement data visualization utilities
  - Add chart theming system

- [ ] **Testing and documentation**
  - Comprehensive component tests
  - Storybook setup for documentation
  - Usage examples
  - Performance benchmarks

### Phase 3: Registry System (Weeks 6-8)

**Goal**: Build powerful component registry with CLI and web interface

#### Week 6: Registry Infrastructure

- [ ] **Design registry architecture**

  - Component metadata schema
  - File system structure
  - CLI command structure
  - API design for web interface

- [ ] **Implement CLI foundation**
  - Registry CLI commands (browse, add, remove)
  - Component discovery system
  - Local storage management
  - Template generation system

#### Week 7: Registry Components and Blocks

- [ ] **Create registry components**

  - Hero sections (5-10 variants)
  - Pricing tables (3-5 variants)
  - Testimonial sections
  - CTA sections
  - Navigation components

- [ ] **Implement blocks system**
  - Composed sections using base components
  - Configurable props system
  - MDX-optimized interfaces
  - Responsive design patterns

#### Week 8: Web Interface and Integration

- [ ] **Build registry web interface**

  - Component browser
  - Live preview system
  - Code generation
  - Search and filtering

- [ ] **Integrate with mdxe**
  - Automatic component discovery
  - Seamless installation
  - Hot reloading support
  - Error handling and validation

### Phase 4: Terminal and Extensions (Weeks 9-10)

**Goal**: Clean up terminal package and consolidate extensions

#### Week 9: Terminal Package

- [ ] **Refactor existing ink package**

  - Clean up existing codebase
  - Standardize build system
  - Improve component architecture
  - Add comprehensive tests

- [ ] **Enhance terminal components**
  - Better CLI workflow components
  - Improved ASCII art system
  - Enhanced terminal utilities
  - Better error handling

#### Week 10: Extensions Package

- [ ] **Consolidate browser extensions**

  - Merge chrome/safari/browser packages
  - Standardize extension architecture
  - Improve Monaco integration
  - Add proper build system

- [ ] **Enhance extension features**
  - Better MDX preview
  - Improved editor integration
  - Enhanced debugging tools
  - Performance optimization

### Phase 5: Integrations and Meta-package (Weeks 11-12)

**Goal**: Framework integrations and final package assembly

#### Week 11: Integrations Package

- [ ] **Build framework integrations**

  - Next.js plugin for automatic component imports
  - Vite plugin for MDX processing
  - Webpack loader for component discovery
  - MDX plugins for enhanced processing

- [ ] **Create adapter system**
  - Framework-specific optimizations
  - SSR compatibility
  - Build-time optimizations
  - Development tools

#### Week 12: Meta-package and Polish

- [ ] **Create meta-package**

  - Convenience imports from all packages
  - Namespace organization
  - Migration utilities
  - Documentation hub

- [ ] **Final integration testing**
  - Test all packages together
  - Verify mdxe integration
  - Performance testing
  - Bundle size optimization

## Technical Specifications

### Build System Standards

- **Bundler**: tsup with esbuild
- **TypeScript**: Strict mode with shared configs
- **Testing**: Vitest with React Testing Library
- **Linting**: ESLint with shared rules
- **Formatting**: Prettier with shared config

### Component Architecture

- **Base Layer**: Headless components with no styling
- **Styled Layer**: Tailwind-based styled components
- **Animated Layer**: Motion enhanced components
- **Composed Layer**: Complex blocks built from base components

### Registry System

- **Storage**: Local file system with metadata
- **CLI**: Commander.js based CLI tools
- **Web Interface**: Next.js app for browsing
- **Integration**: Seamless mdxe integration

### Performance Targets

- **Bundle Size**: <50KB for essential components
- **Tree Shaking**: 100% tree-shakeable exports
- **Load Time**: <100ms component initialization
- **Runtime**: <16ms component render time

## Success Metrics

### Developer Experience

- [ ] Components available in mdxe without configuration
- [ ] Clear, consistent APIs across all components
- [ ] Comprehensive documentation and examples
- [ ] Fast development workflow with hot reloading

### Performance

- [ ] Minimal bundle size impact
- [ ] Excellent tree-shaking support
- [ ] Fast component render times
- [ ] Optimized for production builds

### Ecosystem Integration

- [ ] Seamless mdxe integration
- [ ] Framework plugin support
- [ ] Community contribution system
- [ ] Extensible architecture

## Migration Strategy

### Backward Compatibility

- [ ] Provide migration guide from current structure
- [ ] Create automated migration tools
- [ ] Maintain compatibility layer during transition
- [ ] Clear deprecation timeline

### User Communication

- [ ] Document all breaking changes
- [ ] Provide upgrade path examples
- [ ] Create migration tutorials
- [ ] Offer community support

## Future Considerations

### Scalability

- Component registry growth strategy
- Community contribution system
- Performance monitoring
- Ecosystem expansion

### Innovation

- AI-powered component generation
- Design system automation
- Advanced animation systems
- Cross-platform component sharing

---

_This plan provides a comprehensive roadmap for transforming mdxui into a world-class component system that serves the MDX ecosystem effectively._
