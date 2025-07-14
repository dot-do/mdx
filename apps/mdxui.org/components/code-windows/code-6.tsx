'use client'

import { useState, useEffect } from 'react'
import { getHighlighter } from 'shiki'
import { Copy, Check, File, FileCode, FileText } from 'lucide-react'

const defaultCodeSnippets = {
  'shared-options': {
    title: 'Shared options',
    navTitle: 'app/layout.config.tsx',
    icon: FileCode,
    code: `import { i18n } from '@/lib/i18n';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

// Make \`baseOptions\` a function:
export function baseOptions(locale: string): BaseLayoutProps {
  return {
    i18n,
    // different props based on \`locale\`
  };
}`
  },
  'home-layout': {
    title: 'Home Layout',
    navTitle: '/app/[lang]/(home)/layout.tsx',
    icon: FileCode,
    code: `import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  return <HomeLayout {...baseOptions(lang)}>{children}</HomeLayout>;
}`
  },
  'docs-layout': {
    title: 'Docs Layout',
    navTitle: '/app/[lang]/docs/layout.tsx',
    icon: FileCode,
    code: `import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/app/layout.config';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  return (
    <DocsLayout {...baseOptions(lang)} tree={source.pageTree[lang]}>
      {children}
    </DocsLayout>
  );
}`
  },
  'page': {
    title: 'Page',
    navTitle: 'page.tsx',
    icon: FileText,
    code: `import { source } from '@/lib/source';

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const { slug, lang } = await params;
  // get page
  source.getPage(slug);
  source.getPage(slug, lang);

  // get pages
  source.getPages();
  source.getPages(lang);
}`
  }
}

interface Code6Props {
  codeSnippets?: Record<string, {
    title: string;
    navTitle: string;
    icon: any;
    code: string;
  }>;
  language?: string;
  defaultTab?: string;
}

export function Code6({ 
  codeSnippets = defaultCodeSnippets, 
  language = 'typescript',
  defaultTab 
}: Code6Props) {
  const firstKey = Object.keys(codeSnippets)[0]
  const [activeTab, setActiveTab] = useState<string>(defaultTab || firstKey)
  const [highlightedCode, setHighlightedCode] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const highlightAllCode = async () => {
      const highlighter = await getHighlighter({
        themes: ['github-dark-default'],
        langs: [language]
      })

      const highlighted: Record<string, string> = {}
      
      for (const [key, snippet] of Object.entries(codeSnippets)) {
        const html = highlighter.codeToHtml(snippet.code, {
          lang: language,
          theme: 'github-dark-default'
        })
        highlighted[key] = html
      }

      setHighlightedCode(highlighted)
    }

    highlightAllCode()
  }, [codeSnippets, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippets[activeTab].code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const currentSnippet = codeSnippets[activeTab]
  const IconComponent = currentSnippet.icon

  return (
    <div className="w-full max-w-xl mx-auto shadow-xl rounded-lg">
      <div className="relative bg-[#0a0c10] rounded-lg overflow-hidden border border-gray-850 p-1">
        {/* Top Row - Tabs and Copy Button */}
        <div className="flex items-center justify-between px-2 -mb-0.25 pt-1 text-gray-400">
          {/* Tabs */}
          <div className="flex gap-4 px-1">
            {Object.entries(codeSnippets).map(([key, snippet]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-1.5 text-[13px] font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === key
                    ? 'text-gray-200 border-blue-600'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                {snippet.title}
              </button>
            ))}
          </div>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-800 rounded-sm transition-colors duration-200"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3 h-3 text-gray-200" />
            ) : (
              <Copy className="w-3 h-3 text-gray-500 hover:text-gray-400" />
            )}
          </button>
        </div>

        {/* Code Content with Inner Border */}
        <div className="rounded-md border border-gray-700 dark:border-gray-800 text-[13px] bg-[#0d1117]">
          {/* Nav Title */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b dark:border-gray-850 border-gray-800">
            <IconComponent className="w-3 h-3 text-gray-500" />
            <div className="text-[13px] text-gray-500 font-base truncate">
              {currentSnippet.navTitle}
            </div>
          </div>
          
          {/* Code Content */}
          <div className="py-3.5 overflow-auto max-h-96">
            {highlightedCode[activeTab] ? (
              <div
                dangerouslySetInnerHTML={{ __html: highlightedCode[activeTab] }}
                className="leading-relaxed min-w-fit px-4"
              />
            ) : (
              <div className="text-gray-400 leading-relaxed px-4">
                <pre className="min-w-fit">{currentSnippet.code}</pre>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
