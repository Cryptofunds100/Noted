# Noted — deploy & reminder push notifications

Noted is an installable PWA. Symptom-log reminders are delivered by real Web
Push (VAPID) from Vercel serverless functions on a schedule — they arrive on the
lock screen even when the app is closed.

Deploy this **`app/`** folder as the Vercel project root (Project → Settings →
Root Directory = `app`). That keeps `Noted.html`, `manifest.json`, `sw.js` and
the `api/` functions all at `/`.

---

## 1. Generate VAPID keys

VAPID is the key pair that authorises your server to push to the browser.

```bash
npx web-push generate-vapid-keys
```

You get a **public** key and a **private** key.

- Paste the **public** key into `pwa.js` → `const VAPID_PUBLIC_KEY = '…'`.
  (It is safe in the client — that is what it is for.)
- Keep the **private** key secret — it goes in an env var (next step).

## 2. Set Vercel environment variables

Project → Settings → Environment Variables:

| Variable | Value | Notes |
|---|---|---|
| `VAPID_PUBLIC_KEY` | the public key from step 1 | must match the one in `pwa.js` |
| `VAPID_PRIVATE_KEY` | the private key from step 1 | **secret** |
| `VAPID_SUBJECT` | `mailto:you@example.com` | optional; a contact for push services |
| `CRON_SECRET` | any long random string | optional; locks `/api/send-reminders` to Vercel Cron |

### Data store (so subscriptions survive across deploys/regions)

Add a Redis store from the Vercel Marketplace (Upstash) and connect it to the
project. It provisions these automatically:

| Variable | Provided by the integration |
|---|---|
| `KV_REST_API_URL` | the store's REST URL |
| `KV_REST_API_TOKEN` | the store's REST token |

If these are absent the API still runs (in-memory), which is enough to fire a
**test** push, but stored subscriptions won't survive between invocations — so
scheduled reminders need the store.

## 3. Cron configuration

`vercel.json` already registers the job:

```json
"crons": [
  { "path": "/api/send-reminders", "schedule": "*/15 * * * *" }
]
```

This hits `/api/send-reminders` every 15 minutes. Each run compares every stored
user's saved reminder times (in **their** IANA timezone) against the current
time and pushes to anyone due in that 15-minute window.

> Cron runs every 15 minutes require a Vercel **Pro** plan. On Hobby, cron is
> limited to once a day — the endpoint still works if you call it yourself.

## 4. Deploy & test

1. Push to Git and import into Vercel (Root Directory = `app`), or run `vercel`.
2. Open the HTTPS URL on a phone.
   - **Android (Chrome / Samsung Internet):** add to Home Screen when offered
     (optional). Open **Profile → Reminders**, turn it on, tap **Allow
     notifications**.
   - **iPhone (Safari, iOS 16.4+):** Reminders shows an *Add to Home Screen*
     walkthrough. Do that, open Noted from the Home Screen, then turn reminders
     on and **Allow notifications**. (iOS only allows web push from the
     installed app, and the prompt must follow a tap.)
3. In **Profile → Reminders**, tap **Send a test notification** — a real push
   should arrive within a second or two.
4. Set a reminder time a few minutes ahead, close the app, and wait for the next
   cron run.

---

## How the pieces fit

| File | Role |
|---|---|
| `manifest.json` | installable PWA metadata + icons |
| `sw.js` | service worker — offline shell, `push`, `notificationclick` (opens the Log flow) |
| `pwa.js` | client glue — SW registration, permission, push subscription, syncs prefs to the API |
| `api/_store.js` | shared storage (Redis REST or in-memory) + web-push/VAPID setup |
| `api/subscribe.js` | `POST` — store a subscription + reminder prefs |
| `api/unsubscribe.js` | `POST` — remove a subscription |
| `api/test.js` | `POST` — send one push now (the test button) |
| `api/send-reminders.js` | `GET` — the cron job that sends due reminders |
| `vercel.json` | rewrites, the cron entry, SW/manifest headers |

### Reminder preferences (what the client syncs)

```json
{
  "enabled": true,
  "count": 2,
  "times": ["09:00", "20:00"],
  "smartSkip": true,
  "timezone": "Europe/London",
  "lastLogDate": "2026-06-06"
}
```

`send-reminders` skips a user when `smartSkip` is on and `lastLogDate` equals
today in their timezone, and records each sent slot so a slightly early/late
cron run can't double-fire. Subscriptions that return **404/410** (expired) are
deleted automatically.

The notification payload never contains symptom or medical detail — just a calm
nudge — because it can appear on a locked screen.
