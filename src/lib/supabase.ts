import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function getChurchId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data: church } = await supabase
    .from("churches")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (church?.id) return church.id;

  const { data: adminRecord } = await supabase
    .from("church_admins")
    .select("church_id")
    .eq("email", user.email)
    .maybeSingle();

  return adminRecord?.church_id ?? null;
}
