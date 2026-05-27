import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Utensils, Eye } from "lucide-react";
import { MenuItemDialog } from "@/components/admin/MenuItemDialog";
import { CategoryManagerDialog } from "@/components/admin/CategoryManagerDialog";
import { Layers } from "lucide-react";

export default function MenuEditorPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tables<"menu_items"> | null>(null);
  const [deleteItem, setDeleteItem] = useState<Tables<"menu_items"> | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin_menu_items", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const filteredItems = useMemo(() => {
    let result = items;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(lower));
    }
    if (categoryFilter !== "all") {
      result = result.filter((i) => i.category_id === categoryFilter);
    }
    return result;
  }, [items, search, categoryFilter]);

  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: "is_available" | "is_featured"; value: boolean }) => {
      const update: TablesUpdate<"menu_items"> = { [field]: value };
      const { error } = await supabase.from("menu_items").update(update).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, field, value }) => {
      await queryClient.cancelQueries({ queryKey: ["admin_menu_items", userId] });
      const previous = queryClient.getQueryData<Tables<"menu_items">[]>(["admin_menu_items", userId]);
      queryClient.setQueryData<Tables<"menu_items">[]>(["admin_menu_items", userId], (old) =>
        old?.map((item) => (item.id === id ? { ...item, [field]: value } : item)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["admin_menu_items", userId], context?.previous);
      toast.error("Failed to update item", { duration: 4000 });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_menu_items", userId] });
      queryClient.invalidateQueries({ queryKey: ["menu_items", userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_menu_items", userId] });
      queryClient.invalidateQueries({ queryKey: ["menu_items", userId] });
      toast.success("Item deleted", { duration: 4000 });
      setDeleteItem(null);
    },
    onError: () => {
      toast.error("Failed to delete item", { duration: 4000 });
    },
  });

  const getCategoryName = (categoryId: string | null) => {
    return categories.find((c) => c.id === categoryId)?.name ?? "—";
  };

  const handleEdit = (item: Tables<"menu_items">) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Menu Editor</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/menu?uid=${userId}`, "_blank")} className="gap-2 text-amber-500 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button variant="outline" onClick={() => setCatDialogOpen(true)} className="gap-2">
            <Layers className="h-4 w-4" /> Categories
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded bg-secondary">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute("style");
                          }}
                        />
                      ) : null}
                      <div className={`flex h-full w-full items-center justify-center ${item.image_url ? "hidden" : ""}`}>
                        <Utensils className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getCategoryName(item.category_id)}</Badge>
                  </TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.is_featured}
                      onCheckedChange={(v) =>
                        toggleMutation.mutate({ id: item.id, field: "is_featured", value: v })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={(v) =>
                        toggleMutation.mutate({ id: item.id, field: "is_available", value: v })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteItem(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    {items.length === 0
                      ? "No menu items yet. Click \"Add Item\" to create your first one."
                      : "No items match your search."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        categories={categories}
        userId={userId}
      />

      <CategoryManagerDialog
        open={catDialogOpen}
        onOpenChange={setCatDialogOpen}
        categories={categories}
        userId={userId}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteItem?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
