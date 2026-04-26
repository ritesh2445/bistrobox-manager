import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export function trackEvent(eventType: string, metadata: Record<string, Json>, userId?: string): void {
  try {
    const payload: any = { event_type: eventType, metadata };
    if (userId) payload.user_id = userId;
    supabase.from("analytics").insert([payload]).then(() => {});
  } catch {
    // fire-and-forget
  }
}
