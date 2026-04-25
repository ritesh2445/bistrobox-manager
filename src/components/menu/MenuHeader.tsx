import { Badge } from "@/components/ui/badge";

interface MenuHeaderProps {
  tableParam: string | null;
  guestName?: string;
}

export function MenuHeader({ tableParam, guestName }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-card px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          Bistro<span className="text-primary">Box</span>
          <span className="ml-1 inline-block h-2 w-2 rounded-full bg-primary" />
        </h1>
        <div className="flex items-center gap-2">
          {guestName && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Hi, <span className="font-semibold text-foreground">{guestName}</span>
            </span>
          )}
          {tableParam && (
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Table {tableParam}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
