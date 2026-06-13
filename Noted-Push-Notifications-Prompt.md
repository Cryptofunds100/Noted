# Claude Design Follow-up Prompt — Noted: Symptom-Log Reminder Push Notifications

> **How to use this file.** Paste everything inside the `=== ADD-ON PROMPT ===` block into the existing Noted prototype chat in Claude Design as a follow-up message. Resolve the **⚑ ASSUMPTION** flags at the end first if you want different choices.
>
> **One thing to know before you paste:** real scheduled push notifications cannot be done from the browser alone — a timer in the page dies the moment the app closes, and no mobile browser supports client-side scheduled notifications. They require a small server component (covered in the prompt: Vercel serverless functions + a cron job). If the current prototype is a single client-only React file, Claude Design will need to restructure it as a Vercel-deployable project with `/api` routes. The prompt instructs it to do so.

---

=== ADD-ON PROMPT ===

## New feature: symptom-log reminder push notifications

Add real, working push-notification reminders to the existing Noted prototype. These must function when the app is deployed to Vercel and added to the home screen on both iPhone (Safari, iOS 16.4+) and Samsung/Android (Chrome or Samsung Internet) — not simulated in-app toasts. Keep every existing screen, flow, and design-system rule intact.

## 1. Make the app an installable PWA (prerequisite)

- Add a web app manifest: `name: "Noted"`, `short_name: "Noted"`, `display: "standalone"`, `start_url: "/"`, `background_color: #F8F7F4`, `theme_color: #0B5C6B`, and icons at 192×192 and 512×512 (plus a maskable variant).
- Add `<link rel="apple-touch-icon">` and iOS meta tags so the home-screen install looks native on iPhone.
- Register a service worker at root scope (`/sw.js`) handling `push` (show the notification) and `notificationclick` (focus or open the app at the Log tab).
- The app must pass Lighthouse's "installable" check.

## 2. Push architecture (server-backed — required for scheduled reminders)

Structure the project so it deploys to Vercel with serverless API routes:

- **VAPID web push.** Generate a VAPID key pair (public key in the client, private key as a Vercel environment variable). Use the `web-push` npm library server-side.
- **`POST /api/subscribe`** — stores the user's `PushSubscription` JSON together with their reminder preferences (times, count, timezone) in a simple data store.
- **`POST /api/unsubscribe`** — removes it.
- **`GET /api/send-reminders`** — invoked by a **Vercel Cron job every 15 minutes** (`vercel.json` crons entry). It compares each stored user's local reminder times (use their saved IANA timezone) against the current time and sends a push to anyone whose reminder is due in this window. Delete subscriptions that return 404/410 (expired).
- Notification payload: title "Noted", body in calm plain English, e.g. "Time for a quick check-in. Logging takes under 30 seconds." Tapping opens the symptom-log flow directly. Never include symptom details or anything medical in the notification itself — it appears on the lock screen.

## 3. Platform-specific behaviour (both must work)

**iPhone (Safari / iOS 16.4+):**
- Web push on iOS works **only after the app is added to the home screen** — never from a normal Safari tab.
- Detect installed state with `display-mode: standalone`. If the user is on iOS Safari and **not** installed, do not show a broken enable button — show a short, friendly "Add Noted to your Home Screen" walkthrough instead (Share button → Add to Home Screen), with simple illustrated steps. Surface the enable-notifications option only once running standalone.
- The native permission prompt must be triggered by an explicit user tap (iOS requirement) — never on page load.

**Samsung / Android (Chrome and Samsung Internet):**
- Standard web push: works in the browser and when installed. Show the same explainer-then-permission flow; offer the install prompt (`beforeinstallprompt`) as a gentle suggestion, not a gate.

**Feature-detect everything** (`'serviceWorker' in navigator`, `'PushManager' in window`, `Notification.permission`) and degrade gracefully with an honest message when unsupported.

## 4. Settings UI — Profile → "Reminders"

A new section in the Profile tab, fully on-design-system (light + dark parity, ≥48px tap targets, NHS reading age 9–11 copy):

- **Master toggle** — "Remind me to log my symptoms."
- **Quantity** — the user chooses **1 to 4 reminders per day**.
- **Time per reminder** — each reminder has its own large, accessible time picker (sensible defaults: 1 = 8:00 pm; 2 = 9:00 am + 8:00 pm; 3 adds 2:00 pm; 4 adds 12:00 pm).
- **Smart skip toggle (default on)** — "Skip reminders on days I've already logged." The cron endpoint checks last-log date before sending.
- **Permission states handled visibly:** before asking, show a one-line explainer card ("We'll send a short reminder at the times you choose. You can change or stop these any time.") with an "Allow notifications" button that triggers the native prompt. If denied, show calm instructions for re-enabling in device settings — never nag or re-prompt automatically.
- Changes to times/quantity sync to the server immediately via `/api/subscribe`.
- Tone rules apply: reminders are an aid, not a streak. No guilt copy ("You missed a day"), no badges, no escalation.

## 5. Acceptance criteria

- Deployed on Vercel over HTTPS, the app installs to the home screen on iPhone and Samsung and delivers a real push at a user-chosen time **while the app is closed**.
- Changing quantity or times changes what is actually delivered.
- Smart skip suppresses the reminder on days with an existing log.
- A "Send test notification" button in the Reminders settings fires a real push end-to-end for verification.
- All new UI meets the existing accessibility bar (WCAG 2.2 AA, dark-mode parity, reduced-motion respected).
- Document in a short README: how to generate VAPID keys, which Vercel env vars to set, and the cron configuration — so deployment needs no guesswork.

=== END ADD-ON PROMPT ===

---

## ⚑ Assumption flags — resolve these

1. **Data store for subscriptions.** Storing push subscriptions and reminder preferences needs persistence across cron runs. I've left the choice open in the prompt; tell Claude Design which you have: **Vercel KV / Upstash Redis** (simplest), **Supabase**, or **Vercel Postgres**. If you have none, say "use Upstash Redis via Vercel Marketplace" — it has a free tier and one env var.
2. **Cron granularity.** Every 15 minutes means reminders fire within ~15 min of the chosen time (Vercel free/hobby tier limits cron frequency — hobby allows only **once per day**, so a Pro plan or an external cron pinger like cron-job.org may be needed for 15-min granularity). Confirm your Vercel plan.
3. **Max 4 reminders/day.** I capped quantity at 4 to stay clinical-calm rather than naggy. Raise it if you want.
4. **Smart skip default on.** Suppressing reminders once the day's log exists fits the "never nag" voice, but means fewer touchpoints. Flip the default if you prefer.
5. **iOS floor.** Web push requires iOS 16.4+ and home-screen install — that covers ~95% of iPhones in 2026, but a normal Safari tab will never receive pushes; the install walkthrough is the workaround, not a bug.
