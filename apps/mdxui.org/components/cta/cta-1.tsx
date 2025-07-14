import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Cta1Props {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url?: string;
    };
    secondary?: {
      text: string;
      url?: string;
      showIcon?: boolean;
    };
  };
  image?: string;
}

const Cta1 = ({
  heading = "Explore Our Platform",
  description = "Discover the full potential of our platform. Try our interactive demo or watch a comprehensive walkthrough today.",
  buttons = {
    primary: {
      text: "Get Started",
      url: "#",
    },
    secondary: {
      text: "View Docs",
      url: "#",
      showIcon: true,
    },
  },
  image = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg",
}: Cta1Props) => {
  return (
    <section className="py-32">
      <div className="container overflow-hidden">
        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-6 overflow-hidden rounded-lg border bg-muted/20 md:flex-row">
          
          <div className="max-w-xl self-center p-6 md:p-12 relative z-10">
            <h2 className="text-3xl font-semibold md:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-muted-foreground md:text-base">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {buttons.primary && (
                <Button asChild>
                  <a href={buttons.primary.url}>{buttons.primary.text}</a>
                </Button>
              )}
              {buttons.secondary && (
                <Button variant="outline" asChild>
                  <a href={buttons.secondary.url}>
                    {buttons.secondary.text}
                    {buttons.secondary.showIcon && <ArrowRight className="ml-2 size-4" />}
                  </a>
                </Button>
              )}
            </div>
          </div>
          <div className="relative ml-6 max-h-96 md:mt-8 md:ml-0 z-10">
            <img
              src={image}
              alt="placeholder"
              className="z-10 aspect-video h-full w-full rounded-tl-xl border-t border-l object-cover pt-3 pl-3 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Cta1 };
