# Supabase setup — Commission form + Admin

## Quick setup (do this once in Supabase Dashboard)

1. Open your project: https://supabase.com/dashboard/project/gngrfmyucxyuutzlotre
2. Go to **SQL Editor** → **New query**
3. Paste the entire contents of [`setup.sql`](setup.sql) and click **Run**

This creates:
- `commission_requests` table
- `commission-refs` storage bucket
- `site_settings` (maintenance mode)
- Admin RPC functions (no Edge Function deploy needed)

### Already ran `setup.sql` before admin was added?

Run only [`admin-setup.sql`](admin-setup.sql) in SQL Editor instead.

Verify from your project folder:

```bash
npm run verify:admin
```

## Frontend `.env` (already configured locally)

```
VITE_SUPABASE_URL=https://gngrfmyucxyuutzlotre.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Restart `npm run dev` after changes.

## Test commission form

1. Open http://localhost:5173/contact
2. Click **填寫委託資料**, fill the form, submit
3. In Supabase **Table Editor → commission_requests**, confirm a new row appears
4. Reference files appear under **Storage → commission-refs → pending/**

## Admin page (`/admin`)

1. Ensure `npm run verify:admin` passes
2. Open http://localhost:5173/admin
3. Log in with your admin password
4. You can:
   - view all commission requests
   - change status (`pending`, `reviewing`, `accepted`, `in_progress`, `completed`, `declined`)
   - toggle site maintenance mode

Maintenance is stored in `site_settings.maintenance`. When enabled, visitors see the maintenance page; `/admin` still works.

---

## Portfolio images (artworks + 委托作品集)

Gallery images are stored in the public Storage bucket **`portfolio`**, not in the git repo.

### One-time setup

1. Run migration [`migrations/20260329000005_portfolio_storage.sql`](migrations/20260329000005_portfolio_storage.sql) if you already ran older setup SQL.
2. Put source files under:
   - `src/assets/artworks/` — e.g. `20260329.jpg`
   - `src/assets/commissions/general/` and `.../r18/` (+ `fullsize/` subfolders)
3. Upload to Supabase:

```bash
npm run upload:portfolio
```

Requires `supabase login` and `supabase link --project-ref gngrfmyucxyuutzlotre`.

### Adding a new image later

1. Upload the file to the matching path in **Storage → portfolio** (Dashboard or `supabase storage cp`).
2. Add an entry in `src/data/artworks.js` or `src/data/commissions.js` with `imagePath` / `fullsizePath`.
3. Add i18n text in `src/i18n/locales/*.json`.

Path examples:
- `artworks/20260329.jpg`
- `commissions/general/20251024.jpg`
- `commissions/general/fullsize/20251024_FULL.jpg`

---

## Commission notifications (Discord)

Frontend calls `submit-commission` Edge Function after reference uploads. On success it sends a **Discord embed** to `DISCORD_WEBHOOK_URL`.

```bash
supabase login
supabase link --project-ref gngrfmyucxyuutzlotre
supabase secrets set DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
supabase secrets set SITE_ADMIN_URL=https://jixo-website-26.vercel.app/admin
supabase functions deploy submit-commission
```

Discord webhook: channel settings → Integrations → Webhooks → copy URL.

Submissions always save to the database. If Discord fails, the form still succeeds (check Edge Function logs).
