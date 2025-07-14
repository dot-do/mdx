import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface FaqItem {
  question: string;
  answer: string;
}

interface Faq2Props {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  contactLink?: string;
  faqs?: FaqItem[];
  className?: string;
}

const defaultFaqs: FaqItem[] = [
  {
    question: "What is a FAQ and why is it important?",
    answer:
      "FAQ stands for Frequently Asked Questions. It is a list that provides answers to common questions people may have about a specific product, service, or topic.",
  },
  {
    question: "Why should I use a FAQ on my website or app?",
    answer:
      "Utilizing a FAQ section on your website or app is a practical way to offer instant assistance to your users or customers. Instead of waiting for customer support responses, they can find quick answers to commonly asked questions. ",
  },
  {
    question: "How do I effectively create a FAQ section?",
    answer:
      "Creating a FAQ section starts with gathering the most frequent questions you receive from your users or customers. Once you have a list, you need to write clear, detailed, and helpful answers to each question.",
  },
  {
    question: "What are the benefits of having a well-maintained FAQ section?",
    answer:
      "There are numerous advantages to maintaining a robust FAQ section. Firstly, it provides immediate answers to common queries, which improves the user experience.",
  },
  {
    question: "How do I effectively create a FAQ section?",
    answer:
      "Creating a FAQ section starts with gathering the most frequent questions you receive from your users or customers. Once you have a list, you need to write clear, detailed, and helpful answers to each question.",
  },
];

const Faq2 = ({
  title = "Need Help?",
  subtitle = "We're here to assist.",
  description = "Still have questions? Feel free to contact our support team specialists.",
  buttonText = "Get started",
  buttonVariant = "default",
  contactLink = "#",
  faqs = defaultFaqs,
  className = "",
}: Faq2Props) => {
  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl font-semibold">
              {title}
              <br />
              <span className="text-muted-foreground/70">
                {subtitle}
              </span>
            </h2>
            <p className="w-full sm:max-w-xl text-md text-muted-foreground md:text-lg">
              {description.split('support team').length > 1 ? (
                <>
                  {description.split('support team')[0]}
                  <a href={contactLink} className="mx-1 whitespace-nowrap underline">
                    support team
                  </a>
                  {description.split('support team')[1]}
                </>
              ) : (
                description
              )}
            </p>
            <Button size="lg" variant={buttonVariant} className="w-fit">
              {buttonText}
            </Button>
          </div>
          <Accordion type="multiple">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-md font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-900 dark:text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export { Faq2 };
export type { Faq2Props, FaqItem };
