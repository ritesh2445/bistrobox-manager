import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Plus } from "lucide-react";

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Tables<"categories">[];
  userId?: string;
}

export function CategoryManagerDialog({ open, onOpenChange, categories, userId }: CategoryManagerDialogProps) {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState("");

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("No user ID");
      const { error } = await supabase.from("categories").insert([
        { name, user_id: userId, icon_name: "utensils", sort_order: categories.length }
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
      toast.success("Category added", { duration: 2000 });
      setNewCatName("");
    },
    onError: () => toast.error("Failed to add category")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
      toast.success("Category deleted", { duration: 2000 });
    },
    onError: () => toast.error("Failed to delete category (it may be in use)")
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addMutation.mutate(newCatName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAdd} className="flex items-end gap-2 mt-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="catName">New Category</Label>
            <Input 
              id="catName" 
              placeholder="e.g. Beverages" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              disabled={addMutation.isPending}
            />
          </div>
          <Button type="submit" disabled={!newCatName.trim() || addMutation.isPending}>
            {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No categories yet. Create one above.</p>
          ) : (
            categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border">
                <span className="font-medium text-sm">{c.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteMutation.mutate(c.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && deleteMutation.variables === c.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
