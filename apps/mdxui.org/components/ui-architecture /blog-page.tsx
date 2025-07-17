import React from 'react'

const BlogPage: React.FC = () => {
  return (
    <div className='w-full p-0 sm:p-2'>
      {/* Container for Architecture Diagram */}
      <div className='max-w-7xl mx-auto space-y-4'>
        {/* Nav Block */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
          Nav
        </div>

        {/* Blog Title */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30'>
          Blog Title
        </div>

        {/* Search & Filters */}
        <div className='w-full grid grid-cols-2 gap-4'>
          <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
            Date | Author | Read Time
          </div>
          <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
            Share
          </div>
        </div>

        {/* Services Grid */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md h-[300px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30'>
          Blog Content
        </div>

        {/* Related Blogs */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
          Related Blogs
        </div>

        {/* CTA Block */}
        <div className='w-full border border-dashed border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
          Call-to-action
        </div>

        {/* Footer Block */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
          Footer
        </div>
      </div>
    </div>
  )
}

export default BlogPage
