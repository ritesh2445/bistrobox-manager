import { Badge } from "@/components/ui/badge";

interface MenuHeaderProps {
  tableParam: string | null;
}

export function MenuHeader({ tableParam }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-card px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          Bistro<span className="text-primary">Box</span>
          <span className="ml-1 inline-block h-2 w-2 rounded-full bg-primary" />
        </h1>
        {tableParam && (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Table {tableParam}
          </Badge>
        )}
      </div>
    </header>
  );
}
