import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-windows/code-block";

interface Cta2Props {
  eyebrow?: string;
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url?: string;
    };
    secondary?: {
      text: string;
      url?: string;
    };
  };
  code?: {
    snippet?: string;
    language?: string;
  };
}

const Cta2 = ({
  eyebrow = "Ready to get started?",
  heading = "Start your free trial today.",
  description = "Start with a 14-day free trial. No credit card required. No setup fees. Cancel anytime.",
  buttons = {
    primary: {
      text: "Get Started",
      url: "#",
    },
    secondary: {
      text: "Learn More",
      url: "#",
    },
  },
  code = {
    snippet: `import { ai, db } from 'workflows.do'

await db.ideas.create({ concept: 'Digital AI Workers' })
await db.ideas.create({ concept: 'Agentic Workflow Platform' })

const ideas = await db.ideas.search('AI Agents')

ideas.forEach(async (idea) => {
  idea.status = 'Evaluating market potential'
  const leanCanvas = await ai.defineLeanCanvas({ idea })
  const marketResearch = await ai.research({ idea, leanCanvas })
  await db.ideas.update({ ...idea, leanCanvas, marketResearch })
})`,
    language: "typescript",
  },
}: Cta2Props) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-20 overflow-hidden rounded-lg border bg-[radial-gradient(ellipse_30%_60%_at_100%_80%,var(--color-gray-100),transparent)] dark:bg-[radial-gradient(ellipse_30%_60%_at_100%_80%,var(--color-gray-800),transparent)] pt-20 sm:pl-16 lg:flex-row lg:bg-[radial-gradient(ellipse_50%_80%_at_40%_120%,var(--color-gray-100),transparent)] dark:lg:bg-[radial-gradient(ellipse_50%_80%_at_40%_120%,var(--color-gray-800),transparent)] lg:pl-20">
          <div className="lg:texlf mx-auto max-w-md px-4 text-center md:px-0 lg:mx-0 lg:pb-20 lg:text-left">
            <p className="mb-6 text-base font-base text-muted-foreground/70">{eyebrow}</p>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">{heading}</h2>
            <p className="text-base text-muted-foreground">{description}</p>
            <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              {buttons.primary && (
                <Button asChild>
                  <a href={buttons.primary.url}>{buttons.primary.text}</a>
                </Button>
              )}
              {buttons.secondary && (
                <Button variant="outline" asChild>
                  <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
                </Button>
              )}
            </div>
          </div>
          <div className="relative w-full pl-4 sm:pl-0 lg:w-1/2">
            <div className="absolute -bottom-8 -left-8 -z-10 h-4/5 w-3/5 bg-stone-900/20 blur-2xl dark:bg-stone-100/20"></div>
            <CodeBlock
              code={code.snippet}
              language={code.language}
              className="relative z-10 h-full max-h-[400px] w-full overflow-hidden left-3 top-3"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Cta2 };
