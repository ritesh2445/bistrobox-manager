import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-primary" />
      <h1 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mb-6 text-muted-foreground">An unexpected error occurred in the admin panel.</p>
      <Link to="/admin/login" className="text-primary underline hover:opacity-80">
        Back to login
      </Link>
    </div>
  );
}
