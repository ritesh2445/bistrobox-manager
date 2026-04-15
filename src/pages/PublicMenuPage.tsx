import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { trackEvent } from "@/lib/analytics";
import { MenuHeader } from "@/components/menu/MenuHeader";
import { MenuHero } from "@/components/menu/MenuHero";
import { CategoryPills } from "@/components/menu/CategoryPills";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { CallWaiterButton } from "@/components/menu/CallWaiterButton";
import { MenuErrorFallback } from "@/components/MenuErrorFallback";

export default function PublicMenuPage() {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    trackEvent("menu_view", { table: tableParam });
  }, [tableParam]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("menu_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["menu_items"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: categories = [], isLoading: catLoading, isError: catError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Tables<"categories">[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: items = [], isLoading: itemsLoading, isError: itemsError } = useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as Tables<"menu_items">[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredItems = useMemo(() => {
    if (!activeCategoryId) return items;
    return items.filter((item) => item.category_id === activeCategoryId);
  }, [items, activeCategoryId]);

  if (catError || itemsError) {
    return <MenuErrorFallback />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MenuHeader tableParam={tableParam} />
      <MenuHero />
      <div id="menu-section" className="mx-auto max-w-5xl">
        <CategoryPills
          categories={categories}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
          loading={catLoading}
        />
        <div className="mt-4">
          <MenuGrid items={filteredItems} loading={itemsLoading} />
        </div>
      </div>
      <CallWaiterButton tableParam={tableParam} />
    </div>
  );
}
