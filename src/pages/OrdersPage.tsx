import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Bell,
  ShoppingCart,
  Trash2,
  RefreshCw,
  User,
} from "lucide-react";

type WaiterRequest = Tables<"waiter_requests">;

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function OrdersPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["waiter_requests", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waiter_requests")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WaiterRequest[];
    },
    enabled: !!userId,
    refetchInterval: 30_000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("waiter_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waiter_requests" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["waiter_requests", userId] });
          queryClient.invalidateQueries({ queryKey: ["pending_count", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("waiter_requests")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiter_requests", userId] });
      queryClient.invalidateQueries({ queryKey: ["pending_count", userId] });
      toast.success("Request marked as done");
    },
    onError: () => toast.error("Failed to update request"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("waiter_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiter_requests", userId] });
      queryClient.invalidateQueries({ queryKey: ["pending_count", userId] });
    },
    onError: () => toast.error("Failed to delete request"),
  });

  const clearResolved = async () => {
    const ids = requests.filter((r) => r.status === "resolved").map((r) => r.id);
    if (ids.length === 0) return;
    await supabase.from("waiter_requests").delete().in("id", ids);
    queryClient.invalidateQueries({ queryKey: ["waiter_requests", userId] });
    toast.success(`Cleared ${ids.length} resolved request(s)`);
  };

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status === "resolved");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders & Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live table orders and waiter call requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["waiter_requests", userId] })}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {resolved.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearResolved} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Clear Resolved ({resolved.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2">
          <Bell className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-500">
            {pending.length} Pending
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-500">
            {resolved.length} Resolved
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card rounded-xl py-16 text-center text-muted-foreground">
          <Bell className="mx-auto mb-3 h-8 w-8 opacity-30" />
          <p className="font-medium">No requests yet</p>
          <p className="text-sm mt-1">Orders from customers will appear here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const items = (req.items as OrderItem[]) ?? [];
            const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
            const isPending = req.status === "pending";
            const isWaiterCall = items.length === 0;

            return (
              <div
                key={req.id}
                className={`glass-card rounded-xl p-5 border transition-all ${
                  isPending
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-base font-bold text-foreground">
                        Table {req.table_number}
                      </span>
                      {req.guest_name && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {req.guest_name}
                        </span>
                      )}
                      {isWaiterCall && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30" variant="outline">
                          <Bell className="mr-1 h-3 w-3" /> Waiter Call
                        </Badge>
                      )}
                      <Badge
                        className={isPending
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }
                        variant="outline"
                      >
                        {isPending ? (
                          <><Clock className="mr-1 h-3 w-3" /> Pending</>
                        ) : (
                          <><CheckCircle2 className="mr-1 h-3 w-3" /> Done</>
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {timeAgo(req.created_at)}
                      </span>
                    </div>

                    {/* Items */}
                    {items.length > 0 ? (
                      <div className="space-y-1 mb-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <ShoppingCart className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground">
                              {item.name}
                            </span>
                            <span className="text-muted-foreground">×{item.quantity}</span>
                            <span className="text-primary font-medium ml-auto">
                              ₹{(item.price * item.quantity).toFixed(0)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-1 border-t border-border/50 mt-1">
                          <span className="text-xs text-muted-foreground">Total</span>
                          <span className="text-sm font-bold text-foreground">₹{total.toFixed(0)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-blue-400 mb-2">
                        <Bell className="inline h-3 w-3 mr-1" />
                        Customer needs waiter assistance
                      </p>
                    )}

                    {/* Note */}
                    {req.note && req.note !== "Customer needs assistance." && (
                      <p className="text-xs text-muted-foreground italic bg-secondary/30 rounded p-2">
                        📝 {req.note}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {isPending && (
                      <Button
                        size="sm"
                        onClick={() => resolveMutation.mutate(req.id)}
                        disabled={resolveMutation.isPending}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Done
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(req.id)}
                      disabled={deleteMutation.isPending}
                      className="gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
