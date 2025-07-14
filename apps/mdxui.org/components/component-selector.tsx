'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define available sections based on the main page structure
const availableSections = [
  { value: 'navbars', label: 'Navbars' },
  { value: 'hero', label: 'Hero' },
  { value: 'features', label: 'Features' },
  { value: 'how-it-works', label: 'How it works' },
  { value: 'bento-grid', label: 'Bento Grid' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'code-windows', label: 'Code Windows' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'faqs', label: 'FAQs' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'call-to-action', label: 'Call-to-action' },
  { value: 'footer', label: 'Footer' },
]

export function ComponentSelector() {
  const [selectedSection, setSelectedSection] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToSection = (sectionTitle: string) => {
    // Find the section element by looking for SectionHeader with the matching title
    const sections = document.querySelectorAll('section')
    
    for (const section of sections) {
      // Look for SectionHeader component within the section (uses h1 tag)
      const sectionHeader = section.querySelector('h1, h2, h3, [role="heading"]')
      if (sectionHeader && sectionHeader.textContent?.toLowerCase() === sectionTitle.toLowerCase()) {
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
        break
      }
    }
  }

  const handleSectionChange = (sectionValue: string) => {
    setSelectedSection(sectionValue)
    const section = availableSections.find(s => s.value === sectionValue)
    if (section) {
      scrollToSection(section.label)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedSection} onValueChange={handleSectionChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Navigate to..." />
        </SelectTrigger>
        <SelectContent className="z-[110]">
          {availableSections.map((section) => (
            <SelectItem key={section.value} value={section.value}>
              {section.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 