import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, User, Hash } from "lucide-react";

interface GuestEntryScreenProps {
  tableParam: string | null;
  onConfirm: (guestName: string, tableIdentifier: string) => void;
}

export function GuestEntryScreen({ tableParam, onConfirm }: GuestEntryScreenProps) {
  const [name, setName] = useState("");
  const [table, setTable] = useState(tableParam ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedTable = table.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!trimmedTable) {
      setError("Please enter a table number.");
      return;
    }
    onConfirm(trimmedName, trimmedTable);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo / branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Bistro<span className="text-primary">Box</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Scan. Browse. Order.</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-7 shadow-2xl border border-white/10 space-y-5"
        >
          <h2 className="text-lg font-bold text-foreground">
            Welcome! Tell us about your seat 👋
          </h2>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="guest-name" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" /> Your Name
            </Label>
            <Input
              id="guest-name"
              placeholder="e.g. Rahul"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
              autoComplete="given-name"
              className="bg-secondary/30"
            />
          </div>

          {/* Table */}
          <div className="space-y-1.5">
            <Label htmlFor="guest-table" className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Table Number
            </Label>
            <Input
              id="guest-table"
              placeholder="e.g. 4 or Window Seat"
              value={table}
              onChange={(e) => { setTable(e.target.value); setError(""); }}
              autoComplete="off"
              className="bg-secondary/30"
              readOnly={!!tableParam}
            />
            {tableParam && (
              <p className="text-xs text-muted-foreground">Assigned from your QR code</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="w-full gap-2 font-bold">
            View Menu →
          </Button>
        </form>
      </div>
    </div>
  );
}
