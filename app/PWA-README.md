# Noted — PWA notes

The app is now an installable, offline-capable Progressive Web App.

## What was added
- `manifest.json` — name, icons, theme colour, standalone display, launch
  shortcuts (Log a symptom / Daily check-in).
- `sw.js` — service worker. Caches the app shell + CDN scripts, serves the app
  offline, and handles push notifications and notification taps.
- `pwa.js` — registers the service worker and exposes notification + install
  helpers. Loads before React.
- `assets/icons/` — generated app icons (192/512, maskable, Apple touch,
  favicons) from the Noted brand mark.
- Standalone-aware shell: on a phone or once installed the app fills the screen
  with real safe-area insets (no simulated bezel); on a wide desktop preview it
  still shows the iPhone frame.
- Profile → **Reminders**: turn on notifications, send a test reminder, and
  (where supported) an "Add to home screen" button / iOS hint.

## Deploy on Vercel (HTTPS)
The service worker and `Notification` API require a secure context, so they
only fully work once deployed (or on `localhost`).

1. Push this project to a Git repo and import it into Vercel, **or** run
   `vercel` from the command line.
2. Deploy the **`app/`** folder as the site root (set the Root Directory to
   `app` in the Vercel project settings). That keeps `manifest.json`, `sw.js`
   and `Noted.html` as siblings at `/`.
3. Visit the HTTPS URL on a phone → the browser will offer **Add to Home
   Screen** (Android/Chrome shows a prompt; on iOS use Share → Add to Home
   Screen). Launched from the home screen it opens full-screen, like a normal
   app.

`app/vercel.json` sets `no-cache` on the service worker, the correct manifest
content type, and rewrites `/` to `Noted.html` so the root URL opens the app.
(It lives inside `app/` because Vercel reads `vercel.json` from the configured
Root Directory.)

## Push notifications
Symptom-log reminders are delivered by **real server-backed Web Push** from
Vercel serverless functions, on a schedule — they arrive even when the app is
closed. The endpoints (`/api/subscribe`, `/api/unsubscribe`, `/api/test`,
`/api/send-reminders`) and the every-15-minutes cron job are already wired.

To turn it on you only need to supply VAPID keys and (for durable storage) a
Redis store. **See `README.md` for the full step-by-step:** generating VAPID
keys, the Vercel environment variables to set, and the cron configuration.

Until a VAPID key is configured the app falls back to local notifications, so
the Reminders UI is fully usable in development.
