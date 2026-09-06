import { supabase } from "@/integrations/supabase/client";

/** First name (or email handle) of the signed-in user, for greetings. */
export async function getFirstName(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return "there";
  const meta = user.user_metadata as { display_name?: string; full_name?: string; name?: string };
  const raw = meta.display_name ?? meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "there";
  const first = raw.trim().split(/\s+/)[0] ?? raw;
  return first.charAt(0).toUpperCase() + first.slice(1);
}
