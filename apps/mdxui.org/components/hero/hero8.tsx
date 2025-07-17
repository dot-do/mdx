import { ArrowRight } from "lucide-react";
import React from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { badgeVariants } from "@/components/ui/badge";

interface Hero8Props {
  badgeText?: string;
  title?: string;
  description?: string;
  primaryButton?: {
    text: string;
    icon?: string;
    href?: string;
  };
  secondaryButton?: {
    text: string;
    icon?: string;
    href?: string;
  };
  disclaimer?: string;
  heroImage?: string;
  heroImageAlt?: string;
  className?: string;
}

const Hero8 = ({
  badgeText = "MDX UI Blocks",
  title = "Blocks Built With MDX, Shadcn & Tailwind.",
  description = "Finely crafted components built with React, Tailwind and Shadcn UI.",
  primaryButton = {
    text: "Sign up with Google",
    icon: "google",
    href: "#",
  },
  secondaryButton = {
    text: "Sign up with Github",
    icon: "github",
    href: "#",
  },
  disclaimer = "No credit card required",
  heroImage = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg",
  heroImageAlt = "Block Logo",
  className = "",
}: Hero8Props) => {
  return (
    <section className={`bg-background py-32 px-0 sm:px-4 ${className}`}>
      <div className="relative container flex flex-col items-center">
        <div className="flex w-full flex-col items-center justify-between gap-8 overflow-hidden rounded-xl shadow-lg shadow-gray-100 dark:shadow-gray-950 border-border bg-muted/20 sm:border lg:flex-row lg:p-12">
          {/* Left Content */}
          <div className="flex w-full flex-col gap-8">
            <a
              href="#"
              className={`${badgeVariants({
                variant: "outline",
              })} border-muted2 mb-4 flex w-fit items-center gap-1 rounded-full border bg-muted/30 px-2.5 py-1.5 hover:border-primary/20`}
            >
                             <p className="text-sm font-medium text-primary">
                 {badgeText}
               </p>
              <ArrowRight className="h-4 w-4 stroke-primary" />
            </a>

            <h1 className="text-6xl font-semibold tracking-tight leading-16 sm:max-w-xl">
              {title}
            </h1>

            <p className="text-lg font-normal tracking-tight">
              {description}
            </p>

            <div className="flex w-full flex-col gap-4 lg:flex-row">
              <Button
                className="text-md h-10 w-full rounded-md bg-primary text-primary-foreground"
                asChild
              >
                <a
                  href={primaryButton.href}
                  className="flex items-center justify-center gap-2"
                >
                  {primaryButton.icon === "google" && (
                    <FcGoogle className="size-5" />
                  )}
                  {primaryButton.icon &&
                    primaryButton.icon !== "google" &&
                    primaryButton.icon}
                  {primaryButton.text}
                </a>
              </Button>

              <Button
                variant="outline"
                className="text-md h-10 w-full rounded-md"
                asChild
              >
                <a
                  href={secondaryButton.href}
                  className="flex items-center justify-center gap-2"
                >
                  {secondaryButton.icon === "github" && (
                    <FaGithub className="size-5" />
                  )}
                  {secondaryButton.icon &&
                    secondaryButton.icon !== "github" &&
                    secondaryButton.icon}
                  {secondaryButton.text}
                </a>
              </Button>
            </div>

            <p className="text-center sm:text-left text-sm text-muted-foreground">
              {disclaimer}
            </p>
          </div>

          {/* Right Content */}
          <div className="w-full">
            <div className="ml-0 flex h-[500px] w-full flex-col items-center justify-center rounded-xl border border-border bg-muted/50 p-2 lg:ml-32">
              <Card className="relative h-full w-full rounded-lg border">
                <CardContent className="flex h-full w-full items-center justify-center p-0">
                  {/* Window Content */}
                  <img className="size-60" alt={heroImageAlt} src={heroImage} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero8, type Hero8Props };
