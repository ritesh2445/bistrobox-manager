import { AlertTriangle } from "lucide-react";

export function MenuErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-primary" />
      <h1 className="mb-2 text-2xl font-bold text-foreground">Unable to load menu.</h1>
      <p className="text-muted-foreground">Please ask a staff member.</p>
    </div>
  );
}
