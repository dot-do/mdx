import React from 'react';
import { FaYoutube, FaDiscord, FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";

interface NavigationLink {
  name: string;
  href: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: 'youtube' | 'discord' | 'github' | 'xtwitter' | 'linkedin';
}

interface Footer2Props {
  companyName?: string;
  copyright?: string;
  navigation?: NavigationLink[];
  socialLinks?: SocialLink[];
}

const iconMap = {
  youtube: FaYoutube,
  discord: FaDiscord,
  github: FaGithub,
  xtwitter: FaXTwitter,
  linkedin: FaLinkedin,
};

const defaultNavigation: NavigationLink[] = [
  { name: 'About', href: '#' },
  { name: 'Blog', href: '#' },
  { name: 'Jobs', href: '#' },
  { name: 'Docs', href: '#' },
  { name: 'Terms', href: '#' },
  { name: 'Privacy', href: '#' },
];

const defaultSocialLinks: SocialLink[] = [
  { name: 'YouTube', href: '#', icon: 'youtube' },
  { name: 'Discord', href: '#', icon: 'discord' },
  { name: 'GitHub', href: '#', icon: 'github' },
  { name: 'X (Twitter)', href: '#', icon: 'xtwitter' },
  { name: 'LinkedIn', href: '#', icon: 'linkedin' },
];

const Footer2: React.FC<Footer2Props> = ({
  companyName = 'do.industries, Inc.',
  copyright,
  navigation = defaultNavigation,
  socialLinks = defaultSocialLinks,
}) => {
  const currentYear = new Date().getFullYear();
  const copyrightText = copyright || `© ${currentYear} ${companyName} All rights reserved.`;

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav aria-label="Footer" className="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {item.name}
            </a>
          ))}
        </nav>
        <div className="mt-16 flex justify-center gap-x-10">
          {socialLinks.map((item) => {
            const IconComponent = iconMap[item.icon];
            return (
              <a 
                key={item.name} 
                href={item.href} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="sr-only">{item.name}</span>
                <IconComponent className="size-5" aria-hidden="true" />
              </a>
            );
          })}
        </div>
        <p className="mt-10 text-center text-sm/6 text-muted-foreground">{copyrightText}</p>
      </div>
    </footer>
  );
};

export { Footer2 };
  