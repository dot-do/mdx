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

interface Footer1Props {
  logo?: {
    src: string;
    alt: string;
  };
  companyName?: string;
  description?: string;
  copyright?: string;
  navigation?: {
    solutions?: NavigationLink[];
    support?: NavigationLink[];
    company?: NavigationLink[];
    legal?: NavigationLink[];
  };
  socialLinks?: SocialLink[];
}

const iconMap = {
  youtube: FaYoutube,
  discord: FaDiscord,
  github: FaGithub,
  xtwitter: FaXTwitter,
  linkedin: FaLinkedin,
};

const defaultNavigation = {
  solutions: [
    { name: 'Marketing', href: '#' },
    { name: 'Analytics', href: '#' },
    { name: 'Automation', href: '#' },
    { name: 'Commerce', href: '#' },
    { name: 'Insights', href: '#' },
  ],
  support: [
    { name: 'Submit ticket', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Guides', href: '#' },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Jobs', href: '#' },
    { name: 'Press', href: '#' },
  ],
  legal: [
    { name: 'Terms of service', href: '#' },
    { name: 'Privacy policy', href: '#' },
    { name: 'License', href: '#' },
  ],
};

const defaultSocialLinks: SocialLink[] = [
  { name: 'YouTube', href: '#', icon: 'youtube' },
  { name: 'Discord', href: '#', icon: 'discord' },
  { name: 'GitHub', href: '#', icon: 'github' },
  { name: 'X (Twitter)', href: '#', icon: 'xtwitter' },
  { name: 'LinkedIn', href: '#', icon: 'linkedin' },
];

const Footer1: React.FC<Footer1Props> = ({
  logo = { src: '/mdxuiLogo.svg', alt: 'Company logo' },
  companyName = 'do.industries, Inc.',
  description = 'Building autonomous businesses with beautiful UI, all in markdown.',
  copyright,
  navigation = defaultNavigation,
  socialLinks = defaultSocialLinks,
}) => {
  const currentYear = new Date().getFullYear();
  const copyrightText = copyright || `© ${currentYear} ${companyName} All rights reserved.`;

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <img
              alt={logo.alt}
              src={logo.src}
              className="h-9"
            />
            <p className="text-sm/6 text-balance text-muted-foreground">
              {description}
            </p>
            <div className="flex gap-x-6">
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
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {navigation.solutions && (
                <div>
                  <h3 className="text-sm/6 font-semibold text-foreground">Solutions</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.solutions.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-muted-foreground hover:text-foreground transition-colors">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {navigation.support && (
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-foreground">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.support.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-muted-foreground hover:text-foreground transition-colors">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {navigation.company && (
                <div>
                  <h3 className="text-sm/6 font-semibold text-foreground">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.company.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-muted-foreground hover:text-foreground transition-colors">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {navigation.legal && (
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-foreground">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.legal.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-muted-foreground hover:text-foreground transition-colors">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
          <p className="text-sm/6 text-muted-foreground">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export { Footer1 };
  