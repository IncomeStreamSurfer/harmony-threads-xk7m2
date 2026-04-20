import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "../../../lib/email";
import { magicLinkHtml } from "../../../lib/email-templates";
import { hitOrReject } from "../../../lib/rate-limit";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { ok } = hitOrReject(ip);
  if (!ok) return new Response("Too many requests", { status: 429 });

  const { email, next } = await request.json();
  if (!email) return new Response("Missing email", { status: 400 });

  const URL = import.meta.env.PUBLIC_SUPABASE_URL ?? process.env["PUBLIC_SUPABASE_URL"] ?? "";
  const SERVICE = import.meta.env.SUPABASE_SERVICE_ROLE ?? process.env["SUPABASE_SERVICE_ROLE"] ?? "";
  const origin = import.meta.env.PUBLIC_SITE_URL ?? `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("x-forwarded-host") ?? request.headers.get("host")}`;

  if (!URL || !SERVICE) return new Response("Server not configured", { status: 500 });

  const sb = createClient(URL, SERVICE, { auth: { persistSession: false } });
  const { data: admin } = await sb.from("admins").select("email").eq("email", email).maybeSingle();
  if (!admin) return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });

  const { data, error } = await sb.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next || "/admin")}` } });
  if (error || !data.properties?.action_link) return new Response("Failed to generate link", { status: 500 });

  await sendEmail({ to: email, subject: "Your Harmony Threads admin sign-in link", html: magicLinkHtml({ loginUrl: data.properties.action_link }) });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};
