---
collections:
  posts:
    title: Blog post title
    slug: URL-friendly slug (string)
    date: Publication date (date)
    author: Post author (string)
    excerpt: Short description for previews (string)
    tags: Post tags for categorization (array)
    category: Post category (tech | design | business | lifestyle)
    published: Publication status (boolean)
    featuredImage: Featured image URL (string)

  authors:
    name: Author full name
    bio: Author biography
    avatar: Avatar image URL (string)
    twitter: Twitter handle without @ (string)
    website: Personal website URL (string)
    email: Contact email (string)

  categories:
    name: Category display name
    description: Category description
    slug: URL-friendly slug (string)
    color: Category color hex code (string)
    icon: Category icon name (string)
---

# Blog Schema

This schema defines a complete blog structure with:

## Collections

### Posts
The main blog posts collection with full content support:
- Rich frontmatter metadata
- MDX body content with components
- Author and category relationships
- Tag-based organization
- Publication workflow

### Authors
Author profiles linked to posts:
- Bio and contact information
- Social media links
- Avatar images

### Categories
Hierarchical content organization:
- Category descriptions
- Color coding for UI
- Icon support

## Usage

This schema is automatically discovered by mdxdb and can be used to:
1. Generate Payload CMS collections
2. Validate content at build time
3. Generate TypeScript types
4. Create database schemas

## Type Annotations

- `string` - Text content
- `date` - ISO date format (YYYY-MM-DD)
- `boolean` - true/false values
- `array` - Arrays of strings
- `enum` - One of specified values (format: value1 | value2 | value3)
