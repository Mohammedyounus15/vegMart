# Deploying VegMart (free, no domain needed)

Two parts: database (Supabase, free) and hosting (Vercel, free). Vercel gives you
a free `xxxx.vercel.app` link automatically — no domain purchase required.
Everything below is copy-paste — no coding needed from here.

## 1. Create the database (Supabase, free)

1. Go to supabase.com and sign up, then click **New project**.
2. Pick any name and password, choose a region close to you (e.g. Mumbai), click **Create**.
3. Once it's ready, open **SQL Editor** (left sidebar) → **New query**.
4. Open `schema.sql` from this folder, copy all of it, paste into the editor, click **Run**.
   This creates your vegetables, orders, and settings tables, and adds 9 starter vegetables.
5. Go to **Project Settings → API**. Copy two values:
   - **Project URL**
   - **anon public** key

## 2. Connect the code to your database

1. Open `config.js` in this folder.
2. Replace the two placeholder values with the Project URL and anon key from step 1.
3. Save the file.

That's it for code changes — `index.html` doesn't need editing.

## 3. Put the code on GitHub

1. Go to github.com, sign up if needed, click **New repository**. Name it `vegmart`, make it public or private, create it.
2. On the repo page, click **Add file → Upload files**, drag in **all six files** from this
   folder (`index.html`, `config.js`, `schema.sql`, `manifest.json`, `sw.js`, `icon-192.png`,
   `icon-512.png` — that's seven, upload all of them), then commit.

## 4. Deploy (Vercel, free)

1. Go to vercel.com, sign up with your GitHub account.
2. Click **Add New → Project**, select your `vegmart` repo, click **Deploy**.
3. No build settings needed — leave everything default (it's a static site).
4. In about a minute you'll get a free live URL like `vegmart-yourname.vercel.app`.
   That's your app — no domain needed. Open it and test: place a test order in Shop view,
   then check it shows up in Owner dashboard → Orders.

(Netlify works the same way if you'd rather use that — "Add new site → Import from Git".)

## 5. Install it as an app on your phone

The site is a installable PWA (Progressive Web App) — it behaves like a real app once added
to your home screen, with its own icon and no browser address bar.

**On Android (Chrome):**
1. Open your `vercel.app` link in Chrome.
2. Tap the **⋮** menu → **Add to Home screen** (or you may see an automatic "Install app" banner).
3. Confirm — the VegMart icon appears on your home screen like any other app.

**On iPhone (Safari):**
1. Open your `vercel.app` link in Safari (must be Safari, not Chrome, for this to work).
2. Tap the **Share** icon → **Add to Home Screen**.
3. Confirm — same result, a real app icon, opens full-screen.

Do this both for yourself (as the owner) and encourage customers to do it too — makes
reordering as easy as tapping an icon.

## Later: adding a custom domain

Whenever you're ready, you can still add a real domain (e.g. `vegmart.in`) on top of this
same free Vercel deployment — no rebuild needed. Just say the word and I'll walk you through it.

## After you're live

- Set your WhatsApp number and an admin PIN in Owner dashboard → Settings.
- Add your real vegetables and prices in Owner dashboard → Inventory (delete the sample ones).
- The `anon` key in `config.js` is meant to be public — it ships inside your site's code either
  way. The PIN is a soft gate, not real security. If this grows past a single local shop,
  come back and we can add proper Supabase Auth so only you can log in to the dashboard.
