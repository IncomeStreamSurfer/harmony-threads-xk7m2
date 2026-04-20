import type { AstroGlobal } from "astro";
import { ssrClient } from "./supabase";

export async function requireAdmin(Astro: AstroGlobal): Promise<Response | null> {
  const sb = ssrClient(Astro.cookies);
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return Astro.redirect("/login?next=" + encodeURIComponent(Astro.url.pathname));
  }
  const { data } = await sb.from("admins").select("email").eq("email", user.email ?? "").maybeSingle();
  if (!data) {
    return new Response("Forbidden", { status: 403 });
  }
  return null;
}
