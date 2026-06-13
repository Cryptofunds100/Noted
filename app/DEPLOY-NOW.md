# Noted — deploy checklist (GitHub + Vercel dashboard, Hobby plan)

Everything in code is ready. Follow these steps in order. The secret values you
need are in `app/.env.local` (gitignored — never commit it).

## 1. Push to GitHub
Create a new **empty** repo at https://github.com/new (no README/.gitignore).
Then, from the project root (`Noted/`):

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## 2. Import into Vercel
1. https://vercel.com/new → import the repo.
2. **Set Root Directory = `app`** (Settings → General, or during import). This is
   essential — it makes `Noted.html`, `manifest.json`, `sw.js` and `api/` sit at `/`.
3. Framework preset: **Other** (no build step). Deploy.

## 3. Add the data store (Upstash Redis)
Vercel dashboard → your project → **Storage** tab → **Marketplace** →
**Upstash** → **Redis** → create (free tier) → **Connect to Project**.
This auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`. No code change.

## 4. Environment variables
Project → **Settings → Environment Variables** (apply to Production + Preview).
Values are in `app/.env.local`:

| Variable | Value |
|---|---|
| `VAPID_PUBLIC_KEY`  | (public key — matches the one already in `pwa.js`) |
| `VAPID_PRIVATE_KEY` | (private key — **secret**) |
| `VAPID_SUBJECT`     | `mailto:lakemyles10@gmail.com` |
| `CRON_SECRET`       | a long random string you choose (used in step 6) |

Then **redeploy** (Deployments → ⋯ → Redeploy) so the vars take effect.

## 5. Verify
Open the HTTPS URL on your phone:
- **Android (Chrome):** Profile → Reminders → turn on → **Allow notifications** →
  **Send a test notification**. A real push should arrive in a second or two.
- **iPhone (Safari 16.4+):** Reminders shows an *Add to Home Screen* walkthrough.
  Do that, open Noted from the Home Screen, then enable + allow + test.

## 6. Scheduled reminders on Hobby (15-min cadence)
Vercel's cron in `vercel.json` is set to `0 9 * * *` (once daily) so the Hobby
deploy succeeds. For reminders to fire within ~15 min of the chosen time, drive
the endpoint with a free external pinger:

1. https://cron-job.org → create a cron job.
2. **URL:** `https://<your-app>.vercel.app/api/send-reminders`
3. **Schedule:** every 15 minutes.
4. **Header:** `Authorization: Bearer <your CRON_SECRET>` (from step 4).

That's it — reminders now fire even when the app is closed.

> Upgrading to Vercel **Pro** later? Change the cron in `vercel.json` back to
> `*/15 * * * *` and you can drop the external pinger.
