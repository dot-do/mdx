import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'

// Collections
const Posts = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
  ],
}

const Pages = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}

// Determine database adapter based on environment
function getDatabaseAdapter() {
  const dbUrl = process.env.DATABASE_URL || 'file:./payload.db'
  
  if (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://')) {
    return mongooseAdapter({
      url: dbUrl,
    })
  } else if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    return postgresAdapter({
      pool: {
        connectionString: dbUrl,
      },
    })
  } else {
    // Default to SQLite
    return sqliteAdapter({
      client: {
        url: dbUrl,
      },
    })
  }
}

export default buildConfig({
  admin: {
    user: 'users',
    bundler: 'webpack',
  },
  editor: lexicalEditor({}),
  collections: [
    Posts,
    Pages,
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
  ],
  secret: process.env.PAYLOAD_SECRET || 'mdxe-payload-secret',
  typescript: {
    outputFile: './payload-types.ts',
  },
  db: getDatabaseAdapter(),
})