import { Check, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PlanFeature = {
  feature: string;
  pro: string | boolean;
  entreprise: string | boolean;
};

interface PlanData {
  title: string;
  description: string;
  price: string;
  priceSubtext: string;
  buttonText: string;
  buttonVariant?: "default" | "outline";
  buttonUrl?: string;
}

interface Pricing5Props {
  heading?: string;
  description?: string;
  plans?: {
    pro?: PlanData;
    entreprise?: PlanData;
  };
  features?: PlanFeature[];
  className?: string;
}

const defaultFeatures: PlanFeature[] = [
  {
    feature: "Projects",
    pro: "Unlimited",
    entreprise: "Unlimited",
  },
  {
    feature: "Integrations",
    pro: "Unlimited",
    entreprise: "Unlimited",
  },
  { feature: "Live Collaboration", pro: true, entreprise: true },
  {
    feature: "Custom permissions",
    pro: true,
    entreprise: true,
  },
  {
    feature: "Team members",
    pro: "$5/month per member",
    entreprise: "$5/month per member",
  },
  {
    feature: "Basic reports",
    pro: true,
    entreprise: true,
  },
  { feature: "Advanced reports", pro: false, entreprise: true },
  { feature: "Export data", pro: false, entreprise: true },
];

const Pricing5 = ({
  heading = "Pricing",
  description = "Lorem ipsum dolor sit amet consectetur adipisicing.",
  plans = {
    pro: {
      title: "Pro",
      description: "Lorem ipsum dolor sit.",
      price: "$10",
      priceSubtext: "per user per month",
      buttonText: "Get Started",
      buttonVariant: "default",
      buttonUrl: "#",
    },
    entreprise: {
      title: "Entreprise",
      description: "Lorem ipsum dolor sit.",
      price: "Contact us",
      priceSubtext: "Get in touch with us",
      buttonText: "Get Started",
      buttonVariant: "outline",
      buttonUrl: "#",
    },
  },
  features = defaultFeatures,
  className = "",
}: Pricing5Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="mb-2 text-3xl font-semibold lg:text-5xl">{heading}</h2>
            <p className="text-muted-foreground lg:text-lg">
              {description}
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:gap-0">
            <Card className="flex w-full flex-col justify-between gap-8 text-center lg:rounded-r-none lg:border-r-0">
              <CardHeader>
                <CardTitle>{plans.pro?.title}</CardTitle>
                <p className="text-muted-foreground">{plans.pro?.description}</p>
              </CardHeader>
              <CardContent>
                <span className="text-5xl font-bold">{plans.pro?.price}</span>
                <p className="mt-3 text-muted-foreground">{plans.pro?.priceSubtext}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plans.pro?.buttonVariant} asChild>
                  <a href={plans.pro?.buttonUrl}>{plans.pro?.buttonText}</a>
                </Button>
              </CardFooter>
            </Card>
            <Separator
              orientation="vertical"
              className="hidden h-auto lg:block"
            />
            <Card className="flex w-full flex-col justify-between gap-8 text-center lg:rounded-l-none lg:border-l-0">
              <CardHeader>
                <CardTitle>{plans.entreprise?.title}</CardTitle>
                <p className="text-muted-foreground">{plans.entreprise?.description}</p>
              </CardHeader>
              <CardContent>
                <span className="text-4xl font-bold">{plans.entreprise?.price}</span>
                <p className="mt-3 text-muted-foreground">{plans.entreprise?.priceSubtext}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plans.entreprise?.buttonVariant} asChild>
                  <a href={plans.entreprise?.buttonUrl}>{plans.entreprise?.buttonText}</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="mt-10 overflow-x-auto">
            <Table className="min-w-[420px]">
              <TableHeader>
                <TableRow className="hover:bg-background">
                  <TableHead></TableHead>
                  <TableHead className="font-bold text-primary">{plans.pro?.title}</TableHead>
                  <TableHead className="font-bold text-primary">
                    {plans.entreprise?.title}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((item) => (
                  <TableRow key={item.feature} className="hover:bg-background">
                    <TableCell className="whitespace-normal break-words">{item.feature}</TableCell>
                    <TableCell className="whitespace-normal break-words">
                      {typeof item.pro === "boolean" ? (
                        item.pro ? (
                          <Check className="size-6" />
                        ) : (
                          <Minus className="size-6" />
                        )
                      ) : (
                        item.pro
                      )}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words">
                      {typeof item.entreprise === "boolean" ? (
                        item.entreprise ? (
                          <Check className="size-6" />
                        ) : (
                          <Minus className="size-6" />
                        )
                      ) : (
                        item.entreprise
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing5, type Pricing5Props, type PlanFeature, type PlanData };
