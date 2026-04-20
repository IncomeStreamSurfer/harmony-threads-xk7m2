import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL  = import.meta.env.PUBLIC_SUPABASE_URL  ?? process.env["PUBLIC_SUPABASE_URL"]  ?? "";
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env["PUBLIC_SUPABASE_ANON_KEY"] ?? "";
const SERVICE = import.meta.env.SUPABASE_SERVICE_ROLE ?? process.env["SUPABASE_SERVICE_ROLE"] ?? "";

export function anonClient(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

export function serviceClient(): SupabaseClient | null {
  if (!URL || !SERVICE) return null;
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}

export function ssrClient(cookies: any): SupabaseClient {
  const key = ANON;
  if (!URL || !key) {
    return createClient("https://placeholder.supabase.co", "placeholder", { auth: { persistSession: false } });
  }
  const accessToken = typeof cookies?.get === "function" ? cookies.get("sb-access-token")?.value : undefined;
  const refreshToken = typeof cookies?.get === "function" ? cookies.get("sb-refresh-token")?.value : undefined;

  const client = createClient(URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  if (accessToken && refreshToken) {
    client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).catch(() => {});
  }

  return client;
}
