import type { Tables } from "@/integrations/supabase/types";
import { Star, Utensils } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface MenuItemCardProps {
  item: Tables<"menu_items">;
}

function FallbackImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary">
      <Utensils className="h-10 w-10 text-muted-foreground/40" />
    </div>
  );
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const handleClick = () => {
    trackEvent("item_click", { item_id: item.id, item_name: item.name });
  };

  return (
    <div
      onClick={handleClick}
      className={`glass-card relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
        !item.is_available ? "opacity-60" : ""
      }`}
    >
      {item.is_featured && item.is_available && (
        <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          <Star className="h-3 w-3" /> Chef&apos;s Pick
        </span>
      )}

      {!item.is_available && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
          <span className="rounded-full bg-destructive px-4 py-1.5 text-sm font-bold text-destructive-foreground">
            Sold Out
          </span>
        </div>
      )}

      <div className="aspect-[4/3] w-full overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <FallbackImage />
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-1 text-base font-semibold text-foreground">{item.name}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <span className={`text-lg font-bold text-primary ${!item.is_available ? "line-through" : ""}`}>
          ₹{item.price}
        </span>
      </div>
    </div>
  );
}
