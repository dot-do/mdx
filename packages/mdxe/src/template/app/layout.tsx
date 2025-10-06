// @ts-nocheck
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthWrapper } from '../components/auth-wrapper'
import { SDKProvider } from '../components/sdk-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MDX Site',
  description: 'A modern MDX site powered by mdxe',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <AuthWrapper>
          <SDKProvider>
            <main className='min-h-screen bg-white'>{children}</main>
          </SDKProvider>
        </AuthWrapper>
      </body>
    </html>
  )
}
