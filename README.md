# Harmony Threads

Music merchandise and culture goods built with Astro, Supabase, Stripe, and Resend.

## What was built

- Full e-commerce store with 3 products (The Band Graphic T-Shirt with 12 variants, The History of Rock Music eBook, Example Perfume)
- Stripe Checkout integration with dynamic pricing from Supabase
- Order confirmation emails via Resend
- Newsletter subscription
- Contact form with rate limiting + honeypot
- Admin dashboard at /admin (magic-link auth)
- Blog with Supabase-backed content (ready for Harbor Writer)
- Collection pages: /collections/graphic-shirts, /collections/digital, /collections/vintage, /collections/unisex
- SEO: sitemap, robots.txt, JSON-LD on every page, llms.txt

## Next steps

1. Add your admin email to the `admins` table in Supabase
2. Verify your domain in Resend to send from your own email
3. Connect a custom domain in Vercel
4. Add more products via /admin/products

## Stack

- Astro 5 + @astrojs/vercel SSR adapter
- Tailwind v4 via @tailwindcss/vite
- Supabase (Postgres + Auth + RLS)
- Stripe (dynamic checkout sessions)
- Resend (transactional email)
- Google Fonts: Fraunces + Manrope
