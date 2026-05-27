import { ChevronDown } from "lucide-react";

export function MenuHero() {
  const scrollToMenu = () => {
    document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[58vh] items-center justify-center overflow-hidden px-4 py-20 text-center">
      {/* Deep radial gold glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(201,168,76,0.10)_0%,transparent_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A84C]/5 blur-[120px]" />
      </div>

      {/* Decorative corner ornaments */}
      <div className="pointer-events-none absolute inset-8 select-none">
        <span className="absolute left-0 top-0 text-3xl text-[#C9A84C]/20">✦</span>
        <span className="absolute right-0 top-0 text-3xl text-[#C9A84C]/20">✦</span>
        <span className="absolute bottom-0 left-0 text-3xl text-[#C9A84C]/20">✦</span>
        <span className="absolute bottom-0 right-0 text-3xl text-[#C9A84C]/20">✦</span>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl animate-fade-in">
        {/* Eyebrow label */}
        <p className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-[#C9A84C]">
          ✦ &nbsp; Fine Dining Experience &nbsp; ✦
        </p>

        {/* Main heading */}
        <h2 className="royal-serif mb-5 text-5xl font-bold leading-[1.15] text-white md:text-6xl lg:text-7xl">
          An Experience
          <br />
          <em className="text-[#C9A84C]">in Every Bite</em>
        </h2>

        {/* Gold ornamental divider */}
        <div className="mx-auto mb-6 flex items-center justify-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#C9A84C]/60" />
          <span className="animate-gold-pulse text-xl text-[#C9A84C]">❧</span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#C9A84C]/60" />
        </div>

        {/* Tagline */}
        <p className="mb-10 text-base leading-relaxed tracking-wide text-white/40">
          Crafted with passion. Served with pride.
        </p>

        {/* CTA Button */}
        <button
          onClick={scrollToMenu}
          className="group inline-flex items-center gap-2.5 rounded-full border border-[#C9A84C]/50 bg-[#C9A84C]/10 px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A84C] backdrop-blur-sm transition-all duration-300 hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#07090F] hover:shadow-[0_0_36px_rgba(201,168,76,0.45)]"
        >
          Explore the Menu
          <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
        </button>
      </div>
    </section>
  );
}
