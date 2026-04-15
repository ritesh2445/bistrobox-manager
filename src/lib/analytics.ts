import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export function trackEvent(eventType: string, metadata: Record<string, Json>): void {
  try {
    supabase.from("analytics").insert([{ event_type: eventType, metadata }]).then(() => {});
  } catch {
    // fire-and-forget
  }
}
