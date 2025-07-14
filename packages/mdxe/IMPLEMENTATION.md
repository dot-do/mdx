# mdxe Implementation Documentation

This document details the implementation of the mdxe package consolidation and research findings from `@research/embed-nextjs-cli.md`.

## Overview

The mdxe package has been successfully consolidated from 3 separate packages into a single "batteries-included" CLI that provides a complete MDX development environment with embedded CMS, following the research recommendations.

## Implementation Summary

### ✅ Package Consolidation

**Before**: 3 separate packages

- `@mdxe/cli` - CLI commands and utilities
- `@mdxe/test` - Test runner functionality
- `@mdxe/esbuild` - ESBuild integration

**After**: Single unified package

- `mdxe` - All functionality in one package
- Consolidated dependencies and exports
- Simplified installation and usage

### ✅ Research Implementation

Based on `@research/embed-nextjs-cli.md`, the following key features were implemented:

## 1. Next.js 14+ App Template

**Location**: `src/template/`

**Features**:

- App Router architecture (no legacy pages directory)
- Tailwind CSS with custom MDX styling
- TypeScript configuration
- Modern Next.js configuration with MDX support

**Key Files**:

```
src/template/
├── app/
│   ├── layout.tsx          # Root layout with Tailwind
│   ├── page.tsx            # Home page with feature overview
│   ├── globals.css         # Tailwind + MDX styles
│   ├── mdx-components.tsx  # MDX component provider
│   ├── [...slug]/          # Dynamic MDX routing
│   ├── admin/              # Payload CMS admin
│   ├── api/payload/        # CMS API routes
│   └── docs/               # Documentation page
├── next.config.mjs         # Next.js config with MDX + Contentlayer
├── tailwind.config.js      # Tailwind configuration
├── contentlayer.config.ts  # Content management config
└── payload.config.ts       # Payload CMS configuration
```

## 2. Payload CMS Integration

**Pattern**: Embedded CMS following `@payloadcms/next` approach

**Features**:

- Admin UI at `/admin` route
- API routes at `/api/payload/*`
- SQLite default with multi-database support
- Environment-based database switching

**Database Support**:

- **SQLite** (default): `DATABASE_URL=file:./payload.db`
- **PostgreSQL**: `DATABASE_URL=postgres://user:password@localhost:5432/mdxe`
- **MongoDB**: `DATABASE_URL=mongodb://localhost:27017/mdxe`

**Collections**:

- Posts (with rich text content)
- Pages (for static content)
- Users (authentication)

## 3. CLI Commands (Blitz.js Pattern)

**Pattern**: Thin wrapper around Next.js CLI commands

**Implementation**:

- `mdxe dev` → `next dev` with embedded app
- `mdxe build` → `next build` with output handling
- `mdxe start` → `next start` with production server

**Key Features**:

- Temporary directory approach for isolation
- Template + user content merging
- Proper Next.js CLI delegation
- Build output handling for deployment

**Files**:

```
src/cli/commands/
├── dev.ts    # Development server with temp directory
├── build.ts  # Production build with output copying
└── start.ts  # Production server
```

## 4. MDX Component System (Nextra Pattern)

**Pattern**: Component merging with `useMDXComponents` hook

**Default Components**:

- `<Alert type="info|warning|error|success">` - Styled alerts
- `<YouTube id="video-id" />` - Embedded YouTube videos
- `<Callout emoji="🚀">` - Highlighted callouts
- Enhanced HTML elements (headings, paragraphs, code blocks)

**User Customization**:

```javascript
// mdx-components.js
export function useMDXComponents(components) {
  return {
    ...components,
    MyCustomComponent: ({ children }) => <div className='my-custom-style'>{children}</div>,
  }
}
```

**Implementation**:

- Webpack aliases for user component resolution
- Component merging in template's `mdx-components.tsx`
- Automatic detection and loading of user components

## 5. Content Management

**Dual Approach**: File-based + CMS-based content

**File-based Content**:

- Contentlayer integration for MDX processing
- Dynamic routing via `[...slug]` route
- Frontmatter support for metadata
- Live reloading in development

**CMS-based Content**:

- Payload CMS for rich content editing
- Lexical editor integration
- Media management
- User authentication

**Content Structure**:

```
content/
├── posts/
│   └── my-post.mdx
├── pages/
│   └── about.mdx
└── index.mdx
```

## 6. Package Distribution

**Pattern**: Single package with embedded app

**Build Process**:

1. TypeScript compilation with tsup
2. Template files copied to `dist/template/`
3. CLI binary points to compiled commands
4. All dependencies included in single package

**Installation**:

```bash
npm install mdxe
npx mdxe dev  # Instant development server
```

## Architecture Decisions

### 1. Temporary Directory Strategy

**Problem**: Next.js expects app files in current directory
**Solution**: Create temporary directory with symlinked template + user content

**Benefits**:

- Clean separation of template and user content
- No file conflicts
- Easy cleanup
- Supports both development and production

### 2. Component Merging System

**Problem**: Allow user customization without complexity
**Solution**: Nextra-style `useMDXComponents` pattern

**Benefits**:

