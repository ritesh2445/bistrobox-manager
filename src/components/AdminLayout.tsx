import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { BarChart3, UtensilsCrossed, QrCode, LogOut, ClipboardList, Bell, Check, Trash2, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First chime
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    gain1.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 1);
    
    // Second chime
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
    gain2.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.15);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 1.15);
  } catch (e) {
    console.error("Audio play failed (interaction may be required)", e);
  }
};

function AdminSidebar() {
  const { signOut, session } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // Fetch pending waiter requests count (scoped to this admin)
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["pending_count", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("waiter_requests")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("status", "pending");
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
    refetchInterval: 20_000,
  });

  // Realtime: invalidate count when new requests come in
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("admin_pending_count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waiter_requests" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["pending_count", userId] });
          queryClient.invalidateQueries({ queryKey: ["waiter_requests", userId] });
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
          
          if (payload.eventType === "INSERT") {
            const newReq = payload.new as any;
            if (newReq.user_id === userId) {
              playNotificationSound();
              
              const hasItems = newReq.items && newReq.items.length > 0;
              const title = hasItems 
                ? `🛎️ New Order: Table ${newReq.table_number}`
                : `🛎️ Waiter Call: Table ${newReq.table_number}`;
              
              toast.info(title, {
                description: `Guest: ${newReq.guest_name}${newReq.note ? ` • Note: ${newReq.note}` : ""}`,
                duration: 8000,
              });
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  const navItems = [
    { title: "Overview", url: "/admin/overview", icon: BarChart3 },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ClipboardList,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { title: "Menu Editor", url: "/admin/menu", icon: UtensilsCrossed },
    { title: "QR Codes", url: "/admin/qr", icon: QrCode },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-between">
        <div>
          <div className="px-4 py-4">
            {!collapsed && (
              <h2 className="text-lg font-bold text-foreground">
                Bistro<span className="text-primary">Box</span>
              </h2>
            )}
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-muted/50"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <div className="relative flex items-center gap-2 w-full">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                          {item.badge !== undefined && (
                            <span className={`${collapsed ? "absolute -top-1 -right-1" : "ml-auto"} flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black px-1`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
        <div className="p-4 flex flex-col gap-1">
          <Button
            variant="ghost"
            onClick={() => window.open(`/menu?uid=${userId}`, "_blank")}
            className="w-full justify-start gap-2 text-[#C9A84C]/80 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10"
            title="Preview your public menu"
          >
            <Eye className="h-4 w-4 shrink-0" />
            {!collapsed && "Preview Menu"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function NotificationsDropdown() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waiter_requests")
        .select("*")
        .eq("user_id", userId!)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("waiter_requests")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["waiter_requests", userId] });
      queryClient.invalidateQueries({ queryKey: ["pending_count", userId] });
      toast.success("Marked as resolved");
    },
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
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["waiter_requests", userId] });
      queryClient.invalidateQueries({ queryKey: ["pending_count", userId] });
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {requests.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 rounded-full bg-destructive border border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold">Notifications</span>
          <span className="text-xs text-muted-foreground">{requests.length} pending</span>
        </div>
        <ScrollArea className="h-[350px]">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {requests.map((req) => {
                const isWaiterCall = !req.items || (req.items as any[]).length === 0;
                return (
                  <div key={req.id} className="flex flex-col gap-2 border-b border-border p-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-foreground">Table {req.table_number}</span>
                          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                            {isWaiterCall ? "Waiter" : "Order"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium truncate">
                          {req.guest_name}
                        </p>
                        {req.note && req.note !== "Customer needs assistance." && (
                          <p className="text-xs mt-1.5 text-muted-foreground italic line-clamp-2 bg-background border border-border/50 rounded px-2 py-1">
                            {req.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                          onClick={() => resolveMutation.mutate(req.id)}
                          disabled={resolveMutation.isPending}
                          title="Mark as resolved"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => deleteMutation.mutate(req.id)}
                          disabled={deleteMutation.isPending}
                          title="Dismiss"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-12 items-center justify-between border-b border-border px-4">
            <SidebarTrigger />
            <NotificationsDropdown />
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
