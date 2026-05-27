import { Badge } from "@/components/ui/badge";

interface MenuHeaderProps {
  tableParam: string | null;
  guestName?: string;
}

export function MenuHeader({ tableParam, guestName }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#C9A84C]/15 bg-[#07090F]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="animate-gold-pulse text-[#C9A84C] text-xs select-none">✦</span>
          <h1 className="royal-serif text-xl font-bold tracking-wide text-white">
            Bistro<span className="text-[#C9A84C]">Box</span>
          </h1>
          <span className="animate-gold-pulse text-[#C9A84C] text-xs select-none" style={{ animationDelay: "1.4s" }}>✦</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {guestName && (
            <span className="hidden text-sm text-white/40 sm:inline">
              Welcome,{" "}
              <span className="font-semibold text-white/75">{guestName}</span>
            </span>
          )}
          {tableParam && (
            <span className="rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">
              Table {tableParam}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
