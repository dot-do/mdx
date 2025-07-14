import { Navbar } from "@/components/navbar";
import { Showcase } from "@/components/showcase";
import { SectionHeader } from "@/components/section-header";

// Hero Components
import { Hero2 } from "@/components/hero/hero2";
import { Hero8 } from "@/components/hero/hero8";
import { Hero58 } from "@/components/hero/hero58";
import { Hero11 } from "@/components/hero/hero11";
import { Hero175 } from "@/components/hero/hero175";

// Features Components
import { Feature6 } from "@/components/features/feature6";
import { Feature7 } from "@/components/features/feature7";
import { Feature15 } from "@/components/features/feature15";
import { Feature16 } from "@/components/features/feature16";
import { Feature18 } from "@/components/features/feature18";
import { Feature74 } from "@/components/features/feature74";
import { Feature89 } from "@/components/features/feature89";
import { Timeline3 } from "@/components/features/feature111";

// How it works Components
import { Hiw1 } from "@/components/how-it-works/hiw-1";
import { Hiw2 } from "@/components/how-it-works/hiw-2";

// Bento Components
import { Bento1 } from "@/components/bento/bento-1";
import { Bento2 } from "@/components/bento/bento-2";

// Gallery Components
import { Gallery1 } from "@/components/gallery/gallery1";
import { Gallery2 } from "@/components/gallery/gallery2";
import { Gallery3 } from "@/components/gallery/gallery3";
import { Gallery4 } from "@/components/gallery/gallery4";
import { Gallery5 } from "@/components/gallery/gallery5";

// Navbar Components
import { Navbar2 } from "@/components/navbars/navbar2";

// FAQ Components
import { Faq1 } from "@/components/faqs/faq1";
import { Faq2 } from "@/components/faqs/faq2";

// Pricing Components
import { Pricing1 } from "@/components/pricing/pricing1";
import { Pricing34 } from "@/components/pricing/pricing34";
import { Pricing5 } from "@/components/pricing/pricing5";
import { Pricing6 } from "@/components/pricing/pricing6";
import { Pricing8 } from "@/components/pricing/pricing8";

// Code Windows Components
import { CodeBlock } from "@/components/code-windows/code-block";
import { Code1 } from "@/components/code-windows/code-1";
import { Code11 } from "@/components/code-windows/code-1.1";
import { Code2 } from "@/components/code-windows/code-2";
import { Code3 } from "@/components/code-windows/code-3";
import { Code4 } from "@/components/code-windows/code-4";
import { Code5 } from "@/components/code-windows/code-5";
import { Code6 } from "@/components/code-windows/code-6";

// CTA Components
import { Cta1 } from "@/components/cta/cta-1";
import { Cta2 } from "@/components/cta/cta-2";
import { Cta3 } from "@/components/cta/cta-3";

// Testimonial Components
import { Testimonial3 } from "@/components/testimonial/testimonial-2";

