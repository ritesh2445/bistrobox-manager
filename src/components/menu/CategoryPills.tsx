import type { Tables } from "@/integrations/supabase/types";
import { getIcon } from "@/lib/icon-map";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryPillsProps {
  categories: Tables<"categories">[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  loading: boolean;
}

export function CategoryPills({ categories, activeId, onSelect, loading }: CategoryPillsProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors
          ${activeId === null
            ? "bg-primary text-primary-foreground"
            : "glass-card text-muted-foreground hover:text-foreground"
          }`}
      >
        All
      </button>
      {categories.map((cat) => {
        const Icon = getIcon(cat.icon_name);
        const isActive = activeId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors
              ${isActive
                ? "bg-primary text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
              }`}
          >
            <Icon className="h-4 w-4" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
