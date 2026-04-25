import { useState } from "react";
import { Bell, ShoppingCart, Minus, Plus, Trash2, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface CartItem {
  item: Tables<"menu_items">;
  quantity: number;
}

interface CallWaiterButtonProps {
  tableParam: string | null;
  guestName: string;
  ownerUserId: string | null;
  cart: CartItem[];
  onUpdateCart: (cart: CartItem[]) => void;
}

export function CallWaiterButton({
  tableParam,
  guestName,
  ownerUserId,
  cart,
  onUpdateCart,
}: CallWaiterButtonProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const updateQty = (itemId: string, delta: number) => {
    onUpdateCart(
      cart
        .map((c) =>
          c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    onUpdateCart(cart.filter((c) => c.item.id !== itemId));
  };

  const handleSubmit = async () => {
    if (!tableParam) {
      toast.error("No table number found. Please scan the table QR code.");
      return;
    }
    setLoading(true);
    try {
      if (!ownerUserId) {
        // Mock behavior for demo menu
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success(`Order sent for Table ${tableParam}! Waiter is on the way. (Demo Mode)`, {
          duration: 5000,
        });
        onUpdateCart([]);
        setNote("");
        setOpen(false);
        return;
      }

      const itemsPayload = cart.map((c) => ({
        id: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
      }));

      const { error } = await supabase.from("waiter_requests").insert([
        {
          table_number: tableParam,
          guest_name: guestName,
          note: note.trim(),
          items: itemsPayload,
          status: "pending",
          user_id: ownerUserId,
        },
      ]);

      if (error) throw error;

      toast.success(`Order sent for Table ${tableParam}! Waiter is on the way.`, {
        duration: 5000,
      });
      onUpdateCart([]);
      setNote("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallWaiterOnly = async () => {
    if (!tableParam) {
      toast.error("No table number found. Please scan the table QR code.");
      return;
    }
    setLoading(true);
    try {
      if (!ownerUserId) {
        // Mock behavior for demo menu
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success(`Waiter notified for Table ${tableParam}! (Demo Mode)`, { duration: 4000 });
        return;
      }

      const { error } = await supabase.from("waiter_requests").insert([
        {
          table_number: tableParam,
          guest_name: guestName,
          note: "Customer needs assistance.",
          items: [],
          status: "pending",
          user_id: ownerUserId,
        },
      ]);
      if (error) throw error;
      toast.success(`Waiter notified for Table ${tableParam}!`, { duration: 4000 });
    } catch {
      toast.error("Failed to call waiter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Cart / Call Waiter FAB */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {cart.length === 0 ? (
          <Button
            onClick={handleCallWaiterOnly}
            disabled={loading}
            size="lg"
            className="gap-2 rounded-full shadow-lg shadow-primary/25"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Call Waiter
          </Button>
        ) : (
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="gap-2 rounded-full shadow-lg shadow-primary/25 pr-5"
          >
            <ShoppingCart className="h-4 w-4" />
            View Order
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary">
              {totalItems}
            </span>
          </Button>
        )}
      </div>

      {/* Order Sheet / Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Your Order</h2>
                {tableParam && (
                  <p className="text-sm text-muted-foreground">
                    Table {tableParam} · {guestName}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {cart.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-10 w-10 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-primary font-semibold">₹{(item.price * quantity).toFixed(0)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center text-sm font-bold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="mb-4">
              <Input
                placeholder="Special requests or note... (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Total + Submit */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm">Total</span>
              <span className="text-xl font-bold text-foreground">₹{totalPrice.toFixed(0)}</span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || cart.length === 0}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Order to Waiter
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
