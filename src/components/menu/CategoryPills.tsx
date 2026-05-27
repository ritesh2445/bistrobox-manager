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
      <div className="flex gap-1 overflow-x-auto border-b border-white/8 px-4 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="my-3 h-5 w-24 shrink-0 rounded-sm bg-white/8" />
        ))}
      </div>
    );
  }

  const baseClass =
    "shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] border-b-2 -mb-px transition-all duration-200";
  const activeClass = "border-[#C9A84C] text-[#C9A84C]";
  const inactiveClass = "border-transparent text-white/35 hover:text-white/65";

  return (
    <div className="flex overflow-x-auto border-b border-white/8 px-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`${baseClass} ${activeId === null ? activeClass : inactiveClass}`}
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
            className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
          >
            <Icon className="h-3 w-3" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
