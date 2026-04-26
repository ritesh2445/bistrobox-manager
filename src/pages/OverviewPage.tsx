import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MousePointerClick, TrendingUp, Activity, Bell, ClipboardList } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AnalyticsRow {
  event_type: string;
  metadata: Json;
  created_at: string;
}

interface WaiterRequest {
  id: string;
  table_number: string;
  guest_name: string;
  status: string;
  created_at: string;
}

export default function OverviewPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics")
        .select("event_type, metadata, created_at")
        .eq("user_id", userId!);
      if (error) throw error;
      return data as AnalyticsRow[];
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  const { data: waiterRequests = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["waiter_requests", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waiter_requests")
        .select("id, table_number, guest_name, status, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WaiterRequest[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  const isLoading = analyticsLoading || ordersLoading;

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

  // Orders stats
  const pendingOrders = waiterRequests.filter((r) => r.status === "pending").length;
  const totalOrders = waiterRequests.length;

  const stats = [
    { title: "Total Menu Views", value: menuViews, icon: Eye },
    { title: "Total Item Clicks", value: totalClicks, icon: MousePointerClick },
    { title: "Most Clicked Item", value: mostClicked?.name ?? "No data yet", icon: TrendingUp },
    { title: "Today's Traffic", value: todayTraffic, icon: Activity },
    { title: "Pending Orders", value: pendingOrders, icon: Bell, highlight: pendingOrders > 0 },
    { title: "Total Orders", value: totalOrders, icon: ClipboardList },
  ];

  // Recent pending orders
  const recentPending = waiterRequests.filter((r) => r.status === "pending").slice(0, 5);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`glass-card ${(stat as { highlight?: boolean }).highlight ? "border-amber-500/40 bg-amber-500/5" : ""}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${(stat as { highlight?: boolean }).highlight ? "text-amber-500" : "text-primary"}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className={`text-2xl font-bold ${(stat as { highlight?: boolean }).highlight ? "text-amber-500" : "text-foreground"}`}>
                  {typeof stat.value === "number" ? (stat.value === 0 ? "—" : stat.value) : stat.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending orders quick view */}
      {recentPending.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Pending Orders</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/orders">View All →</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentPending.map((req) => (
              <div key={req.id} className="glass-card flex items-center gap-3 rounded-lg px-4 py-3 border border-amber-500/30">
                <Bell className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span className="font-medium text-foreground">Table {req.table_number}</span>
                {req.guest_name && (
                  <span className="text-sm text-muted-foreground">· {req.guest_name}</span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
