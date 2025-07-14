import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MdxuiLogo } from "@/components/mdxui-logo";

interface Hero11Props {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  showLogo?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  showImage?: boolean;
}

const Hero11 = ({
  title = "Build your next project with Blocks",
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig doloremque mollitia fugiat omnis! Porro facilis quo animi consequatur. Explicabo.",
  buttonText = "Get Started",
  buttonHref = "#",
  showLogo = true,
  imageSrc = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-8-wide.svg",
  imageAlt = "placeholder",
  showImage = true,
}: Hero11Props) => {
  return (
    <section className="pt-32 border-b border-border">
      <div className="container px-0 sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="z-10 flex flex-col items-center gap-6 text-center sm:max-w-3xl">
            {showLogo && (
              <div className="h-10 md:h-16 flex items-center">
                <MdxuiLogo />
              </div>
            )}
            <div>
              <h1 className="mb-4 text-5xl font-medium text-pretty lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-3xl text-muted-foreground lg:text-xl">
                {description}
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <a href={buttonHref}>
                {buttonText}
                <ChevronRight className="h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Need to dynamic for image or code window component */}
        {showImage && (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="mt-20 w-full rounded-t-lg object-cover h-[400px] lg:h-[500px] max-w-3xl mx-auto"
          />
        )}

      </div>
    </section>
  );
};

export { Hero11 };
