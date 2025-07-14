import { DollarSign, KeyRound, Timer, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Feature89Props {
  tagline?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    icon: <Timer />,
    title: "Maximize efficiency",
    description: "Skip the manual tasks and complex setups. With Streamline, you can focus on what matters most while the system handles the rest."
  },
  {
    icon: <DollarSign />,
    title: "Optimize resources",
    description: "Don't overspend on unnecessary tools or teams. Keep your operations lean and efficient by automating your workflows with Streamline."
  },
  {
    icon: <KeyRound />,
    title: "Simplify operations",
    description: "Say goodbye to managing multiple platforms. Streamline takes care of all the heavy lifting, ensuring consistent results with minimal hassle."
  }
];

const Feature89 = ({
  tagline = "Solution",
  title = "Let MDXUI handle the details",
  description = "Streamline optimizes your workflow from start to finish. It gathers information, generates reports, automates tasks.",
  image = "https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  imageAlt = "placeholder",
  features = defaultFeatures,
  className = ""
}: Feature89Props) => {
  return (
    <section className={`overflow-hidden py-32 ${className}`}>
      <div className="relative container">
        <div className="pointer-events-none absolute inset-0 -top-20 -z-10 mx-auto hidden h-[500px] w-[500px] bg-[radial-gradient(var(--color-gray-400)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,white_250px,transparent_250px)] [background-size:6px_6px] opacity-25 lg:block"></div>
        <div className="relative flex flex-col gap-8 lg:flex-row lg:justify-between lg:gap-16">
          <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-t from-background via-transparent to-transparent lg:block"></div>

          <div className="w-full sm:max-w-md shrink-0 justify-between">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              {tagline}
            </p>
            <h2 className="mt-6 mb-3 text-4xl font-medium lg:text-5xl">
              {title}
            </h2>
            <p className="text-md text-muted-foreground">
              {description}
            </p>
          {/*
            Reusable CTA button, similar to gallery2.tsx.
            You may want to make the CTA text and link customizable via props in the future.
          */}
          <Button className="group mt-10 flex w-fit items-center justify-center gap-2 rounded-full tracking-tight">
            <a href="#" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:rotate-0" />
            </a>
          </Button>
          </div>
          <div className="w-full max-w-3xl shrink-0">
            <img
              src={image}
              alt={imageAlt}
              className="max-h-[450px] w-full max-w-3xl min-w-0 lg:min-w-[450px] rounded-lg border object-cover"
            />
          </div>
        </div>
        <div className="relative mt-8 grid md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
              {feature.icon}
              <div>
                <h3 className="text-lg font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
          <div className="absolute top-0 -right-4 -left-4 h-px bg-input md:hidden"></div>
          <div className="absolute top-[-0.5px] -right-4 -left-4 row-start-2 h-px bg-input md:hidden"></div>
          <div className="absolute top-[-0.5px] -right-4 -left-4 row-start-3 h-px bg-input md:hidden"></div>
          <div className="absolute -right-4 bottom-0 -left-4 row-start-4 h-px bg-input md:hidden"></div>
          <div className="absolute -top-2 bottom-0 -left-2 w-px bg-input md:hidden"></div>
          <div className="absolute -top-2 -right-2 bottom-0 col-start-2 w-px bg-input md:hidden"></div>
          <div className="absolute top-0 -right-2 -left-2 hidden h-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 left-0 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 -left-[0.5px] col-start-2 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 bottom-0 -left-[0.5px] col-start-3 hidden w-px bg-input md:block"></div>
          <div className="absolute -top-2 right-0 bottom-0 hidden w-px bg-input md:block"></div>
        </div>
      </div>
    </section>
  );
};

export { Feature89, type Feature89Props, type FeatureItem };
