import type { APIRoute } from "astro";
import { anonClient } from "../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async () => {
  const SITE = (import.meta.env.PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const sb = anonClient();
  const lines: string[] = [];
  lines.push(`# Harmony Threads`);
  lines.push(``);
  lines.push(`> Music merchandise and culture goods for those who live the sound.`);
  lines.push(``);
  lines.push(`## Key pages`);
  lines.push(``);
  lines.push(`- [Home](${SITE}/): Harmony Threads — curated music merchandise`);
  lines.push(`- [Shop](${SITE}/shop): Browse all products`);
  lines.push(`- [About](${SITE}/about): Our story and values`);
  lines.push(`- [Contact](${SITE}/contact): Get in touch`);
  lines.push(`- [Blog](${SITE}/blog): Music culture articles`);

  if (sb) {
    const { data: articles } = await sb.from("content").select("slug, title, excerpt").not("published_at", "is", null).order("published_at", { ascending: false }).limit(30);
    if (articles && articles.length > 0) {
      lines.push(``);
      lines.push(`## Latest articles`);
      lines.push(``);
      for (const a of articles) lines.push(`- [${a.title}](${SITE}/blog/${a.slug}): ${a.excerpt ?? ""}`);
    }
  }
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
