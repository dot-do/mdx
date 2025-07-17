import React from 'react'

const Landing1: React.FC = () => {
  return (
    <div className='w-full p-0 sm:p-2'>
      {/* Container for Architecture Diagram */}
      <div className='max-w-7xl mx-auto space-y-4'>
        {/* Nav Block */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
          Nav
        </div>

        {/* Page Hero */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md h-[200px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30'>
          Landing Hero
        </div>

        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md h-[100px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30'>
          Solutions, Benefits, Features, or How It Works
        </div>

        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md h-[100px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30'>
          Testimonials
        </div>

        {/* Bento Grid */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30'>
        
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-1 sm:col-span-2 h-[100px] flex items-center justify-center border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20">
              Bento Card 1
            </div>
            <div className="col-span-1 h-[100px] flex items-center justify-center border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20">
              Bento Card 2
            </div>
            <div className="col-span-1 h-[100px] flex items-center justify-center border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20">
              Bento Card 3
            </div>
            <div className="col-span-1 sm:col-span-2 h-[100px] flex items-center justify-center border border-gray-300 dark:border-border text-muted-foreground text-center p-8 rounded-md bg-white/80 dark:bg-slate-700/20">
              Bento Card 4
            </div>
          </div>
        </div>

        {/* FAQs Block */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
          FAQs
        </div>

        {/* CTA Block */}
        <div className='w-full border border-gray-300 dark:border-border text-muted-foreground text-center p-4 rounded-md bg-slate-100/50 dark:bg-slate-800/30'>
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

export default Landing1
