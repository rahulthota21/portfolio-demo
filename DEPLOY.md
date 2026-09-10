# Deploying rahulthota.dev

Three stages: **GitHub → Vercel → Namecheap DNS**. Budget about 30 minutes,
most of which is waiting for DNS.

---

## Stage 0 — Unzip and run it once locally

```cmd
cd C:\Users\<you>\Desktop
:: unzip rahulthota-portfolio.zip here, then:
cd portfolio
npm install
npm run dev
```

Open http://localhost:3000 — the site should look exactly like the preview.
Then open http://localhost:3000/jackal, sign in with the Supabase user you created,
and press **Load seed content** once. Refresh the homepage: it is now reading from
your database.

> `.env.local` is included in the zip so local dev works immediately. Git ignores it,
> so your keys never reach GitHub — you'll paste them into Vercel separately in Stage 2.

---

## Stage 1 — Push to GitHub from cmd

**a) Create an empty repo** at <https://github.com/new>
name it `portfolio`, keep it **Private** for now, and do **not** tick "Add a README".

**b) In cmd, inside the `portfolio` folder:**

```cmd
git config --global user.name "Thota Rahul"
git config --global user.email "rahulthota21@gmail.com"

git init
git add .
git commit -m "Portfolio: site, case studies, beyond-code, resume, admin console"
git branch -M main
git remote add origin https://github.com/rahulthota21/portfolio.git
git push -u origin main
```

If it asks for a password, use a **Personal Access Token**, not your GitHub password:
GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) →
Generate new token → tick `repo` → copy it and paste it as the password.

**Check before pushing** that secrets are excluded:

```cmd
git status --porcelain | findstr ".env"
```

That must print **nothing**. If it prints `.env.local`, stop and run
`git rm --cached .env.local` before committing.

**Every later change:**

```cmd
git add .
git commit -m "what changed"
git push
```

Vercel redeploys automatically on every push.

---

## Stage 2 — Deploy on Vercel

1. Go to <https://vercel.com> → sign in **with GitHub**.
2. **Add New → Project → Import** `rahulthota21/portfolio`.
   Framework preset auto-detects **Next.js**. Leave build settings alone.
3. Before clicking Deploy, expand **Environment Variables** and add these five
   (tick Production, Preview and Development for each):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://fnrtcprauxqudxjfdgnc.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key (the long `eyJ…` string) |
   | `ADMIN_EMAIL` | `rahulthota21@gmail.com` |
   | `JACKAL_GATE_KEY` | (optional but recommended) a long random string - arms console stealth mode, see below |
   | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | `https://formspree.io/f/meajqgar` |
   | `NEXT_PUBLIC_SITE_URL` | `https://rahulthota.dev` |

   No service-role key. It isn't used.
4. **Deploy.** You'll get a `…vercel.app` URL in ~2 minutes. Test `/`, `/beyond-code`,
   `/resume`, a case study and `/jackal` on it before touching DNS.

---

## Stage 3 — Point rahulthota.dev at it (Namecheap)

**a) In Vercel:** Project → **Settings → Domains** → add `rahulthota.dev`,
then add `www.rahulthota.dev`. Vercel will show "Invalid Configuration" until DNS is set —
that's expected.

**b) In Namecheap:** Domain List → **Manage** next to rahulthota.dev → **Advanced DNS**.

1. **Delete the default records** Namecheap adds: the `CNAME  @  parkingpage.namecheap.com.`
   and any `URL Redirect Record`. Leaving them will break the domain.
2. Add these two:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | A Record | `@` | `76.76.21.21` | Automatic |
   | CNAME Record | `www` | `cname.vercel-dns.com.` | Automatic |

3. Save (the green tick). Also confirm **Domain → Nameservers** is set to
   **Namecheap BasicDNS** — if it's set to custom nameservers, the records above are ignored.

**c) Wait.** Usually 10–30 minutes, up to a few hours. Check progress:

```cmd
nslookup rahulthota.dev
```

When it returns `76.76.21.21`, Vercel flips to "Valid Configuration" and issues the SSL
certificate automatically. In Vercel → Domains, set `rahulthota.dev` as the **primary**
so `www` redirects to it.

---

## Stage 4 — Three things to do after the domain is live

1. **Supabase → Authentication → URL Configuration** → set
   **Site URL** to `https://rahulthota.dev`.
2. **Send yourself a test message** through the contact form. The first submission
   triggers a one-time Formspree confirmation email — click it, or nothing arrives.
3. **Sign in to `https://rahulthota.dev/jackal`**, change one word, save, and confirm
   the public page updates. That proves the whole chain works in production.

---

## Everyday use

| I want to… | Do this |
|---|---|
| Change any text, project, paper, skill | `/jackal` → the section → Save & publish |
| Add movie posters, player photos, my designs | `/jackal → Media & resume` → upload → copy URL → paste into the item's `image` field |
| Swap in a newer resume PDF | `/jackal → Media` → upload → copy URL → `/jackal → Resume file` → paste into `file` |
| Add a paper PDF | Upload it, then paste the URL into `/jackal → Publications → pdf` |
| Publish a blog post | `/jackal → Writing` → Add → fill it in → set `published` on. The section appears on the homepage automatically |
| Change design/code | Edit locally → `git push` → Vercel redeploys |

---

## If something goes wrong

| Symptom | Cause / fix |
|---|---|
| Site shows old content after saving | Hard refresh (`Ctrl+F5`). Cache revalidates in ~60s at worst. |
| `/jackal` bounces back to login | Session expired, or you signed in with a different email than `ADMIN_EMAIL`. |
| "row-level security policy" error on save | You're signed in as a different user, or `schema.sql` wasn't run fully. Re-run it. |
| Contact form does nothing | Formspree address not confirmed yet — check your inbox for their verification mail. |
| Build fails on Vercel with a module error | Delete `.next` locally, `npm install`, `npm run build` to reproduce, then push the fix. |
| Domain still not resolving after a day | Namecheap parking records weren't deleted, or nameservers aren't BasicDNS. |