// Footer Components
import { Footer1 } from "@/components/footers/footer1";
import { Footer2 } from "@/components/footers/footer2";
import { Footer3 } from "@/components/footers/footer3";
import { Footer4 } from "@/components/footers/footer4";

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Navbars Section */}
        <section className="mb-12">
          <SectionHeader title="Navbars" />

          <Showcase id="navbar-2" title="Navbar-2">
            <Navbar2 />
          </Showcase>
        </section>

        {/* Hero Section */}
        <section className="mb-12">
          <SectionHeader title="Hero" />

          <Showcase id="hero-1" title="Hero-1">
            <Hero58 />
          </Showcase>

          <Showcase id="hero-2" title="Hero-2">
            <Hero2
              title="Blocks built with Shadcn & Tailwind"
              description="Hundreds of finely crafted components built with React, Tailwind and Shadcn UI."
              imageSrc="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
              imageAlt="placeholder hero"
              buttonPrimary={{
                label: "Get Started",
                href: "https://shadcnblocks.com",
              }}
              buttonSecondary={{
                label: "Learn More",
                href: "https://shadcnblocks.com",
              }}
            />
          </Showcase>

          <Showcase id="hero-11" title="Hero-2">
            <Hero11 />
          </Showcase>

          <Showcase id="hero-175" title="Hero-3">
            <Hero175 />
          </Showcase>

          <Showcase id="hero-8" title="Hero-4">
            <Hero8 />
          </Showcase>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <SectionHeader title="Features" />

          <Showcase id="features-6" title="Features-1">
            <Feature6 />
          </Showcase>

          <Showcase id="features-3" title="Features-3">
            <Feature7 />
          </Showcase>

          <Showcase id="features-15" title="Features-3">
            <Feature15 />
          </Showcase>

          <Showcase id="features-16" title="Features-4">
            <Feature16 />
          </Showcase>

          <Showcase id="features-18" title="Features-5">
            <Feature18 />
          </Showcase>

          <Showcase id="features-89" title="Features-6">
            <Feature89 />
          </Showcase>

          <Showcase id="features-74" title="Features-7">
            <Feature74 />
          </Showcase>

          <Showcase id="features-111" title="Features-8">
            <Timeline3 />
          </Showcase>
        </section>

        {/* How it works Section */}
        <section className="mb-12">
          <SectionHeader title="How it works" />

          <Showcase id="hiw-1" title="HIW-1">
            <Hiw1 />
          </Showcase>

          <Showcase id="hiw-2" title="HIW-2">
            <Hiw2 />
          </Showcase>

        </section>

        {/* Bento Grid Section */}
        <section className="mb-12">
          <SectionHeader title="Bento Grid" />

          <Showcase id="bento-1" title="Bento-1">
            <Bento1 />
          </Showcase>

          <Showcase id="bento-2" title="Bento-2">
            <Bento2 />
          </Showcase>

        </section>

        {/* Gallery Section */}
        <section className="mb-12">
          <SectionHeader title="Gallery" />

          <Showcase id="gallery-1" title="Gallery-1">
            <Gallery1 />
          </Showcase>

          <Showcase id="gallery-2" title="Gallery-2">
            <Gallery2 />
          </Showcase>

          <Showcase id="gallery-3" title="Gallery-3">
            <Gallery3 />
          </Showcase>

          <Showcase id="gallery-4" title="Gallery-4">
            <Gallery4 />
          </Showcase>

          <Showcase id="gallery-5" title="Gallery-5">
            <Gallery5 />
          </Showcase>
        </section>

        {/* Code Windows Section */}
        <section className="mb-12">
          <SectionHeader title="Code Windows" />

          <Showcase id="code-block" title="Code-block">
            <CodeBlock className="max-w-xl mx-auto" />
          </Showcase>

          <Showcase id="code-1" title="Code-1">
            <Code1 />
          </Showcase>

          <Showcase id="code-11" title="Code-1.1 (Theme Aware)">
            <Code11 />
          </Showcase>

          <Showcase id="code-2" title="Code-2">
            <Code2 />
          </Showcase>

          <Showcase id="code-3" title="Code-3">
            <Code3 />
          </Showcase>

          <Showcase id="code-4" title="Code-4">
            <Code4 />
          </Showcase>

          <Showcase id="code-5" title="Code-5">
            <Code5 />
          </Showcase>

          <Showcase id="code-6" title="Code-6">
            <Code6 />
          </Showcase>
        </section>

        {/* Pricing Section */}
        <section className="mb-12">
          <SectionHeader title="Pricing" />

          <Showcase id="pricing-1" title="Pricing-1">
            <Pricing1 />
          </Showcase>

          <Showcase id="pricing-34" title="Pricing-2">
            <Pricing34 />
          </Showcase>

          <Showcase id="pricing-5" title="Pricing-3">
            <Pricing5 />
          </Showcase>

          <Showcase id="pricing-6" title="Pricing-4">
            <Pricing6
              heading="Pricing"
              description="Simple pricing with a free 7 day trial."
              price={29}
              priceSuffix="/mo"
              buttonText="Start free trial"
            />
          </Showcase>

          <Showcase id="pricing-8" title="Pricing-5">
            <Pricing8 />
          </Showcase>

        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <SectionHeader title="FAQs" />

          <Showcase id="faq-1" title="FAQ-1">
            <Faq1 />
          </Showcase>

          <Showcase id="hero-2" title="FAQ-2">
            <Faq2 />
          </Showcase>
        </section>

        {/* Testimonials Section */}
        <section className="mb-12">
          <SectionHeader title="Testimonials" />

          <Showcase id="testimonial-2" title="Testimonial-1">
            <Testimonial3 
              quote="We are at the dawn of an entirely new paradigm—a transformation so profound it changes what it means to operate, manage, and deliver business outcomes. The Era of Autonomous Enterprises is here."
              author="Nathan Clevenger, CTO at do.industries"
            />
          </Showcase>
        </section>

        {/* Call-to-action Section */}
        <section className="mb-12">
          <SectionHeader title="Call-to-action" />

          <Showcase id="cta-1" title="CTA-1">
            <Cta1 />
          </Showcase>

          <Showcase id="cta-2" title="CTA-2">
            <Cta2 />
          </Showcase>

          <Showcase id="cta-3" title="CTA-3">
            <Cta3 />
          </Showcase>
        </section>

        {/* Footer Section */}
        <section className="mb-12">
          <SectionHeader title="Footer" />

          <Showcase id="footer-1" title="Footer-1">
            <Footer1 />
          </Showcase>

          <Showcase id="footer-2" title="Footer-2">
            <Footer2 />
          </Showcase>

          <Showcase id="footer-3" title="Footer-3">
            <Footer3 />
          </Showcase>

          <Showcase id="footer-4" title="Footer-4">
            <Footer4 />
          </Showcase>
        </section>
      </main>
    </div>
  );
}
