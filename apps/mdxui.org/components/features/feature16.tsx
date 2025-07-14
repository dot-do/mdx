import { Timer, Zap, ZoomIn, LucideIcon } from "lucide-react";

interface FeatureItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Feature16Props {
  subtitle?: string;
  title?: string;
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    id: "performance",
    icon: Timer,
    title: "Performance",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt beatae tenetur totam aut blanditis ipsa quaerat neque eaque, atque doloremque! Eligendi.",
  },
  {
    id: "quality",
    icon: ZoomIn,
    title: "Quality",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt beatae tenetur totam aut blanditis ipsa quaerat neque eaque, atque doloremque! Eligendi.",
  },
  {
    id: "innovation",
    icon: Zap,
    title: "Innovation",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt beatae tenetur totam aut blanditis ipsa quaerat neque eaque, atque doloremque! Eligendi.",
  },
];

const Feature16 = ({
  subtitle = "Our Values",
  title = "Why Choose Us?",
  features = defaultFeatures,
  className = ""
}: Feature16Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <p className="mb-4 text-sm text-muted-foreground tracking-wide uppercase font-mono">
          {subtitle}
        </p>
        <h2 className="text-3xl font-medium lg:text-4xl">{title}</h2>
        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-3">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.id} className="rounded-lg bg-accent p-5">
                <span className="mb-8 flex">
                  <IconComponent className="size-5" />
                </span>
                <h3 className="mb-2 text-xl font-medium">{feature.title}</h3>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { Feature16, type Feature16Props, type FeatureItem };