- Familiar pattern for Next.js developers
- Automatic component detection
- Webpack alias resolution
- Backward compatibility

### 3. Database Adapter Strategy

**Problem**: Support multiple databases without complexity
**Solution**: Environment-based automatic detection

**Benefits**:

- Zero configuration for SQLite
- Easy switching between databases
- Production-ready defaults
- No manual adapter selection

## Development Workflow

### 1. Development Mode (`mdxe dev`)

```bash
npx mdxe dev
```

**Process**:

1. Detect embedded app template
2. Create temporary directory
3. Copy template files
4. Merge user content (if exists)
5. Start Next.js development server
6. Enable hot reloading

### 2. Production Build (`mdxe build`)

```bash
npx mdxe build
```

**Process**:

1. Create build directory with merged content
2. Run Next.js production build
3. Copy output to user's `.next` directory
4. Prepare for deployment

### 3. Production Server (`mdxe start`)

```bash
npx mdxe start
```

**Process**:

1. Verify build exists
2. Start Next.js production server
3. Serve from user's `.next` directory

## File Structure

### Consolidated Package Structure

```
packages/mdxe/
├── package.json           # Single package with all dependencies
├── tsconfig.json         # TypeScript configuration
├── tsup.config.ts        # Build configuration
├── README.md             # User documentation
├── IMPLEMENTATION.md     # This file
├── bin/
│   └── mdxe.js           # CLI binary
├── src/
│   ├── index.ts          # Main exports
│   ├── cli/              # CLI commands and utilities
│   ├── test/             # Test utilities
│   ├── esbuild/          # ESBuild integration
│   ├── components/       # Default MDX components
│   └── template/         # Embedded Next.js app
└── dist/                 # Build output
```

### Runtime Directory Structure

When user runs `mdxe dev`, temporary structure created:

```
/tmp/mdxe-temp-xxx/
├── app/                  # Next.js app (from template)
├── content/              # User content (if exists)
├── mdx-components.js     # User components (if exists)
├── next.config.mjs       # Next.js configuration
├── tailwind.config.js    # Tailwind configuration
├── payload.config.ts     # Payload CMS configuration
├── package.json          # Temporary package.json
└── node_modules/         # Dependencies
```

## Research Alignment

### Blitz.js Pattern ✅

**Research Quote**: _"Blitz CLI was mostly a wrapper around Next's CLI"_

**Implementation**:

- CLI commands delegate to Next.js CLI
- Environment variable loading
- Directory argument for app location
- Thin wrapper approach maintained

### Nextra Pattern ✅

**Research Quote**: _"Nextra allows a project to provide an `mdx-components.js` file at the root which exports a `useMDXComponents` function"_

**Implementation**:

- Exact same pattern implemented
- Component merging with defaults
- Webpack alias resolution
- Automatic file detection

### Payload Integration ✅

**Research Quote**: _"Integrate Payload into the Next.js application itself, so that all requests are handled by a single Next app"_

**Implementation**:

- Single server approach
- Admin UI at `/admin`
- API routes at `/api/payload/*`
- Environment-based database switching

## Deployment Support

### Vercel Deployment

**Build Command**: `npx mdxe build`
**Output Directory**: `.next` (default)

**Process**:

1. mdxe builds Next.js app with embedded template
2. Copies output to user's `.next` directory
3. Vercel deploys standard Next.js app

### Self-Hosted Deployment

**Commands**:

```bash
npx mdxe build
npx mdxe start
```

**Process**:

1. Build creates production-ready `.next` directory
2. Start command runs Next.js production server
3. Supports process managers (PM2, systemd)

### Environment Variables

**Required for production**:

```env
PAYLOAD_SECRET=your-secret-key
DATABASE_URL=your-database-url
```

**Optional**:

```env
NEXT_PUBLIC_SITE_URL=https://your-site.com
```

## Future Enhancements

### 1. Static Export Support

**Research Note**: _"mdxe could support `next export` to generate a purely static site"_

**Implementation Path**:

- Add `mdxe export` command
- Disable CMS for static builds
- Generate static HTML for all MDX content

### 2. Eject Command

**Research Note**: _"We could consider an 'eject' command that copies the app out of node_modules"_

**Implementation Path**:

- Add `mdxe eject` command
- Copy template to user's project
- Convert to standard Next.js project

### 3. Improved CMS Integration

**Research Note**: _"Payload team hinted: 'moving Payload fully to Next.js'"_

**Implementation Path**:

- Monitor Payload updates
- Adopt native Next.js integration when available
- Reduce complexity of current integration

## Conclusion

The mdxe package successfully implements the research findings, providing a "batteries-included" MDX development environment that:

1. **Eliminates setup complexity** - Zero configuration required
2. **Follows proven patterns** - Blitz.js, Nextra, and Payload CMS approaches
3. **Supports modern workflows** - Next.js 14+, App Router, TypeScript
4. **Enables easy customization** - User components, content, and configuration
5. **Provides production deployment** - Vercel, self-hosted, and static options

The implementation transforms the original 3-package structure into a cohesive, user-friendly CLI that embodies the research vision of simplifying MDX development while maintaining full Next.js power and flexibility.
