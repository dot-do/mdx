import React from 'react';

interface Footer4Props {
  logo?: {
    src: string;
    alt: string;
  };
  companyName?: string;
  copyright?: string;
}

const Footer4: React.FC<Footer4Props> = ({
  logo = { src: '/mdxuiLogo.svg', alt: 'MDXUI Logo' },
  companyName = 'do.industries, Inc.',
  copyright,
}) => {
  const currentYear = new Date().getFullYear();
  const copyrightText = copyright || `© ${currentYear} ${companyName} All rights reserved.`;

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center md:order-1 md:justify-start">
          <img
            alt={logo.alt}
            src={logo.src}
            className="h-8"
          />
        </div>
        <p className="mt-8 text-center text-sm/6 text-muted-foreground md:order-2 md:mt-0">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
};

export { Footer4 }; 