import { CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureItem {
  title: string;
  description: string;
  features: string[];
  image: string;
  imageAlt: string;
}

interface Hiw1Props {
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    title: "Secure Payments",
    description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Pariatur modi et recusandae ducimus eligendi eveniet soluta reprehenderit nostrum expedita omnis.",
    features: [
      "Secure payment gateway integration with Stripe",
      "SSL encryption for secure transactions",
      "Payment tracking and history"
    ],
    image: "https://cdn.dribbble.com/userupload/42933863/file/original-722680fd0d3c24303edc92e4cd43bcaa.jpg?resize=2048x1536&vertical=center",
    imageAlt: "Secure payments illustration"
  },
  {
    title: "Automated Invoicing",
    description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Pariatur modi et recusandae ducimus eligendi eveniet soluta reprehenderit nostrum expedita omnis.",
    features: [
      "Automated invoicing for easy billing",
      "Email notifications for invoices",
      "Invoice tracking and history"
    ],
    image: "https://cdn.dribbble.com/userupload/42933864/file/original-0c9221049c00eefa7a04cc48fd128a72.jpg?resize=2048x1536&vertical=center",
    imageAlt: "Automated invoicing illustration"
  },
  {
    title: "Automated Notifications",
    description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Pariatur modi et recusandae ducimus eligendi eveniet soluta reprehenderit nostrum expedita omnis.",
    features: [
      "Automated invoicing for easy billing",
      "Email notifications for invoices"
    ],
    image: "https://cdn.dribbble.com/userupload/20500118/file/original-470a6b773163cf0e9a5249c6990f28a0.jpg?resize=2048x1536&vertical=center",
    imageAlt: "Automated invoicing illustration"
  }
];

const Hiw1 = ({ features = defaultFeatures, className = "" }: Hiw1Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="space-y-10 py-10 md:px-4">
          {features.map((feature, index) => (
            <div key={index} className="grid rounded-lg border md:grid-cols-2 overflow-hidden">
              <div className="flex flex-col px-6 py-8 lg:px-8 lg:py-12 xl:px-12 xl:py-20">
                <h3 className="mb-3 text-2xl font-medium sm:mb-5 md:text-3xl lg:text-4xl">
                  {feature.title}
                </h3>
                <div className="mb-8 text-sm text-muted-foreground sm:mb-10 md:text-base">
                  {feature.description}
                </div>
                <ul className="mt-auto space-y-2 sm:space-y-3 mb-4">
                  {feature.features.map((featureItem, featureIndex) => (
                    <li key={featureIndex} className="flex gap-x-3">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 sm:mt-1" />
                      <p className="text-sm md:text-base">
                        {featureItem}
                      </p>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="ghost" 
                  className="mt-4 w-fit px-0 text-primary hover:text-primary/80 hover:bg-transparent cursor-pointer"
                >
                  Learn More
                  <ChevronRight className="ml-2 size-4" />
                </Button>

              </div>

              {/* image */}
              <div className="relative order-first max-h-80 md:order-last md:max-h-[500px]">
                <img
                  src={feature.image}
                  alt={feature.imageAlt}
                  className="h-full w-full object-cover rounded-r-lg"
                />
                <span className="absolute top-5 left-5 flex size-6 items-center justify-center rounded-sm bg-primary font-mono text-xs text-primary-foreground md:top-10 md:left-10">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Hiw1, type Hiw1Props, type FeatureItem }; 