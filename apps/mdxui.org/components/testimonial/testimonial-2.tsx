interface Testimonial3Props {
  quote: string;
  author: string;
  logoSrc?: string;
  logoAlt?: string;
  className?: string;
}

const Testimonial3 = ({
  quote,
  author,
  logoSrc = "/DoIcon.svg",
  logoAlt = "shadcn",
  className = "",
}: Testimonial3Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="flex flex-col items-center gap-6 border-y py-14 text-center md:py-24">
          <q className="block max-w-5xl text-2xl font-medium lg:text-2xl leading-10">
            {quote}
          </q>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            {logoSrc && (
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-7"
              />
            )}
            <p className="font-medium">{author}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Testimonial3, type Testimonial3Props };
