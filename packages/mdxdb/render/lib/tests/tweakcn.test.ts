import { describe, it, expect } from 'vitest'
import {
  parseTweakcnConfig,
  mergeTweakcnConfigs,
  generateTailwindCSSVariables,
  generateTailwindConfig,
  getComponentStyles,
  loadPresetConfig,
  DEFAULT_CONFIGS,
} from '../tweakcn.js'

describe('tweakcn', () => {
  describe('parseTweakcnConfig', () => {
    it('should parse valid YAML config', () => {
      const yaml = `
theme:
  colors:
    primary: "#3b82f6"
    secondary: "#8b5cf6"
  fonts:
    body: "Inter"
    heading: "Poppins"
`
      const config = parseTweakcnConfig(yaml)
      expect(config.theme?.colors?.primary).toBe('#3b82f6')
      expect(config.theme?.fonts?.body).toBe('Inter')
    })

    it('should throw error on invalid YAML', () => {
      const invalidYaml = 'invalid: yaml: content: {'
      expect(() => parseTweakcnConfig(invalidYaml)).toThrow()
    })
  })

  describe('mergeTweakcnConfigs', () => {
    it('should merge two configs', () => {
      const base = {
        theme: {
          colors: {
            primary: '#000000',
            secondary: '#666666',
          },
        },
      }

      const override = {
        theme: {
          colors: {
            primary: '#3b82f6',
          },
        },
      }

      const merged = mergeTweakcnConfigs(base, override)
      expect(merged.theme?.colors?.primary).toBe('#3b82f6')
      expect(merged.theme?.colors?.secondary).toBe('#666666')
    })

    it('should preserve nested properties', () => {
      const base = {
        theme: {
          colors: { primary: '#000000' },
          fonts: { body: 'system-ui' },
        },
      }

      const override = {
        theme: {
          colors: { secondary: '#666666' },
        },
      }

      const merged = mergeTweakcnConfigs(base, override)
      expect(merged.theme?.colors?.primary).toBe('#000000')
      expect(merged.theme?.colors?.secondary).toBe('#666666')
      expect(merged.theme?.fonts?.body).toBe('system-ui')
    })
  })

  describe('generateTailwindCSSVariables', () => {
    it('should generate CSS variables from config', () => {
      const config = {
        theme: {
          colors: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
          },
        },
      }

      const css = generateTailwindCSSVariables(config)
      expect(css).toContain(':root {')
      expect(css).toContain('--primary: #3b82f6;')
      expect(css).toContain('--secondary: #8b5cf6;')
    })

    it('should return empty string if no colors', () => {
      const config = { theme: {} }
      const css = generateTailwindCSSVariables(config)
      expect(css).toBe('')
    })
  })

  describe('generateTailwindConfig', () => {
    it('should generate Tailwind config from tweakcn config', () => {
      const config = {
        theme: {
          colors: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
          },
          fonts: {
            body: 'Inter',
            heading: 'Poppins',
          },
          spacing: {
            sm: '1rem',
            md: '2rem',
          },
          borderRadius: '0.5rem',
        },
      }

      const tailwindConfig = generateTailwindConfig(config)
      expect(tailwindConfig.theme.extend.colors).toEqual(config.theme.colors)
      expect(tailwindConfig.theme.extend.fontFamily.body).toEqual(['Inter', 'sans-serif'])
      expect(tailwindConfig.theme.extend.spacing).toEqual(config.theme.spacing)
      expect(tailwindConfig.theme.extend.borderRadius.DEFAULT).toBe('0.5rem')
    })
  })

  describe('getComponentStyles', () => {
    it('should return component styles', () => {
      const config = {
        theme: {
          components: {
            heading: {
              className: 'font-bold text-foreground',
            },
          },
        },
      }

      const styles = getComponentStyles(config, 'heading')
      expect(styles).toBe('font-bold text-foreground')
    })

    it('should apply variant styles', () => {
      const config = {
        theme: {
          components: {
            button: {
              className: 'px-4 py-2',
              variants: {
                primary: 'bg-blue-500',
                secondary: 'bg-gray-500',
              },
            },
          },
        },
      }

      const styles = getComponentStyles(config, 'button', 'primary')
      expect(styles).toBe('px-4 py-2 bg-blue-500')
    })

    it('should return empty string if component not found', () => {
      const config = { theme: { components: {} } }
      const styles = getComponentStyles(config, 'nonexistent')
      expect(styles).toBe('')
    })
  })

  describe('loadPresetConfig', () => {
    it('should load minimal preset', () => {
      const config = loadPresetConfig('minimal')
      expect(config).toBeDefined()
      expect(config.theme?.colors).toBeDefined()
    })

    it('should load modern preset', () => {
      const config = loadPresetConfig('modern')
      expect(config).toBeDefined()
      expect(config.theme?.colors?.primary).toBe('#3b82f6')
    })

    it('should load docs preset', () => {
      const config = loadPresetConfig('docs')
      expect(config).toBeDefined()
      expect(config.theme?.components).toBeDefined()
    })

    it('should load blog preset', () => {
      const config = loadPresetConfig('blog')
      expect(config).toBeDefined()
      expect(config.theme?.fonts?.body).toBe('Georgia')
    })
  })

  describe('DEFAULT_CONFIGS', () => {
    it('should have all preset configs', () => {
      expect(DEFAULT_CONFIGS.minimal).toBeDefined()
      expect(DEFAULT_CONFIGS.modern).toBeDefined()
      expect(DEFAULT_CONFIGS.docs).toBeDefined()
      expect(DEFAULT_CONFIGS.blog).toBeDefined()
    })

    it('should have valid color values', () => {
      Object.values(DEFAULT_CONFIGS).forEach(config => {
        const colors = config.theme?.colors
        if (colors) {
          Object.values(colors).forEach(color => {
            if (color) {
              expect(color).toMatch(/^#[0-9a-f]{6}$/i)
            }
          })
        }
      })
    })
  })
})
