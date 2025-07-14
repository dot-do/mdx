import type { Metadata } from "next";
import { Host_Grotesk, Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const host_grotesk = Host_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--display-family',
});

const geist = Geist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-geist-sans',
});

const geist_mono = Geist_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: "MDXUI Design System",
  description: "Next.js with Tailwind CSS v4, Shadcn Components, and Shiki Code Highlighting",
};

export default function RootLayout({ 
    children 
  }: { 
    children: React.ReactNode
  }) {
  return (
    <html lang="en" className={`${host_grotesk.variable} ${geist.variable} ${geist_mono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
