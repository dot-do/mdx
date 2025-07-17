import React from 'react'

const AIServiceDirectoryDiagram: React.FC = () => {
  return (
    <div className='w-full p-0 sm:p-2'>
      {/* Container for Architecture Diagram */}
      <div className='max-w-7xl mx-auto space-y-4'>
        {/* Nav Block */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>Nav</div>

        {/* Page Hero */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md h-[200px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30'>Directory Hero</div>

        {/* Search & Filters */}
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>Search</div>
          <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>Filters</div>
        </div>

        {/* Services Grid */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30'>
          <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
            <div className='border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20'>Service Card</div>
          </div>
        </div>

        {/* CTA Block */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>Call-to-action</div>

        {/* Footer Block */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>Footer</div>
      </div>
    </div>
  )
}

export default AIServiceDirectoryDiagram
