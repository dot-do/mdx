// @ts-nocheck
// Error component for MDX rendering errors
export function MDXErrorComponent({ error }: { error: Error }) {
  return (
    <div className='bg-red-50 border border-red-200 rounded-lg p-4 my-4'>
      <h3 className='text-red-800 font-semibold mb-2'>MDX Rendering Error</h3>
      <p className='text-red-700 text-sm'>{error.message}</p>
    </div>
  )
}
