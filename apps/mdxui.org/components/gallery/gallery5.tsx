import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GalleryItem {
  title: string;
  value: string;
  summary: string;
  image: {
    src: string;
    alt: string;
  };
}

interface Gallery5Props {
  heading?: string;
  items?: GalleryItem[];
  className?: string;
  containerClassName?: string;
  headingClassName?: string;
  tabsClassName?: string;
  aspectRatio?: number;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  {
    title: "Edit your video simply by editing the text.",
    value: "1",
    summary:
      "transcribes your recordings automatically. To edit the video, just edit the transcript—hit delete to cut parts a",
    image: {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      alt: "",
    },
  },
  {
    title: "Crystal-clear audio delivered at lightning speed.",
    value: "2",
    summary:
      "Eliminate filler words, close awkward pauses, and make it sound like a professional studio recording—all with our AI.",
    image: {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
      alt: "",
    },
  },
  {
    title: "No need to remember your lines—or tidy up your space.",
    value: "3",
    summary:
      "Keep your gaze fixed on the camera, even if you were reading your script the entire time. Use AI green screen.",
    image: {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
      alt: "",
    },
  },
];

const Gallery5 = ({
  heading = "Speed up production without sacrificing quality",
  items = DEFAULT_ITEMS,
  className = "",
  containerClassName = "",
  headingClassName = "",
  tabsClassName = "",
  aspectRatio = 16 / 9,
}: Gallery5Props) => {
  return (
    <section className={`bg-background py-32 ${className}`}>
      <div className={`container px-0 sm:px-6 max-w-7xl ${containerClassName}`}>
        <div className="mx-auto mb-8 flex max-w-3xl md:mb-20">
          <h2 className={`text-center text-5xl text-foreground tracking-tighter leading-14 ${headingClassName}`}>
            {heading}
          </h2>
        </div>
        <div>
          <Tabs defaultValue={items[0]?.value} className={`gap-14 xl:flex-row ${tabsClassName}`}>
            <TabsList className="h-fit w-fit flex-col gap-2.5 bg-transparent p-0">
              {items.map((item, i) => (
                <TabsTrigger
                  className="flex-col items-start rounded-md p-5 text-left whitespace-normal data-[state=active]:bg-muted xl:max-w-xl"
                  key={`tab-trigger-${i}`}
                  value={item.value}
                >
                  <div className="leading-normal font-bold text-base">
                    {item.title}
                  </div>
                  <div className="leading-normal text-muted-foreground text-sm">
                    {item.summary}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            {items.map((item, i) => (
              <TabsContent
                className="w-full"
                key={`tab-content-${i}`}
                value={item.value}
              >
                <AspectRatio
                  ratio={aspectRatio}
                  className="overflow-hidden rounded-md"
                >
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    className="block size-full object-cover object-center"
                  />
                </AspectRatio>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export { Gallery5, type Gallery5Props, type GalleryItem }; 