"use client";

import { useEffect, useRef, useState } from "react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const items = [
  {
    title: "Explore Our Core Features",
    description: "Dive deep into the robust functionalities designed to streamline your workflow.",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    category: "Features",
  },
  {
    title: "Solutions for Every Scenario",
    description: {
      intro: "Discover how our platform addresses diverse challenges across various domains:",
      points: [
        "Enhancing team collaboration efficiency.",
        "Optimizing critical resource allocation.",
        "Streamlining complex data analysis."
      ]
    },
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
    category: "Solutions",
  },
  {
    title: "Building the Future Together",
    description: {
      intro: "Get a glimpse into our ongoing commitment to innovation and improvement:",
      points: [
        "Next-generation user interface design.",
        "Advanced analytics capabilities rollout.",
        "Expanded third-party integration ecosystem."
      ]
    },
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
    category: "Roadmap",
  },
];

const Gallery1 = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(items[0].category);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });

  useEffect(() => {
    const currentIndex = items.findIndex((item) => item.category === current);
    const activeTab = tabRefs.current[currentIndex];

    if (activeTab) {
      const { offsetWidth, offsetLeft } = activeTab;
      setIndicatorStyle({
        width: offsetWidth,
        left: offsetLeft,
      });
    }
  }, [current]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const currentIndex = items.findIndex((item) => item.category === current);
    api.scrollTo(currentIndex);

    const onSelect = () => {
      const idx = api.selectedScrollSnap();
      setCurrent(items[idx].category);
    };
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, current]);

  return (
    <section className="overflow-hidden py-32">
      <div className="container">
        <Carousel
          setApi={setApi}
          className="[&>div[data-slot=carousel-content]]:overflow-visible"
        >
          <div className="flex items-center justify-between">
            <Tabs
              value={current}
              onValueChange={setCurrent}
              className="mb-8 flex justify-center"
            >
              <TabsList className="relative h-auto gap-6 bg-transparent border-none">
                {items.map((item, idx) => (
                  <TabsTrigger
                    key={idx}
                    ref={(el) => {
                      tabRefs.current[idx] = el;
                    }}
                    value={item.category}
                    className="cursor-pointer text-base transition-all duration-700 ease-out border-none shadow-none hover:text-foreground px-3"
                  >
                    {item.category}
                  </TabsTrigger>
                ))}
                <div
                  className="absolute bottom-0 h-0.5 bg-primary transition-all duration-600 ease-out"
                  style={{
                    width: `${indicatorStyle.width}px`,
                    left: `${indicatorStyle.left}px`,
                  }}
                />
              </TabsList>
            </Tabs>
            <div className="hidden items-center gap-4 sm:flex">
              <CarouselPrevious className="static size-10 translate-0" />
              <CarouselNext className="static size-10 translate-0" />
            </div>
          </div>
          <CarouselContent className="max-w-4xl">
            {items.map((item, idx) => (
              <CarouselItem key={idx} className="w-fit max-w-4xl">
                <div className="grid h-full max-w-4xl gap-6 rounded-lg border border-border p-6 shadow-sm select-none sm:p-10 md:max-h-[450px] md:grid-cols-2 lg:gap-20 overflow-hidden">
                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-medium sm:text-4xl">
                        {item.title}
                      </h2>
                      <div className="mt-4 text-sm text-muted-foreground sm:mt-6">
                        {typeof item.description === 'string' ? (
                          item.description
                        ) : (
                          <>
                            <p>{item.description.intro}</p>
                            <ul className="my-4 ml-6 list-disc">
                              {item.description.points.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="link"
                      className="mt-0 w-fit p-0 text-sm font-medium text-primary hover:text-primary/80 sm:mt-6 cursor-pointer"
                    >
                      Learn more
                    </Button>
                  </div>
                  <div className="relative h-80 -mr-6 sm:-mr-10">
                    <img
                      src={item.image}
                      alt="placeholder"
                      className="h-full w-full object-cover rounded-l-lg"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Gallery1 }; 