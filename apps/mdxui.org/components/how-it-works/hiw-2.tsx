interface Feature {
  title: string;
  description: string;
}

interface Hiw2Props {
  eyebrow?: string;
  heading?: string;
  features?: Feature[];
  className?: string;
}

const Hiw2 = ({
  eyebrow = "How it works",
  heading = "A better way to build business",
  features = [
    {
      title: "Performance",
      description: "Lorem ipsum dolor sit amet, consectetur adipis elit. Sunt beatae tenetur."
    },
    {
      title: "Innovation",
      description: "Lorem ipsum dolor sit amet, consectetur adipis elit. Sunt beatae tenetur."
    },
    {
      title: "Quality",
      description: "Lorem ipsum dolor sit amet, consectetur adipis elit. Sunt beatae tenetur."
    },
    {
      title: "Accessibility",
      description: "Lorem ipsum dolor sit amet, consectetur adipis elit. Sunt beatae tenetur."
    }
  ],
  className = ""
}: Hiw2Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <p className="mb-4 text-xs text-muted-foreground uppercase tracking-widest">{eyebrow}</p>
        <h2 className="text-3xl font-medium lg:text-4xl">
          {heading}
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="relative flex gap-3 rounded-lg border-dashed md:block md:border-l md:p-5">
              <span className="mb-8 flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary font-mono text-xs text-primary-foreground md:size-10">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-medium md:mb-2 md:text-xl">
                  {feature.title}
                  <span className="absolute -left-px hidden h-6 w-px bg-primary md:inline-block"></span>
                </h3>
                <p className="text-sm text-muted-foreground md:text-base">
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

export { Hiw2, type Hiw2Props, type Feature };
