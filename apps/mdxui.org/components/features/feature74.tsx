import { ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/code-windows/code-block";

type FeatureContent =
  | { type: "image"; src: string; alt: string }
  | { type: "code-block" }
  | { type: "video"; src: string; alt?: string; poster?: string };

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  content: FeatureContent;
}

interface Feature74Props {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    id: "feature-1",
    title: "Feature 1",
    description:
      "Nam vitae molestie arcu. Quisque eu libero orci. Aliquam imperdiet magna nec massa consectetur, id interdum ante congue.",
    content: {
      type: "image",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      alt: "Feature 1",
    },
  },
  {
    id: "feature-2",
    title: "Feature 2",
    description:
      "Nam vitae molestie arcu. Quisque eu libero orci. Aliquam imperdiet magna nec massa consectetur, id interdum ante congue.",
    content: { type: "code-block" },
  },
];

const renderFeatureContent = (content: FeatureContent) => {
  switch (content.type) {
    case "image":
      return (
        <img
          src={content.src}
          alt={content.alt}
          className="aspect-16/9 h-full w-full object-cover object-center"
        />
      );
    case "code-block":
      return <CodeBlock className="aspect-16/9 h-full" />;
    case "video":
      return (
        <video
          src={content.src}
          poster={content.poster}
          controls
          className="aspect-16/9 h-full w-full object-cover object-center"
          aria-label={content.alt}
        />
      );
    default:
      return null;
  }
};

const Feature74 = ({
  heading = "Feature name",
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig doloremque mollitia fugiat omnis!",
  ctaText = "Book a demo",
  ctaUrl = "#",
  features = defaultFeatures,
  className = "",
}: Feature74Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container flex flex-col gap-16 lg:px-16">
        <div className="lg:max-w-lg">
          <h2 className="mb-3 text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
            {heading}
          </h2>
          <p className="mb-8 text-md">{description}</p>
          <a
            href={ctaUrl}
            className="group flex items-center font-medium text-lg lg:text-md"
          >
            {ctaText}{" "}
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="grid gap-12 md:grid-cols-2 lg:gap-24">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={feature.id}
                className={`flex overflow-clip md:col-span-2 md:grid md:grid-cols-2 md:gap-6 lg:gap-16 ${
                  isEven ? "flex-col" : "flex-col-reverse"
                }`}
              >
                {isEven ? (
                  <>
                    <div className="lg:min-h-[20rem] xl:min-h-[24rem]">
                      {renderFeatureContent(feature.content)}
                    </div>
                    <div className="flex flex-col justify-center px-4 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
                      <h3 className="mb-3 text-xl font-semibold md:mb-4 md:text-2xl lg:mb-6">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground lg:text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col justify-center px-4 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
                      <h3 className="mb-3 text-xl font-semibold md:mb-4 md:text-2xl lg:mb-6">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground lg:text-lg">
                        {feature.description}
                      </p>
                    </div>
                    <div className="min-h-[24rem]">
                      {renderFeatureContent(feature.content)}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export {
  Feature74,
  type Feature74Props,
  type FeatureItem,
  type FeatureContent,
};
