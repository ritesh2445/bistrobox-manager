import { supabase } from "@/integrations/supabase/client";

export function trackEvent(eventType: string, metadata: Record<string, unknown>): void {
  try {
    supabase.from("analytics").insert({ event_type: eventType, metadata }).then(() => {});
  } catch {
    // fire-and-forget
  }
}
