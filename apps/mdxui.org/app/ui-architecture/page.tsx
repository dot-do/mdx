import { Navbar } from '@/components/navbar'
import { Showcase } from '@/components/showcase'
import { SectionHeader } from '@/components/section-header'

// UI Architecture Components
// Directory
import AIServiceDirectoryDiagram from '@/components/ui-architecture/directory'

// Landing Page
import Landing1 from '@/components/ui-architecture/landing-1'

// Blog
import BlogDirectory from '@/components/ui-architecture/blog-directory'
import BlogPage from '@/components/ui-architecture/blog-page'

export default function UIArchitecture() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className='container mx-auto px-6 py-8'>
        {/* Page Header */}
        <div className='mt-6 sm:mt-10 mb-12 text-center'>
          <h1 className='text-3xl font-bold mb-4'>UI Architecture</h1>
          <p className='text-sm text-muted-foreground max-w-lg mx-auto'>
            Visual architecture diagrams showing the structure and layout of different page types and user interfaces.
          </p>
        </div>

        {/* Directory */}
        <section className='mb-12'>
          <SectionHeader title='Service Directory' />

          <Showcase id='ai-service-directory' title='Directory-1'>
            <AIServiceDirectoryDiagram />
          </Showcase>
        </section>

        {/* Landing Page */}
        <section className='mb-12'>
          <SectionHeader title='Landing Page' />

          <Showcase id='landing-1' title='Landing-1'>
            <Landing1 />
          </Showcase>
        </section>

        {/* Blog */}
        <section className='mb-12'>
          <SectionHeader title='Blog' />

          <Showcase id='blog-directory' title='Blog Directory'>
            <BlogDirectory />
          </Showcase>

          <Showcase id='blog-page' title='Blog Page'>
            <BlogPage />
          </Showcase>
        </section>
      </main>
    </div>
  )
}
