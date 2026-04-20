import type { APIRoute } from "astro";
import { stripe } from "../../lib/stripe";
import { anonClient } from "../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items, customer_email } = await request.json() as { items: Array<{ product_id: string; qty: number; variant_sku?: string }>; customer_email?: string };
    if (!items?.length) return new Response(JSON.stringify({ error: "Empty cart" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const sb = anonClient();
    if (!sb) return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });

    const { data: products, error } = await sb.from("products").select("id, slug, name, description, price_pence, currency, image_url").in("id", items.map(i => i.product_id));
    if (error || !products?.length) return new Response(JSON.stringify({ error: "Products not found" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const line_items = items.map((it) => {
      const p = products.find((x: any) => x.id === it.product_id);
      if (!p) throw new Error(`Unknown product ${it.product_id}`);
      return { quantity: Math.max(1, Math.floor(it.qty)), price_data: { currency: ((p as any).currency ?? "gbp").toLowerCase(), unit_amount: (p as any).price_pence, product_data: { name: (p as any).name, description: (p as any).description?.slice(0, 300) ?? undefined, images: (p as any).image_url ? [(p as any).image_url] : undefined, metadata: { product_id: (p as any).id, slug: (p as any).slug, variant_sku: it.variant_sku ?? "" } } } };
    });

    const origin = import.meta.env.PUBLIC_SITE_URL ?? `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("x-forwarded-host") ?? request.headers.get("host")}`;
    const session = await stripe().checkout.sessions.create({ mode: "payment", line_items, customer_email, success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/checkout/cancel`, metadata: { cart: JSON.stringify(items).slice(0, 500) }, shipping_address_collection: { allowed_countries: ["GB", "US", "CA", "AU", "NZ", "IE", "FR", "DE", "NL", "ES", "IT"] } });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Checkout failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
