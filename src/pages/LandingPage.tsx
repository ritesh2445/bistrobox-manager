import { Link } from "react-router-dom";
import { ArrowRight, QrCode, Smartphone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/30 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-white/10 bg-background/50 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              Bistro<span className="text-primary">Box</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block text-sm text-muted-foreground mr-2">
                Already have an account?
              </span>
              <Button asChild variant="ghost" className="text-sm">
                <Link to="/admin/login">Log In</Link>
              </Button>
              <Button asChild className="text-sm">
                <Link to="/admin/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main>
          <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="text-center animate-fade-in">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 mb-6 drop-shadow-sm">
                The modern, <span className="text-primary">contactless</span><br className="hidden sm:block" /> menu for your cafe.
              </h1>
              <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
                Replace your printed menus with a beautiful digital experience. Customers scan a QR code, browse live items, and call waiters straight from their phones.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  <Link to="/admin/signup">
                    Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto text-base h-12 px-8">
                  <Link to="/menu">
                    View Demo Menu
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Smart QR Codes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate and print custom-branded QR codes for every table. Automatically track which table is requesting service without messy setups.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/30 text-secondary-foreground">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Real-time Updates</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Toggle items as "Sold Out" from your phone and watch them instantly gray out on every customer's screen. No page refreshes required.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Beautiful & Responsive</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A gorgeous mobile-first menu that makes your dishes look irresistible. Add photos, descriptions, and feature your chef's top picks.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
