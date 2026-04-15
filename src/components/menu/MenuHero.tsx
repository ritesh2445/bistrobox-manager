import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function MenuHero() {
  const scrollToMenu = () => {
    document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="px-4 py-16 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-3 text-4xl font-extrabold leading-tight text-foreground md:text-5xl">
          Skip the App.<br />Scan the Menu.
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Always fresh, always up to date.
        </p>
        <Button onClick={scrollToMenu} size="lg" className="gap-2">
          View Menu <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
