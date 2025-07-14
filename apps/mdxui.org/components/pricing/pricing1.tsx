"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  badge: string;
  monthlyPrice: number;
  yearlyPrice: number;
  pricePrefix?: string;
  monthlyPriceSubtext?: string;
  yearlyPriceSubtext?: string;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonAction?: () => void;
  highlighted?: boolean;
}

interface Pricing1Props {
  title?: string;
  description?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  tiers?: PricingTier[];
  defaultBilling?: 'monthly' | 'yearly';
  currencySymbol?: string;
  className?: string;
}

// Default configuration for backward compatibility
const defaultTiers: PricingTier[] = [
  {
    name: "Free",
    badge: "FREE",
    pricePrefix: "$",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: "Unlimited Integrations", included: true },
      { text: "Windows, Linux, Mac support", included: true },
      { text: "24/7 Support", included: true },
      { text: "Free updates", included: true },
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    name: "Pro",
    badge: "PRO",
    pricePrefix: "$",
    monthlyPrice: 9,
    yearlyPrice: 99,
    monthlyPriceSubtext: "Per month",
    yearlyPriceSubtext: "Per month",
    features: [
      { text: "Everything in FREE", included: true },
      { text: "Live call suport every month", included: true },
      { text: "Unlimited Storage", included: true },
    ],
    buttonText: "Purchase",
    buttonVariant: "outline",
  },
  {
    name: "Elite",
    badge: "ELITE",
    pricePrefix: "$",
    monthlyPrice: 25,
    yearlyPrice: 249,
    monthlyPriceSubtext: "Per month",
    yearlyPriceSubtext: "Per month",
    features: [
      { text: "Everything in PRO", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: true },
      { text: "Unlimited users", included: true },
    ],
    buttonText: "Purchase",
    buttonVariant: "default",
    highlighted: true,
  },
  
];

const Pricing1 = ({
  title = "Pricing",
  description = "Choose the perfect plan for your needs. All plans include a 14-day free trial. No credit card required.",
  monthlyLabel = "Monthly",
  yearlyLabel = "Yearly",
  tiers = defaultTiers,
  defaultBilling = 'monthly',
  currencySymbol = "$",
  className = "",
}: Pricing1Props) => {
  const [isAnnually, setIsAnnually] = useState(defaultBilling === 'yearly');

  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <h2 className="text-pretty text-4xl font-semibold lg:text-5xl">
            {title}
          </h2>
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
            <p className="text-muted-foreground max-w-2xl text-base lg:text-lg">
              {description}
            </p>
            <div className="bg-muted flex h-10 w-fit shrink-0 items-center rounded-md p-1 text-base">
              <RadioGroup
                defaultValue={defaultBilling}
                className="h-full grid-cols-2"
                onValueChange={(value) => {
                  setIsAnnually(value === "yearly");
                }}
              >
                <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-md transition-all'>
                  <RadioGroupItem
                    value="monthly"
                    id="monthly"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="monthly"
                    className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center px-7 font-semibold"
                  >
                    {monthlyLabel}
                  </Label>
                </div>
                <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-md transition-all'>
                  <RadioGroupItem
                    value="yearly"
                    id="yearly"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="yearly"
                    className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center gap-1 px-7 font-semibold"
                  >
                    {yearlyLabel}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="flex w-full flex-col items-stretch gap-6 md:flex-row">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`flex w-full flex-col rounded-lg border p-6 text-left ${
                  tier.highlighted ? 'bg-muted' : ''
                }`}
              >
                <Badge className="mb-8 block w-fit">{tier.badge}</Badge>
                <span className="text-4xl font-medium">
                  {tier.pricePrefix || currencySymbol}
                  {isAnnually ? tier.yearlyPrice : tier.monthlyPrice}
                </span>
                <p className="text-sm text-muted-foreground">
                  {isAnnually ? (
                    tier.yearlyPriceSubtext || (tier.monthlyPrice === 0 && tier.yearlyPrice === 0 ? 
                      <span className="invisible">Per year</span> : 
                      'Per year'
                    )
                  ) : (
                    tier.monthlyPriceSubtext || (tier.monthlyPrice === 0 && tier.yearlyPrice === 0 ? 
                      <span className="invisible">Per month</span> : 
                      'Per month'
                    )
                  )}
                </p>
                <Separator className="my-6" />
                <div className="flex h-full flex-col justify-between gap-20">
                  <ul className="text-muted-foreground space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="size-4" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.buttonVariant || "default"}
                    onClick={tier.buttonAction}
                  >
                    {tier.buttonText}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Component with default props for backward compatibility
const Pricing1WithDefaults = (props: Partial<Pricing1Props>) => (
  <Pricing1 
    {...props} 
    description={props.description || "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat odio, expedita neque ipsum pariatur suscipit!"}
  />
);

export { Pricing1, Pricing1WithDefaults, type PricingTier, type PricingFeature, type Pricing1Props };
