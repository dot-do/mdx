import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface Hero58Props {
  heading?: string;
  headingHighlight?: string;
  description?: string;
  buttonText?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  imageSrc?: string;
  imageAlt?: string;
  showButton?: boolean;
  className?: string;
  headingClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
  imageClassName?: string;
  showGridBackground?: boolean;
}

const Hero58 = ({
  heading = "Your workspace",
  headingHighlight = "anywhere.",
  description = "Set up your environment with everything you need and share it effortlessly. Stay productive throughout your workflow, no matter where you are.",
  buttonText = "Get Started",
  buttonIcon = <ArrowRight className="size-4 ml-2" />,
  onButtonClick,
  imageSrc = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/illustrations/tokyo-selecting-the-elements-of-the-horizontal-graph-chart.svg",
  imageAlt = "Hero illustration",
  showButton = true,
  className = "",
  headingClassName = "",
  descriptionClassName = "",
  buttonClassName = "",
  imageClassName = "",
  showGridBackground = true,
}: Hero58Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-8 lg:gap-12">
            <h1
              className={`text-5xl font-semibold lg:text-7xl ${headingClassName}`}
            >
              {heading} <br />
              <span className="mx-1 inline-block whitespace-nowrap">
                {headingHighlight}
              </span>
            </h1>
            <p
              className={`text-muted-foreground lg:text-lg ${descriptionClassName}`}
            >
              {description}
            </p>
            {showButton && (
              <Button
                size="lg"
                className={`w-fit ${buttonClassName}`}
                onClick={onButtonClick}
              >
                {buttonText}
                {buttonIcon}
              </Button>
            )}
          </div>
          <div className="relative">
            {showGridBackground && (
              <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_100%_at_50%_50%,#000_60%,transparent_100%)] bg-[size:64px_64px]"></div>
            )}
            <img
              src={imageSrc}
              alt={imageAlt}
              className={`mx-auto max-h-[600px] ${imageClassName}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero58 };
export type { Hero58Props };
