import { Button } from "@/components/ui/button";

interface Feature {
  image: string;
  title: string;
  description: string;
}

interface Timeline3Props {
  heading?: string;
  description?: string;
  buttons?: {
    primary: {
      text: string;
      url: string;
    };
    secondary: {
      text: string;
      url: string;
    };
  };
  features?: Feature[];
}

const Timeline3 = ({
  heading = "Experience the difference with us",
  description = "We believe in creating lasting partnerships with our clients, focusing on long-term success through collaborative innovation and dedicated support.",
  buttons = {
    primary: {
      text: "Start Now",
      url: "#",
    },
    secondary: {
      text: "Book a demo",
      url: "#",
    },
  },
  features = [
    {
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg",
      title: "Dedicated Support",
      description:
        "Expanded operations to 5 new countries, reaching millions of new users.",
    },
    {
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-5.svg",
      title: "Series B Funding",
      description:
        "Secured $50M in Series B funding to accelerate product development.",
    },
    {
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-5.svg",
      title: "Product Launch",
      description: "Successfully launched our flagship product to market.",
    },
  ],
}: Timeline3Props) => {
  return (
    <section className="py-32">
      <div className="container max-w-7xl">
        <div className="relative grid gap-16 md:grid-cols-2">
          <div className="top-40 h-fit md:sticky">
            <h2 className="mt-4 mb-6 text-4xl font-semibold md:text-5xl">
              {heading}
            </h2>
            <p className="font-base text-muted-foreground text-base md:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-4 lg:flex-row">
              <Button className="gap-2" size="lg" asChild>
                <a href={buttons.primary.url}>{buttons.primary.text}</a>
              </Button>
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-12 md:gap-20">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg border p-2">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="aspect-video w-full rounded-md object-cover"
                />
                <div className="p-6">
                  <h3 className="mb-1 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-base text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Timeline3 };
