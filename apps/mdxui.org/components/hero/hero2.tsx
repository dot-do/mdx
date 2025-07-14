import { Button } from "@/components/ui/button";

interface Hero2Props {
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  buttonPrimary: {
    label: string;
    href: string;
  };
  buttonSecondary: {
    label: string;
    href: string;
  };
}

const Hero2 = ({
  title = "Blocks built with Shadcn & Tailwind",
  description = "Hundreds of finely crafted components built with React, Tailwind and Shadcn UI.",
  imageSrc = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
  imageAlt = "placeholder hero",
  buttonPrimary = {
    label: "Get Started",
    href: "https://shadcnblocks.com",
  },
  buttonSecondary = {
    label: "Learn More",
    href: "https://shadcnblocks.com",
  },
}: Hero2Props) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="grid items-center gap-8 md:gap-16 lg:grid-cols-2">
          
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="my-6 mt-0 text-5xl font-medium text-balance lg:text-6xl">
              {title}
            </h1>
            <p className="mb-8 max-w-xl text-muted-foreground lg:text-lg">
              {description}
            </p>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              <Button asChild>
                <a href={buttonPrimary.href} target="_blank">
                  {buttonPrimary.label}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={buttonSecondary.href} target="_blank">
                  {buttonSecondary.label}
                </a>
              </Button>
            </div>
          </div>
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-h-96 w-full rounded-md object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export { Hero2 }; 