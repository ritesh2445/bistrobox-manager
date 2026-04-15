import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="mb-2 text-7xl font-extrabold text-primary">404</h1>
      <p className="mb-6 text-lg text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link to="/menu">Back to Menu</Link>
      </Button>
    </div>
  );
}
