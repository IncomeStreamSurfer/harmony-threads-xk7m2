import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/admin";
  if (!code) return redirect("/login?error=no_code");

  const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? process.env["PUBLIC_SUPABASE_URL"] ?? "";
  const ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env["PUBLIC_SUPABASE_ANON_KEY"] ?? "";
  if (!SUPABASE_URL || !ANON_KEY) return redirect("/login?error=server_config");

  const sb = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.exchangeCodeForSession(code);
  if (error || !data.session) return redirect("/login?error=invalid_code");

  cookies.set("sb-access-token", data.session.access_token, { path: "/", maxAge: data.session.expires_in, httpOnly: true, secure: true, sameSite: "lax" });
  cookies.set("sb-refresh-token", data.session.refresh_token, { path: "/", maxAge: 30 * 24 * 60 * 60, httpOnly: true, secure: true, sameSite: "lax" });
  return redirect(next);
};
