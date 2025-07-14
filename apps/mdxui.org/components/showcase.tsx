import { Copy, Eye, Code } from 'lucide-react'

interface ShowcaseProps {
  id: string
  title: string
  children: React.ReactNode
}

export function Showcase({ id, title, children }: ShowcaseProps) {
  return (
    <div id={id} className="mb-12">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-md font-base font-medium ">{title}</h2>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-accent rounded-md transition-colors">
            <Copy size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-accent rounded-md transition-colors">
            <Code size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      
      <div className="w-full bg-slate-50/20 dark:bg-gray-900/30 border border-border border-dashed rounded-lg p-6">
        {children}
      </div>
    </div>
  )
} 