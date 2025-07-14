import {
  Infinity as InfinityIcon,
  MessagesSquare,
  Zap,
  ZoomIn,
} from "lucide-react";

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Feature15Props {
  tagline?: string;
  title?: string;
  description?: string;
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    title: "Quality",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.",
    icon: <ZoomIn className="size-6" />,
  },
  {
    title: "Innovation",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.",
    icon: <Zap className="size-6" />,
  },
  {
    title: "Customer Support",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.",
    icon: <MessagesSquare className="size-6" />,
  },
  {
    title: "Reliability",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.",
    icon: <InfinityIcon className="size-6" />,
  },
];

const Feature15 = ({
  tagline = "WHY WE ARE UNIQUE",
  title = "Bringing the best to you by the best in the industry",
  description = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.",
  features = defaultFeatures,
  className = ""
}: Feature15Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="flex w-full flex-col items-center">
          <div className="flex flex-col items-center space-y-4 text-center sm:space-y-6 md:max-w-3xl md:text-center">
            <p className="text-sm text-muted-foreground">{tagline}</p>
            <h2 className="text-3xl font-medium md:text-5xl">
              {title}
            </h2>
            <p className="text-muted-foreground md:max-w-2xl">
              {description}
            </p>
          </div>
        </div>
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-2">
          {features.map((feature, idx) => (
            <div
              className="flex flex-col justify-between rounded-lg bg-accent p-6 md:min-h-[300px] md:p-8"
              key={idx}
            >
              <span className="mb-6 flex size-11 items-center justify-center rounded-full bg-background">
                {feature.icon}
              </span>
              <div>
                <h3 className="text-lg font-medium md:text-2xl">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Feature15, type Feature15Props, type FeatureItem };
