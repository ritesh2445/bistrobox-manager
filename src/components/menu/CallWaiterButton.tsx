import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CallWaiterButtonProps {
  tableParam: string | null;
}

export function CallWaiterButton({ tableParam }: CallWaiterButtonProps) {
  const handleClick = () => {
    toast.success(
      tableParam ? `Waiter notified for Table ${tableParam}` : "Waiter notified",
      { duration: 4000 }
    );
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 right-6 z-50 gap-2 rounded-full shadow-lg shadow-primary/25"
    >
      <Bell className="h-4 w-4" />
      {tableParam ? `Call Waiter — Table ${tableParam}` : "Call Waiter"}
    </Button>
  );
}
