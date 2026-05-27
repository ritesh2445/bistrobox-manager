import type { Tables } from "@/integrations/supabase/types";
import { MenuItemCard } from "./MenuItemCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuGridProps {
  items: Tables<"menu_items">[];
  loading: boolean;
  onAddToCart?: (item: Tables<"menu_items">) => void;
}

export function MenuGrid({ items, loading, onAddToCart }: MenuGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-[#0D1220]">
            <Skeleton className="aspect-[4/3] w-full rounded-none bg-white/5" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-4 w-3/4 bg-white/5" />
              <Skeleton className="h-3 w-full bg-white/5" />
              <Skeleton className="h-3 w-2/3 bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="royal-serif text-lg text-[#C9A84C]/50 italic">
          Nothing to show in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="animate-card-in"
          style={{ animationDelay: `${index * 65}ms` }}
        >
          <MenuItemCard item={item} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  );
}
