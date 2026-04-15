import type { Tables } from "@/integrations/supabase/types";
import { MenuItemCard } from "./MenuItemCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuGridProps {
  items: Tables<"menu_items">[];
  loading: boolean;
}

export function MenuGrid({ items, loading }: MenuGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No items in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
