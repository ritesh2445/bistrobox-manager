import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Utensils } from "lucide-react";

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  category_id: z.string().min(1, "Category is required"),
  is_featured: z.boolean(),
  is_available: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Tables<"menu_items"> | null;
  categories: Tables<"categories">[];
}

export function MenuItemDialog({ open, onOpenChange, editingItem, categories }: MenuItemDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    values: editingItem
      ? {
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          category_id: editingItem.category_id ?? "",
          is_featured: editingItem.is_featured,
          is_available: editingItem.is_available,
        }
      : {
          name: "",
          description: "",
          price: 0,
          category_id: "",
          is_featured: false,
          is_available: true,
        },
  });

  const isFeatured = watch("is_featured");
  const isAvailable = watch("is_available");

  const currentImageUrl = imageUrl ?? editingItem?.image_url ?? null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const ext = file.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${ext}`;

    // Simulate progress since supabase-js doesn't provide upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 15, 85));
    }, 200);

    const { error } = await supabase.storage.from("menu-images").upload(filePath, file);

    clearInterval(progressInterval);

    if (error) {
      toast.error("Image upload failed", { duration: 4000 });
      setUploading(false);
      setUploadProgress(0);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("menu-images").getPublicUrl(filePath);
    setImageUrl(publicUrlData.publicUrl);
    setUploadProgress(100);
    setUploading(false);
  };

  const mutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const payload = {
        ...data,
        image_url: currentImageUrl,
      };
      if (editingItem) {
        const { error } = await supabase.from("menu_items").update(payload).eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_menu_items"] });
      queryClient.invalidateQueries({ queryKey: ["menu_items"] });
      toast.success(editingItem ? "Item updated" : "Item added", { duration: 4000 });
      handleClose();
    },
    onError: () => {
      toast.error("Failed to save item", { duration: 4000 });
    },
  });

  const handleClose = () => {
    reset();
    setImageUrl(null);
    setUploadProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Name</Label>
            <Input id="item-name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-desc">Description</Label>
            <Textarea id="item-desc" {...register("description")} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-price">Price (₹)</Label>
            <Input id="item-price" type="number" step="0.01" {...register("price")} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={watch("category_id")}
              onValueChange={(val) => setValue("category_id", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded bg-secondary">
                {currentImageUrl ? (
                  <img src={currentImageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Utensils className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </Button>
            </div>
            {uploading && <Progress value={uploadProgress} className="h-1.5" />}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isFeatured}
                onCheckedChange={(v) => setValue("is_featured", v === true)}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isAvailable}
                onCheckedChange={(v) => setValue("is_available", v === true)}
              />
              Available
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
