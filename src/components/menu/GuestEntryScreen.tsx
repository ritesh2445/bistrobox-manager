import { useState } from "react";
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
    <div className="menu-page flex flex-col items-center justify-center px-4 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A84C]/6 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        {/* Branding */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C9A84C]/25 bg-[#C9A84C]/10">
            <UtensilsCrossed className="h-7 w-7 text-[#C9A84C]" />
          </div>
          <h1 className="royal-serif text-3xl font-bold text-white">
            Bistro<span className="text-[#C9A84C]">Box</span>
          </h1>
          {/* Ornament */}
          <div className="mx-auto mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9A84C]/40" />
            <span className="text-xs text-[#C9A84C]/60">❧</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9A84C]/40" />
          </div>
          <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#C9A84C]/60">
            Fine Dining
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[#C9A84C]/12 bg-[#0D1220] p-7 shadow-[0_16px_64px_rgba(0,0,0,0.6)]"
        >
          {/* Shimmer top line */}
          <div className="shimmer-line h-px w-full" />

          <h2 className="royal-serif text-lg font-semibold text-white">
            Welcome! Tell us about your seat
          </h2>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="guest-name" className="flex items-center gap-1.5 text-[#C9A84C]/80">
              <User className="h-3.5 w-3.5" />
              Your Name
            </Label>
            <Input
              id="guest-name"
              placeholder="e.g. Rahul"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
              autoComplete="given-name"
              className="border-[#C9A84C]/15 bg-white/5 text-white placeholder:text-white/25 focus-visible:border-[#C9A84C]/50 focus-visible:ring-[#C9A84C]/20"
            />
          </div>

          {/* Table */}
          <div className="space-y-1.5">
            <Label htmlFor="guest-table" className="flex items-center gap-1.5 text-[#C9A84C]/80">
              <Hash className="h-3.5 w-3.5" />
              Table Number
            </Label>
            <Input
              id="guest-table"
              placeholder="e.g. 4 or Window Seat"
              value={table}
              onChange={(e) => { setTable(e.target.value); setError(""); }}
              autoComplete="off"
              className="border-[#C9A84C]/15 bg-white/5 text-white placeholder:text-white/25 focus-visible:border-[#C9A84C]/50 focus-visible:ring-[#C9A84C]/20"
              readOnly={!!tableParam}
            />
            {tableParam && (
              <p className="text-xs text-[#C9A84C]/50">Assigned from your QR code</p>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-full border border-[#C9A84C]/50 bg-[#C9A84C]/10 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A84C] transition-all duration-300 hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#07090F] hover:shadow-[0_0_28px_rgba(201,168,76,0.4)]"
          >
            View Menu →
          </button>
        </form>
      </div>
    </div>
  );
}
