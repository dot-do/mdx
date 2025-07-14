import React, { useState, useEffect } from 'react'
import { Text } from 'ink'
import { Image, type ImageProps } from './Image.js'
import type { IconName } from '../../utils/icons.js'
import { getIconLibrary, ICON_LIBRARIES } from '../../utils/icons.js'

export interface IconProps extends Omit<ImageProps, 'icon'> {
  name: IconName
}

/**
 * Icon component that loads and renders icons from various libraries
 */
export function Icon({ name, ...imageProps }: IconProps) {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const library = getIconLibrary(name)
        if (!library) {
          console.warn(`Icon library not found for icon: ${name}`)
          return
        }

        let iconModule
        switch (library) {
          case 'Ai':
            iconModule = await import('react-icons/ai')
            break
          case 'Bi':
            iconModule = await import('react-icons/bi')
            break
          case 'Bs':
            iconModule = await import('react-icons/bs')
            break
          case 'Cg':
            iconModule = await import('react-icons/cg')
            break
          case 'Ci':
            iconModule = await import('react-icons/ci')
            break
          case 'Di':
            iconModule = await import('react-icons/di')
            break
          case 'Fa':
            iconModule = await import('react-icons/fa')
            break
          case 'Fa6':
            iconModule = await import('react-icons/fa6')
            break
          case 'Fc':
            iconModule = await import('react-icons/fc')
            break
          case 'Fi':
            iconModule = await import('react-icons/fi')
            break
          case 'Gi':
            iconModule = await import('react-icons/gi')
            break
          case 'Go':
            iconModule = await import('react-icons/go')
            break
          case 'Gr':
            iconModule = await import('react-icons/gr')
            break
          case 'Hi':
            iconModule = await import('react-icons/hi')
            break
          case 'Hi2':
            iconModule = await import('react-icons/hi2')
            break
          case 'Im':
            iconModule = await import('react-icons/im')
            break
          case 'Io':
            iconModule = await import('react-icons/io')
            break
          case 'Io5':
            iconModule = await import('react-icons/io5')
            break
          case 'Lia':
            iconModule = await import('react-icons/lia')
            break
          case 'Lu':
            iconModule = await import('react-icons/lu')
            break
          case 'Md':
            iconModule = await import('react-icons/md')
            break
          case 'Pi':
            iconModule = await import('react-icons/pi')
            break
          case 'Ri':
            iconModule = await import('react-icons/ri')
            break
          case 'Rx':
            iconModule = await import('react-icons/rx')
            break
          case 'Si':
            iconModule = await import('react-icons/si')
            break
          case 'Sl':
            iconModule = await import('react-icons/sl')
            break
          case 'Tb':
            iconModule = await import('react-icons/tb')
            break
          case 'Tfi':
            iconModule = await import('react-icons/tfi')
            break
          case 'Ti':
            iconModule = await import('react-icons/ti')
            break
          case 'Vsc':
            iconModule = await import('react-icons/vsc')
            break
          case 'Wi':
            iconModule = await import('react-icons/wi')
            break
          default:
            console.warn(`Unsupported icon library: ${library}`)
            return
        }

        const Component = (iconModule as any)[name as keyof typeof iconModule]
        if (Component) {
          setIconComponent(() => Component)
        } else {
          console.warn(`Icon ${name} not found in library ${library}`)
        }
      } catch (error) {
        console.error(`Failed to load icon ${name}:`, error)
      }
    }

    loadIcon()
  }, [name])

  if (!IconComponent) {
    return <Text>[Loading icon: {name}]</Text>
  }

  return <Image icon={IconComponent} {...imageProps} />
}
