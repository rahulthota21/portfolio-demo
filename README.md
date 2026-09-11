# rahulthota.dev

Portfolio for **Thota Rahul** — AI/ML engineer & backend developer.
Next.js 14 (App Router) · Tailwind · Supabase · Formspree · deployed on Vercel.

Built to the Mobbin design language: gallery-white monochrome, Inter at 650/450/300,
stadium pills, 24px cards, no drop shadows, ink footer. Dark mode is the same ladder,
polarity-flipped.

---

## Pages

| Route | What it is |
|---|---|
| `/` | Hero → Stats → About → Projects → Publications → Skills → Journey → Testimonials → Contact |
| `/work/[slug]` | Full case study per project (6 of them) |
| `/beyond-code` | Personal page — quote, Now, favourites, freelance/design enquiry |
| `/resume` | Live PDF viewer + download |
| `/jackal` | Private admin console (noindex, auth-protected) |

---

## 1. Run it locally

```bash
npm install
cp .env.example .env.local     # already filled with the Formspree endpoint
npm run dev                    # http://localhost:3000
```

With no Supabase keys the site renders from `src/data/seed.ts`. Everything works —
only the admin console's *save* is disabled.

---

## 2. Connect Supabase

The project is already wired to **`fnrtcprauxqudxjfdgnc`**. `.env.local` holds the URL
and the anon key; you only have to create the tables and your user.

1. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
   This creates the `content` table, the public `media` bucket, and the RLS policies.
2. **Authentication → Users → Add user** → `rahulthota21@gmail.com` + a long password,
   tick *Auto Confirm User*.
3. **Authentication → Sign In / Providers → Email** → turn **"Allow new users to sign up" OFF**.
   Now no one else can ever create an account.
4. *(Recommended)* **Authentication → MFA** → enable **TOTP** and enrol your
   authenticator app. The login screen already handles the 6-digit challenge.
5. Go to `/jackal`, sign in, press **Load seed content** once. That copies all 15
   sections into the database and the site starts reading from Supabase.

### No secret key needed

Writes run through **your own logged-in session**, and Postgres itself checks the email
inside your JWT on every insert, update and delete:

```sql
create policy "owner can update content" on public.content for update to authenticated
  using (public.is_site_owner()) with check (public.is_site_owner());
```

So the anon/publishable key is harmless in the browser — it can read the site content
(which is public anyway) and nothing else. There is no all-powerful service-role key
sitting in the environment to leak. `SUPABASE_SERVICE_ROLE_KEY` is supported but stays
optional, for scripted maintenance only.

### The rest of the hardening

- Middleware guards `/jackal`: no session → redirect to login; wrong email → forced sign-out.
- Every `/jackal` response, redirects included, sends `X-Robots-Tag: noindex, nofollow, noarchive`,
  and `robots.txt` disallows the path.
- Optional TOTP two-factor on top of the password.
- Site-wide headers: `nosniff`, `SAMEORIGIN`, strict referrer policy, camera/mic/geo disabled.
- Uploads capped at 10 MB, MIME-allowlisted (images + PDFs only) and filename-sanitised.
- Content saves are shape-checked before they touch the database, and every database row is
  re-checked on read - a malformed value can never take the public site down.

### Console stealth mode

`/jackal` is private, and with stealth mode it stays **invisible**: set `JACKAL_GATE_KEY`
to a long random string (`openssl rand -hex 24`) in your environment and every `/jackal*`
page returns a genuine 404 to anyone without the key - no login screen, no hint the
console exists. Your private bookmark is:

```
https://rahulthota.dev/jackal/login?k=<JACKAL_GATE_KEY>
```

That plants a 30-minute httpOnly cookie so refreshes (including the 2FA step) keep working,
then email + password (+ TOTP, if enrolled) get you in. Signing out lands on the homepage.
Leave `JACKAL_GATE_KEY` unset to keep the old always-visible login behaviour.

## 3. Using the console

`/jackal` edits every section of the site. Each field is a real form control — arrays
can be added to, reordered and deleted, booleans are toggles, and any field named
`image` / `pdf` / `file` gets an upload button. There's a JSON view for power edits and
a **Restore seed** button per section.

Save publishes immediately: the server action revalidates the cache tag and all paths,
so the public site updates within a second or two.

**Media & resume** uploads to the public `media` bucket. Upload → copy URL → paste into
the field that needs it (poster in Beyond code, diagram on a project, PDF on a paper,
new resume in the Resume section).

---

## 4. Deploy to Vercel

```bash
git init && git add -A && git commit -m "portfolio"
gh repo create rahulthota21/portfolio --private --source=. --push
```

1. **vercel.com → New Project → import the repo.** Framework auto-detects as Next.js.
2. **Settings → Environment Variables** — add these for Production, Preview and Development:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAIL`,
   `NEXT_PUBLIC_FORMSPREE_ENDPOINT`, `NEXT_PUBLIC_SITE_URL=https://rahulthota.dev`,
   and (recommended) `JACKAL_GATE_KEY` — see *Console stealth mode* below.
   (`SUPABASE_SERVICE_ROLE_KEY` is optional — leave it out.)
3. **Settings → Domains → Add `rahulthota.dev`** and `www.rahulthota.dev`.
   At your registrar set:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
   Vercel issues the SSL certificate automatically.
4. Deploy. First submission of the contact form will ask you to confirm the
   Formspree address once.

---

## 5. Still to add (nothing on the site fakes these)

- [ ] **Paper PDFs** → upload in `/jackal → Media`, then paste the URLs into
      Publications. Until then those buttons point at `/pdfs/...` which will 404 —
      or clear the `pdf` field to hide the button entirely.
- [x] **Testimonial approval** → confirmed by you; all four now show their real names.
- [ ] **Posters and photos** for Beyond code — tiles show initials until you upload images in `/jackal → Media`.
- [ ] **Empty favourite sections** (software tools, YouTubers, gallery, poster designs)
      are hidden until you add items.
- [ ] **Now block** — add Watching / Listening / Letterboxd rows when you want them.
- [ ] **Architecture diagrams** — upload and set `archImage` on any project.
- [ ] **Blog** — the section stays hidden until a post has `published: true`.

---

## Project structure

```
src/
  app/
    page.tsx                home
    work/[slug]/page.tsx    case studies
    beyond-code/page.tsx    personal page
    resume/page.tsx         PDF viewer
    jackal/                 admin: login, dashboard, editors, media
    sitemap.ts robots.ts    SEO
  components/               UI + sections + admin
  data/seed.ts              all content, single source of truth
  data/types.ts             the shape Supabase mirrors
  lib/content.ts            Supabase-or-seed data layer
  middleware.ts             auth guard + security headers
supabase/schema.sql         run this once
public/files/…              resume PDF
public/og-card.png          social share card
```
