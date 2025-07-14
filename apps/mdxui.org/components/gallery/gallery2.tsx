"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React, { useState } from "react";

import { useIsMobile } from "../../hooks/use-mobile";

import { Button } from "@/components/ui/button";

interface Gallery2Props {
  title?: string;
  subcopy?: string;
  ctaText?: string;
  ctaLink?: string;
}

const images = [
  {
    id: 1,
    src: "https://cdn.dribbble.com/userupload/11392583/file/original-4640cc21984658e495a6e6c62d24ba34.png?resize=1504x919&vertical=center",
    title: "Functions",
    code: "functions.do",
    button: "View docs",
    link: "https://functions.do/docs",
  },
  {
    id: 2,
    src: "https://cdn.dribbble.com/userupload/10099299/file/original-6dadbb72568b149fd8f7b298fa392625.jpg?resize=1504x1128&vertical=center",
    title: "Workflows",
    code: "workflows.do",
    button: "Learn more",
    link: "https://workflows.do/docs",
  },
  {
    id: 3,
    src: "https://cdn.dribbble.com/userupload/14555168/file/original-5cbb7d56158c231c60d66a08277e1d3d.png?resize=2048x1536&vertical=center",
    title: "Databases",
    code: "databases.do",
    button: "Explore",
    link: "https://databases.do",
  },
  {
    id: 4,
    src: "https://cdn.dribbble.com/userupload/16994810/file/original-c6a72b1649c9ba7b49f8b363761c669f.jpg?resize=2048x1536&vertical=center",
    title: "Agents",
    code: "agents.do",
    button: "Get started",
    link: "https://agents.do",
  },
  
];

const Gallery2 = ({ 
  title = "Build Autonomous Businesses",
  subcopy = "We deliver Autonomous businesses at scale. Welcome to the era of business as code and software as a service.",
  ctaText = "Get Started",
  ctaLink = "#"
}: Gallery2Props) => {
  const [activeImage, setActiveImage] = useState<number | null>(1);

  return (
    <section className="py-32">
      <div className="relative container overflow-x-clip">
        <div className="flex flex-col items-center justify-center">
          <h1 className="max-w-xl text-center font-playfair text-5xl tracking-tighter italic md:text-6xl">
            {title}
          </h1>
          <p className="text-md my-10 max-w-lg text-center opacity-50">
            {subcopy}
          </p>

          <div className="flex w-full items-center justify-center gap-1">
            {images
              .slice(0, useIsMobile() ? 4 : images.length)
              .map((image, index) => (
                <motion.div
                  key={image.id}
                  className="relative cursor-pointer overflow-hidden rounded-lg border"
                  initial={{ width: "2.5rem", height: "20rem" }}
                  animate={{
                    width: activeImage === index ? "45rem" : "6rem",
                    height: activeImage === index ? "25rem" : "25rem",
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onClick={() => setActiveImage(index)}
                  onHoverStart={() => setActiveImage(index)}
                >
                  <AnimatePresence>
                    {activeImage === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute h-full w-full bg-gradient-to-t from-black/80 to-transparent"
                      />
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {activeImage === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute flex h-full w-full flex-col items-end justify-end px-4 pb-10"
                      >
                        <p className="text-left text-xs text-white/50">
                          {image.code}
                        </p>
                        <h3 className="w-42 text-right text-3xl font-bold text-white lg:w-fit lg:whitespace-nowrap">
                          {image.title.split(" ")[0]}
                          <span className="font-playfair italic">
                            {" "}
                            {image.title.split(" ")[1]}{" "}
                          </span>
                        </h3>
                        {image.button && (
                          <a
                            href={image.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex w-32 items-center justify-center gap-2 rounded-full bg-background px-4 py-2 text-xs whitespace-nowrap hover:bg-background/90 transition-colors"
                          >
                            {image.button}
                          </a>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <img
                    src={image.src}
                    className="size-full object-cover"
                    alt={image.title}
                  />
                </motion.div>
              ))}
          </div>
          <Button className="group mt-10 flex w-fit items-center justify-center gap-2 rounded-full tracking-tight">
            <a href={ctaLink} className="flex items-center gap-2">
              {ctaText}
              <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:rotate-0" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export { Gallery2 }; 