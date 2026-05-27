import type { Tables } from "@/integrations/supabase/types";
import { Star, Utensils, Plus, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MenuItemCardProps {
  item: Tables<"menu_items">;
  onAddToCart?: (item: Tables<"menu_items">) => void;
}

function FallbackImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary">
      <Utensils className="h-10 w-10 text-muted-foreground/40" />
    </div>
  );
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    trackEvent("item_click", { item_id: item.id, item_name: item.name }, item.user_id || undefined);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.is_available || !onAddToCart) return;
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={handleClick}
      className={`glass-card relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
        !item.is_available ? "opacity-60" : ""
      }`}
    >
      {item.is_featured && item.is_available && (
        <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          <Star className="h-3 w-3" />Chef&apos;s Pick
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
        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackImage />
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-1 text-base font-semibold text-foreground">{item.name}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-lg font-bold text-primary ${!item.is_available ? "line-through" : ""}`}>
            ₹{item.price}
          </span>
          {onAddToCart && (
            <Button
              size="sm"
              disabled={!item.is_available}
              onClick={handleAddToCart}
              variant={added ? "secondary" : "default"}
              className="gap-1.5 transition-all"
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Add
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
