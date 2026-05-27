import type { Tables } from "@/integrations/supabase/types";
import { Star, Utensils, Plus, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useState } from "react";

interface MenuItemCardProps {
  item: Tables<"menu_items">;
  onAddToCart?: (item: Tables<"menu_items">) => void;
}

function FallbackImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0D1220]">
      <Utensils className="h-10 w-10 text-[#C9A84C]/20" />
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
      className={`royal-card group relative cursor-default overflow-hidden rounded-2xl ${
        !item.is_available ? "opacity-50" : ""
      }`}
    >
      {/* Chef's Pick badge */}
      {item.is_featured && item.is_available && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border border-[#C9A84C]/40 bg-[#0D1220]/80 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#C9A84C] backdrop-blur-sm">
          <Star className="h-2.5 w-2.5 fill-current" />
          Chef's Pick
        </span>
      )}

      {/* Sold-out overlay */}
      {!item.is_available && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <span className="rounded-full border border-red-500/30 bg-red-900/30 px-5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            Sold Out
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {item.image_url && !imgError ? (
          <>
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
            {/* Bottom gradient fade into card */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1220] via-[#0D1220]/10 to-transparent" />
          </>
        ) : (
          <FallbackImage />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Shimmer separator line */}
        <div className="shimmer-line mb-4 h-px w-full" />

        <h3 className="royal-serif mb-1.5 text-lg font-semibold leading-snug text-white">
          {item.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/38">
          {item.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span
            className={`royal-serif text-xl font-bold text-[#C9A84C] ${
              !item.is_available ? "line-through opacity-40" : ""
            }`}
          >
            ₹{item.price}
          </span>

          {onAddToCart && (
            <button
              disabled={!item.is_available}
              onClick={handleAddToCart}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 ${
                added
                  ? "border-emerald-500/40 bg-emerald-900/30 text-emerald-400"
                  : "border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#07090F]"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-3 w-3" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
