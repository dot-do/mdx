import type { ReactNode } from 'react'
import type { BackgroundProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

export interface TeamProps extends BackgroundProps {
  children?: ReactNode
  title?: string
  description?: string
  members?: Array<{
    name: string
    role: string
    image?: string
    bio?: string
    social?: {
      twitter?: string
      linkedin?: string
      github?: string
    }
  }>
  layout?: 'grid'
  columns?: 2 | 3 | 4
  showBio?: boolean
  showSocial?: boolean
  className?: string
}

/**
 * Team section component with dual API support
 *
 * Showcase your team members with photos, names, and roles.
 *
 * @example
 * // Explicit props
 * <Team
 *   title="Meet Our Team"
 *   members={[
 *     {
 *       name: "John Doe",
 *       role: "CEO & Founder",
 *       image: "/team/john.jpg",
 *       bio: "Passionate about building great products",
 *       social: {
 *         twitter: "https://twitter.com/johndoe",
 *         linkedin: "https://linkedin.com/in/johndoe"
 *       }
 *     }
 *   ]}
 *   layout="grid"
 *   columns={3}
 * />
 *
 * @example
 * // MDX children
 * <Team backgroundType="dots">
 *   ## Meet Our Team
 *
 *   ### John Doe
 *   CEO & Founder
 *   ![John](/team/john.jpg)
 * </Team>
 */
export function Team({
  children,
  title,
  description,
  members = [],
  layout = 'grid',
  columns = 3,
  showBio = true,
  showSocial = true,
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: TeamProps) {
  const props = useDualAPI(
    children,
    {
      title,
      description,
      members,
      layout,
      columns,
      showBio,
      showSocial,
    },
    'team'
  )

  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  const renderMember = (member: any, index: number) => (
    <div
      key={index}
      className="flex flex-col items-center text-center group"
    >
      {/* Image */}
      {member.image && (
        <div className="relative mb-6 w-48 h-48 rounded-full overflow-hidden">
          <img
            src={member.image}
            alt={member.name || ''}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
          />
        </div>
      )}

      {/* Name */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
        {member.name}
      </h3>

      {/* Role */}
      <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
        {member.role}
      </p>

      {/* Bio */}
      {props.showBio && member.bio && (
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs mb-4">
          {member.bio}
        </p>
      )}

      {/* Social Links */}
      {props.showSocial && member.social && (
        <div className="flex gap-4">
          {member.social.twitter && (
            <a
              href={member.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          )}
          {member.social.linkedin && (
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          )}
          {member.social.github && (
            <a
              href={member.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  )

  return (
    <BackgroundContainer
      backgroundType={backgroundType}
      backgroundConfig={backgroundConfig}
      backgroundOpacity={backgroundOpacity}
      reduceMotion={reduceMotion}
      className={cn('py-20 px-4', className)}
      {...rest}
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        {(props.title || props.description) && (
          <div className="text-center mb-16">
            {props.title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {props.title}
              </h2>
            )}
            {props.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {props.description}
              </p>
            )}
          </div>
        )}

        {/* Team members */}
        {props.members && props.members.length > 0 && (
          <div className={cn('grid gap-12', columnClasses[props.columns!])}>
            {props.members.map((member, index) => renderMember(member, index))}
          </div>
        )}
      </div>
    </BackgroundContainer>
  )
}
