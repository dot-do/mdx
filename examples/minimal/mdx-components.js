// export function useMDXComponents(components) {
//   return {
//     // Keep existing components (Alert, YouTube, Callout)
//     ...components,

//     // Add simple custom components (no external dependencies)
//     Button: ({ children, variant = 'primary', ...props }) => {
//       const baseClasses = 'rounded px-4 py-2 text-sm font-medium transition-colors'
//       const variantClasses = variant === 'secondary' ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
//       return (
//         <button className={`${baseClasses} ${variantClasses}`} {...props}>
//           {children}
//         </button>
//       )
//     },

//     Card: ({ title, children }) => (
//       <div className='border border-gray-200 rounded-lg p-4 mb-4'>
//         {title && <h3 className='text-lg font-semibold mb-2'>{title}</h3>}
//         {children}
//       </div>
//     ),

//     Badge: ({ children }) => <span className='inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded'>{children}</span>,

//     CustomBox: ({ children, color = 'blue' }) => <div className='border-2 border-blue-500 rounded-lg p-4 mb-4 bg-black'>{children}</div>,
//   }
// }
