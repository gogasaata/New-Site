# VIN Holding — corporate website + admin panel

Next.js 15 (App Router, TypeScript) · Tailwind CSS · Supabase (optional) · English only.

## Run locally
```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD at minimum
npm run dev                  # http://localhost:3000   (admin: /admin)
```
The site works with built-in default text even with no Supabase keys.

## Deploy on Vercel
1. Push this repo to GitHub, then in Vercel: **Add New → Project → import the repo** (framework auto-detected as Next.js).
2. **Settings → Environment Variables**:
   - `ADMIN_PASSWORD` — password for `/admin` (required for the admin panel)
   - `ADMIN_SESSION_SECRET` — optional random string for signing the login cookie
   - `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — to enable saving edits (keep the service key secret; it is only used server-side)
3. Deploy. Redeploy after changing env vars.

## Supabase
Create a project, open **SQL Editor**, and run `supabase/schema.sql` (creates `site_content` and `contact_messages`). Then add the two env vars above.
Log in at `/admin`, edit any text block, press **Save changes** — the live site updates immediately.

## Globe
`components/Globe.tsx` is a canvas globe (dotted land, red connection arcs, drag to rotate). To use your own render instead, set **Globe image URL** in the admin (Hero tab), e.g. `/globe.webp` after placing the file in `/public`.

## Notes
- Header links: Home, About Us, Our Businesses, Investments, Partnerships, Contact. Investments and Partnerships sections reuse your supplied copy and are editable in the admin.
- The 01/02/03 arrows scroll to the matching block in "Our Businesses" and highlight it.
