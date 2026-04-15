import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MousePointerClick, TrendingUp, Activity } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface AnalyticsRow {
  event_type: string;
  metadata: Json;
  created_at: string;
}

export default function OverviewPage() {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics")
        .select("event_type, metadata, created_at");
      if (error) throw error;
      return data as AnalyticsRow[];
    },
    staleTime: 60_000,
  });

  const menuViews = analytics.filter((e) => e.event_type === "menu_view").length;
  const itemClicks = analytics.filter((e) => e.event_type === "item_click");
  const totalClicks = itemClicks.length;

  // Most clicked item
  const clickCounts: Record<string, { name: string; count: number }> = {};
  for (const event of itemClicks) {
    const meta = event.metadata as Record<string, string> | null;
    if (meta?.item_id) {
      if (!clickCounts[meta.item_id]) {
        clickCounts[meta.item_id] = { name: meta.item_name || "Unknown", count: 0 };
      }
      clickCounts[meta.item_id].count++;
    }
  }
  const mostClicked = Object.values(clickCounts).sort((a, b) => b.count - a.count)[0];

  // Today's traffic
  const today = new Date().toISOString().slice(0, 10);
  const todayTraffic = analytics.filter((e) => e.created_at.slice(0, 10) === today).length;

  const stats = [
    { title: "Total Menu Views", value: menuViews, icon: Eye },
    { title: "Total Item Clicks", value: totalClicks, icon: MousePointerClick },
    { title: "Most Clicked Item", value: mostClicked?.name ?? "No data yet", icon: TrendingUp },
    { title: "Today's Traffic", value: todayTraffic, icon: Activity },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-foreground">
                  {typeof stat.value === "number" ? (stat.value === 0 ? "No data yet" : stat.value) : stat.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
