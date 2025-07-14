import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Slide {
  id: number;
  tabName: string;
  title: string;
  description: string;
  features: string[];
  link: string;
  image: string;
  buttonText: string;
}

interface Gallery3Props {
  title?: string;
  subtitle?: string;
  slides?: Slide[];
  className?: string;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    tabName: "Products",
    title: "Pre-built Components",
    description:
      "Accelerate your workflow with our library of ready-to-use, fully customizable UI components",
    features: [
      "Cross-platform Integrations",
      "Responsive Components",
      "Accessible Blocks",
      "Customizable Templates",
    ],
    link: "#",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    buttonText: "Explore Products",
  },
  {
    id: 2,
    tabName: "Services",
    title: "Expert Solutions",
    description:
      "Our comprehensive services help you build, scale, and optimize your digital presence with expert guidance every step of the way.",
    features: [
      "Technical Consulting",
      "Implementation Support",
      "Ongoing Maintenance",
    ],
    link: "#",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
    buttonText: "View Services",
  },
  {
    id: 3,
    tabName: "Company",
    title: "Build the Future of AI",
    description:
      "Founded by industry experts, we're committed to creating tools that empower developers to build better digital experiences faster.",
    features: [
      "Remote-first Culture",
      "Open Source Contributors",
      "Community-driven",
    ],
    link: "#",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
    buttonText: "About Us",
  },
  {
    id: 4,
    tabName: "Portfolio",
    title: "Success Stories",
    description:
      "Explore our diverse portfolio of successful implementations across industries, from startups to enterprise-level organizations.",
    features: [
      "Case Studies",
      "Implementation Examples",
      "Success Metrics",
      "Client Testimonials",
    ],
    link: "#",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg",
    buttonText: "View Portfolio",
  },
  {
    id: 5,
    tabName: "Resources",
    title: "Power Your Development",
    description:
      "Access our comprehensive collection of tutorials, guides, and best practices to help you get the most from our platform.",
    features: [
      "Developer Guides",
      "Video Tutorials",
      "API Documentation",
      "Community Forums",
    ],
    link: "#",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-5.svg",
    buttonText: "Access Resources",
  },
];

const Gallery3 = ({
  title = "Building Better Digital Experiences",
  subtitle = "Discover how our platform empowers developers and businesses to create exceptional web applications with less code and more creativity.",
  slides = defaultSlides,
  className = ""
}: Gallery3Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        
        {/* Title */}
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <h2 className="text-center text-4xl font-semibold lg:text-5xl">
            {title}
          </h2>
          <p className="text-balance text-center text-md">
            {subtitle}
          </p>
        </div>

        <div className="mt-12">
          <Tabs
            defaultValue="1"
            className="mx-auto flex w-full flex-col items-center gap-8 md:gap-16"
          >
            <TabsList className="flex h-auto gap-x-3 gap-y-3 sm:gap-y-0 sm:gap-x-2 p-1 bg-transparent border-none flex-wrap justify-center">
              {slides.map((slide) => (
                <TabsTrigger
                  key={slide.id}
                  value={slide.id.toString()}
                  className="hover:bg-muted/50 hover:text-foreground text-md sm:text-sm cursor-pointer rounded-full px-3 py-1 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-300 ease-out flex-shrink-0 w-auto"
                >
                  {slide.tabName}
                </TabsTrigger>
              ))}
            </TabsList>
            {slides.map((slide) => (
              <TabsContent
                value={slide.id.toString()}
                key={slide.id}
                className="w-full max-w-5xl px-4 sm:px-0"
              >
                <div className="grid grid-cols-1 items-center gap-6 sm:gap-10 md:grid-cols-2">
                  <div>
                    <h2 className="mb-4 text-xl sm:text-2xl font-semibold lg:text-3xl text-pretty">
                      {slide.title}
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base lg:text-md">
                      {slide.description}
                    </p>
                    <ul className="mt-6 sm:mt-8 flex flex-col gap-2">
                      {slide.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="w-3 flex-shrink-0" />
                          <span className="font-medium text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" asChild>
                      <a href={slide.link} className="mt-6 sm:mt-8 w-full sm:w-fit">
                        {slide.buttonText}
                        <ArrowRight className="ml-1 w-4" />
                      </a>
                    </Button>
                  </div>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="order-first max-h-[300px] sm:max-h-[350px] w-full rounded-lg object-cover md:order-last"
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export { Gallery3, type Gallery3Props, type Slide }; 