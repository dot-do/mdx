// @ts-nocheck
// Loading component
export function LoadingComponent() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-4 w-3/4'></div>
          <div className='h-4 bg-gray-200 rounded mb-2 w-1/2'></div>
          <div className='h-4 bg-gray-200 rounded mb-4 w-1/4'></div>
          <div className='space-y-2'>
            <div className='h-4 bg-gray-200 rounded w-full'></div>
            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
            <div className='h-4 bg-gray-200 rounded w-4/6'></div>
          </div>
        </div>
      </div>
    </div>
  )
}
