import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { trackEvent } from "@/lib/analytics";
import { MenuHeader } from "@/components/menu/MenuHeader";
import { MenuHero } from "@/components/menu/MenuHero";
import { CategoryPills } from "@/components/menu/CategoryPills";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { CallWaiterButton, type CartItem } from "@/components/menu/CallWaiterButton";
import { GuestEntryScreen } from "@/components/menu/GuestEntryScreen";
import { MenuErrorFallback } from "@/components/MenuErrorFallback";

const DEMO_CATEGORIES: Tables<"categories">[] = [
  { id: "cat-1", created_at: new Date().toISOString(), name: "Coffee", sort_order: 1, user_id: "demo" },
  { id: "cat-2", created_at: new Date().toISOString(), name: "Pastries", sort_order: 2, user_id: "demo" },
];

const DEMO_ITEMS: Tables<"menu_items">[] = [
  { id: "item-1", created_at: new Date().toISOString(), name: "Espresso", description: "Rich and bold single shot", price: 150, image_url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80", category_id: "cat-1", is_available: true, sort_order: 1, user_id: "demo" },
  { id: "item-2", created_at: new Date().toISOString(), name: "Cappuccino", description: "Espresso with steamed milk and foam", price: 220, image_url: "https://images.unsplash.com/photo-1517701550927-30cfcb64ac45?auto=format&fit=crop&w=800&q=80", category_id: "cat-1", is_available: true, sort_order: 2, user_id: "demo" },
  { id: "item-3", created_at: new Date().toISOString(), name: "Butter Croissant", description: "Flaky and buttery freshly baked croissant", price: 180, image_url: "https://images.unsplash.com/photo-1555507036-ab1e4006aaeb?auto=format&fit=crop&w=800&q=80", category_id: "cat-2", is_available: true, sort_order: 1, user_id: "demo" },
  { id: "item-4", created_at: new Date().toISOString(), name: "Blueberry Muffin", description: "Soft muffin loaded with fresh blueberries", price: 160, image_url: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80", category_id: "cat-2", is_available: true, sort_order: 2, user_id: "demo" },
];

export default function PublicMenuPage() {
  const [searchParams] = useSearchParams();
  // `uid` = the admin's user_id encoded in the QR; `table` = pre-assigned table from QR
  const uidParam   = searchParams.get("uid");
  const tableParam = searchParams.get("table");

  // Guest identity state — null means the gate screen is showing
  const [guest, setGuest] = useState<{ name: string; table: string } | null>(null);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const queryClient = useQueryClient();

  // Track page view only after guest has entered
  useEffect(() => {
    if (guest) {
      trackEvent("menu_view", { 
      uid: uidParam || "demo",
      table: tableParam || "none" 
    }, uidParam || undefined);
    }
  }, [guest, uidParam]);

  // Realtime subscription for menu items of this account
  useEffect(() => {
    if (!guest || !uidParam) return;
    const channel = supabase
      .channel("menu_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["menu_items", uidParam] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, guest, uidParam]);

  const { data: categories = [], isLoading: catLoading, isError: catError } = useQuery({
    queryKey: ["categories", uidParam],
    queryFn: async () => {
      if (!uidParam) return DEMO_CATEGORIES;
      let query = supabase.from("categories").select("*").order("sort_order");
      if (uidParam) {
        query = query.eq("user_id", uidParam);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Tables<"categories">[];
    },
    enabled: !!guest,
    staleTime: 5 * 60 * 1000,
  });

  const { data: items = [], isLoading: itemsLoading, isError: itemsError } = useQuery({
    queryKey: ["menu_items", uidParam],
    queryFn: async () => {
      if (!uidParam) return DEMO_ITEMS;
      let query = supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("created_at");
      if (uidParam) {
        query = query.eq("user_id", uidParam);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Tables<"menu_items">[];
    },
    enabled: !!guest,
    staleTime: 5 * 60 * 1000,
  });

  const filteredItems = useMemo(() => {
    if (!activeCategoryId) return items;
    return items.filter((item) => item.category_id === activeCategoryId);
  }, [items, activeCategoryId]);

  const handleAddToCart = useCallback((item: Tables<"menu_items">) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  // Show gate screen until guest has confirmed their identity
  if (!guest) {
    return (
      <GuestEntryScreen
        tableParam={tableParam}
        onConfirm={(name, table) => setGuest({ name, table })}
      />
    );
  }

  if (catError || itemsError) {
    return <MenuErrorFallback />;
  }

  return (
    <div className="menu-page pb-28">
      <MenuHeader tableParam={guest.table} guestName={guest.name} />
      <MenuHero />
      <div id="menu-section" className="mx-auto max-w-5xl">
        <CategoryPills
          categories={categories}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
          loading={catLoading}
        />
        <div className="mt-4">
          <MenuGrid
            items={filteredItems}
            loading={itemsLoading}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
      <CallWaiterButton
        tableParam={guest.table}
        guestName={guest.name}
        ownerUserId={uidParam}
        cart={cart}
        onUpdateCart={setCart}
      />
    </div>
  );
}
