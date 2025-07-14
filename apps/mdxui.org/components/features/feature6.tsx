import { Check } from "lucide-react";

interface Feature6Props {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  features?: string[];
  className?: string;
}

const defaultFeatures = [
  "Ready-to-use components built with MDX",
  "Fully responsive and accessible by default",
  "Easy customization with Tailwind CSS classes"
];

const Feature6 = ({
  title = "Blocks built with MDX UI",
  description = "Hundreds of finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  image = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
  imageAlt = "Website components showcase",
  features = defaultFeatures,
  className = ""
}: Feature6Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col lg:items-start lg:text-left">
            <h1 className="my-6 text-pretty text-3xl font-semibold lg:text-4xl">
              {title}
            </h1>
            <p className="mb-8 max-w-xl text-base text-muted-foreground">
              {description}
            </p>
            <ul className="ml-4 space-y-4 text-left">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="size-5" />
                  <p className="text-base">
                    {feature}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <img
            src={image}
            alt={imageAlt}
            className="max-h-96 w-full rounded-md object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export { Feature6, type Feature6Props };
