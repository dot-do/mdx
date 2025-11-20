import { MdxBrowser, BrowserApiClient } from '../src/index'
import { createRoot } from 'react-dom/client'

document.addEventListener('DOMContentLoaded', async () => {
  const rootElement = document.getElementById('root')
  if (rootElement) {
    const root = createRoot(rootElement)
    const apiClient = new BrowserApiClient()
    
    root.render(<MdxBrowser apiClient={apiClient} />)
  }
})
