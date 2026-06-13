# Chat

_Started 2026-06-12 22:14 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "Noted Mobile App"
Project currently has 4 file(s)
User is viewing file: app/Noted.html
Current date is now June 12, 2026
</system-info>

<pasted_text name="Pasted text (66 lines)">
New feature: symptom-log reminder push notifications

Add real, working push-notification reminders to the existing Noted prototype. These must function when the app is deployed to Vercel and added to the home screen on both iPhone (Safari, iOS 16.4+) and Samsung/Android (Chrome or Samsung Internet) — not simulated in-app toasts. Keep every existing screen, flow, and design-system rule intact.

1. Make the app an installable PWA (prerequisite)


Add a web app manifest: name: "Noted", short_name: "Noted", display: "standalone", start_url: "/", background_color: #F8F7F4, theme_color: #0B5C6B, and icons at 192×192 and 512×512 (plus a maskable variant).
Add &lt;link rel="apple-touch-icon"&gt; and iOS meta tags so the home-screen install looks native on iPhone.
Register a service worker at root scope (/sw.js) handling push (show the notification) and notificationclick (focus or open the app at the Log tab).
The app must pass Lighthouse's "installable" check.


2. Push architecture (server-backed — required for scheduled reminders)

Structure the project so it deploys to Vercel with serverless API routes:


VAPID web push. Generate a VAPID key pair (public key in the client, private key as a Vercel environment variable). Use the web-push npm library server-side.
POST /api/subscribe — stores the user's PushSubscription JSON together with their reminder preferences (times, count, timezone) in a simple data store.
POST /api/unsubscribe — removes it.
GET /api/send-reminders — invoked by a Vercel Cron job every 15 minutes (vercel.json crons entry). It compares each stored user's local reminder times (use their saved IANA timezone) against the current time and sends a push to anyone whose reminder is due in this window. Delete subscriptions that return 404/410 (expired).
Notification payload: title "Noted", body in calm plain English, e.g. "Time for a quick check-in. Logging takes under 30 seconds." Tapping opens the symptom-log flow directly. Never include symptom details or anything medical in the notification itself — it appears on the lock screen.


3. Platform-specific behaviour (both must work)

iPhone (Safari / iOS 16.4+):


Web push on iOS works only after the app is added to the home screen — never from a normal Safari tab.
Detect installed state with display-mode: standalone. If the user is on iOS Safari and not installed, do not show a broken enable button — show a short, friendly "Add Noted to your Home Screen" walkthrough instead (Share button → Add to Home Screen), with simple illustrated steps. Surface the enable-notifications option only once running standalone.
The native permission prompt must be triggered by an explicit user tap (iOS requirement) — never on page load.


Samsung / Android (Chrome and Samsung Internet):


Standard web push: works in the browser and when installed. Show the same explainer-then-permission flow; offer the install prompt (beforeinstallprompt) as a gentle suggestion, not a gate.


Feature-detect everything ('serviceWorker' in navigator, 'PushManager' in window, Notification.permission) and degrade gracefully with an honest message when unsupported.

4. Settings UI — Profile → "Reminders"

A new section in the Profile tab, fully on-design-system (light + dark parity, ≥48px tap targets, NHS reading age 9–11 copy):


Master toggle — "Remind me to log my symptoms."
Quantity — the user chooses 1 to 4 reminders per day.
Time per reminder — each reminder has its own large, accessible time picker (sensible defaults: 1 = 8:00 pm; 2 = 9:00 am + 8:00 pm; 3 adds 2:00 pm; 4 adds 12:00 pm).
Smart skip toggle (default on) — "Skip reminders on days I've already logged." The cron endpoint checks last-log date before sending.
Permission states handled visibly: before asking, show a one-line explainer card ("We'll send a short reminder at the times you choose. You can change or stop these any time.") with an "Allow notifications" button that triggers the native prompt. If denied, show calm instructions for re-enabling in device settings — never nag or re-prompt automatically.
Changes to times/quantity sync to the server immediately via /api/subscribe.
Tone rules apply: reminders are an aid, not a streak. No guilt copy ("You missed a day"), no badges, no escalation.


5. Acceptance criteria


Deployed on Vercel over HTTPS, the app installs to the home screen on iPhone and Samsung and delivers a real push at a user-chosen time while the app is closed.
Changing quantity or times changes what is actually delivered.
Smart skip suppresses the reminder on days with an existing log.
A "Send test notification" button in the Reminders settings fires a real push end-to-end for verification.
All new UI meets the existing accessibility bar (WCAG 2.2 AA, dark-mode parity, reduced-motion respected).
Document in a short README: how to generate VAPID keys, which Vercel env vars to set, and the cron configuration — so deployment needs no guesswork.
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Noted Design System (design system)">
[Design System] This project uses the **Noted Design System** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

This project has the **NotedDesignSystem_6f9472** design system bound under `_ds/`. Run `list_files` on `_ds/` to find the bound folder (one folder per design system), e.g. `_ds/<folder>/`.

**Loading the bundle is how you use this design system.** Every page you build must load `_ds/<folder>/_ds_bundle.js` and compose with the components it exports on `window.NotedDesignSystem_6f9472` — do not recreate those components from scratch or restyle raw HTML to look like them. The bundle calls `React.createElement`, so `window.React` and `window.ReactDOM` must be loaded first. Then add these once:

```html
<link rel="stylesheet" href="_ds/<folder>/colors_and_type.css">
<link rel="stylesheet" href="_ds/<folder>/noted-ds-doc.css">
<script src="_ds/<folder>/_ds_bundle.js"></script>
```

The bundle is plain compiled JS — load it with a regular `<script>` (no `type="text/babel"` or `type="module"`). Every component is then available on `window.NotedDesignSystem_6f9472` — e.g. `const { Button, Card } = window.NotedDesignSystem_6f9472;`. The linked stylesheet(s) carry the design tokens (colors, type, spacing) — style against those via `var(--*)` and the design system's classes rather than guessing values.

The full design-system source tree lives at `/projects/6f94720d-4764-40bd-86d9-c0de99dbe444/` — use `list_files` / `read_file` from there for anything not under `_ds/` (layout varies by brand; don't assume folder names). Its guide is reproduced below so you don't need to fetch it:

<design-system-guide>
# Noted Design System

A comprehensive design system for **Noted** — a UK-based symptom journal and health
tracking app for patients with chronic and acute conditions.

&gt; "Get it Noted" — your symptoms, heard and recorded.

---

## Brand Positioning

| | |
|---|---|
| **Name** | Noted |
| **Audience** | Patients aged 25–75 with chronic conditions, plus their clinicians (GPs, physios, dietitians, psychologists, OTs) |
| **Positioning** | A medical tool, not a wellness app |
| **Tone** | Calm, credible, plain-spoken, never patronising |
| **Familiarity model** | NHS digital users (calm, trustworthy, accessible) — but Noted is independent and never copies NHS branding |

## Design Philosophy

Three rules apply to every component:

1. **Calm over clever** — no decorative animation, only reassuring transitions.
2. **Accessibility as default** — WCAG 2.2 AA minimum, AAA for body text.
3. **Clinical credibility through restraint** — no gradients, glassmorphism, or playful illustration.

## Sources

This design system was authored from a written brief (no codebase, Figma, or
attachments were provided). If the user later supplies real assets — a Figma
file, a repo, screenshots from the live app — those should be the source of
truth and this README should be updated to reflect them.

- Inter is loaded from Google Fonts (`https://fonts.googleapis.com/css2?family=Inter`).
  **Substitution flag:** if Noted ships a different brand typeface, point us at the
  font files and we'll swap them in.
- Lucide is used as the icon set (CDN). **Substitution flag:** if Noted maintains
  its own SVG icon library, drop the SVGs into `assets/icons/` and update
  the ICONOGRAPHY section.

---

## Content Fundamentals

Noted's voice is the voice of a calm clinician. Not chatty, not stiff. It treats
the reader as an adult and never minimises what they're going through.

**Reading age 9–11** (NHS standard). Short sentences. Plain words. If a clinical
term is the right word, use it — don't invent a friendly synonym.

**Person.** Second person, warm but not chummy. "You" for the patient; "we" only
when it's literally the app doing something.

**Casing.** Sentence case everywhere — buttons, headers, navigation. No Title
Case. No ALL CAPS except for very small meta labels (e.g. timestamps).

**Praise vs. acknowledgement.** Acknowledge effort, don't congratulate.

- ✅ "Thanks for logging."
- ✅ "Logged for today."
- ❌ "Awesome job!" / "You smashed it!"

**Reassurance vs. minimisation.** Never minimise concerns. The word "worry" — in
phrases like "Don't worry" — is banned. If something is concerning, say so plainly
and tell the user what to do.

- ✅ "These symptoms can be serious. Call 111 or your GP today."
- ❌ "Don't worry, it's probably nothing."

**Clinical labels.** Use clinical terms in labels and headings; explain in body.

- ✅ Label: **Severity** · Helper: "How bad is it right now, from 1 to 10?"
- ❌ Label: **How bad is it?**

**Microcopy examples**

| Surface | Copy |
|---|---|
| Empty Today screen | "Nothing logged yet today. Add a symptom when you're ready." |
| Save confirmation | "Saved. Your GP will see this on your next share." |
| Reminder | "It's been 3 days since you last logged your migraine. Add an entry?" |
| Red-flag prompt | "Chest pain that spreads to your arm needs urgent care. Call 999." |
| Error state | "We couldn't save that entry. Check your connection and try again." |

**Emoji.** Not used in clinical contexts. Simple line-drawn mood faces are the
only exception, and only inside the mood/feeling selector.

**Numbers.** Use tabular figures (Inter `font-variant-numeric: tabular-nums`).
Dates in UK format: `28 May 2026`. Times in 24-hour where it improves clarity
(e.g. medication schedules); 12-hour with `am`/`pm` lowercase otherwise.

---

## Visual Foundations

### Colour

A warm, restrained, clinical palette. **No gradients**, no neon, no glow. Colour
never carries meaning alone — it's always paired with an icon or label.

- **Primary surfaces** lean teal-blue (`#0B5C6B`) and slate (`#2C4A6B`).
- **Background** is warm white (`#F8F7F4`) — never pure `#FFFFFF`. This softens
  long reading sessions and feels less sterile.
- **Severity** uses a 5-step soft scale running soft green → muted yellow → warm
  amber → terracotta → restrained red. Hues are desaturated on purpose; a bright
  red would feel alarming for a 6/10 that the patient is already managing.
- **Dark mode** is a true dark navy (`#0F1A24`) — not pure black — with surfaces
  at `#1A2733`. Full parity with light mode; same components, same hierarchy.

See `colors_and_type.css` for the full token list, and `preview/` for swatch
specimens.

### Typography

- **Family:** Inter for everything — UI, body, headings, and numbers.
- **Numbers:** Inter with `font-variant-numeric: tabular-nums` for data tables,
  severity scores, dates, and any digit that lines up under another digit.
- **Scale:** body 17px / 1.5, small 15px (never below), H1 32px / 600,
  H2 24px / 600, H3 19px / 600, buttons 17px / 500.
- **Line length:** 65–72 characters for body copy.

### Spacing

A 4px base unit. Use multiples: **4, 8, 12, 16, 24, 32, 48, 64**. Card padding
20px, section padding 24px minimum. Generous white space; the page should
breathe. If a layout feels cramped, add more space before adding hierarchy.

### Backgrounds &amp; imagery

- **Surfaces** are flat warm white or warm-tinted dark navy. No textures, no
  patterns, no gradients.
- **No stock photography** of healthy smiling models or sad-looking patients.
  If imagery is needed, prefer anatomical diagrams (line illustrations) or the
  body-map silhouette.
- **No decorative SVG flourishes.** Charts, body maps, and the mood-face selector
  are the only illustrations.

### Borders, radii, elevation

- **Borders** are 1px in `#E5E7EB` (light) / `rgba(232, 230, 225, 0.10)` (dark)
  for resting surfaces. Inputs get 1.5px borders so they read as interactive.
- **Radii:** `4px` (chips, tags), `8px` (buttons, inputs, status panels),
  `12px` (cards), `999px` (pills, the voice button).
- **Elevation:** essentially none. Cards rely on a 1px border, **not** a drop
  shadow. The single exception is a very subtle shadow on the floating action
  button and bottom-sheet modals (`0 1px 2px rgba(15, 26, 36, 0.04)`).

### Animation

- **Easing:** `cubic-bezier(0.2, 0, 0.2, 1)` (a calm ease-out).
- **Durations:** 120ms (state changes), 200ms (transitions), 320ms (modals).
- **Allowed:** fades, slides, opacity. **Banned:** bounces, springs, scale-in
  pops, anything that draws attention to itself. Respect `prefers-reduced-motion`
  — disable transitions entirely.

### Interaction states

- **Hover** (desktop / clinician view): primary buttons darken by ~6% (token
  `--brand-deep-teal-blue-hover`); links underline.
- **Press / active:** background darkens a further ~4%; no scale transform.
- **Focus:** a 3px outer ring in `#0B5C6B` at 40% opacity, plus a 2px white
  inner ring for contrast on dark surfaces. Visible on **all** keyboard focus.
- **Disabled:** 40% opacity, no pointer events, ARIA-disabled set.

### Layout rules

- **Mobile-first.** Content sits in a 360–420px column on phones, max 720px on
  tablet/desktop reading views.
- **Sticky chrome.** Bottom navigation is fixed (64px tall). The header is
  static, not sticky — patients scroll to read, not to navigate.
- **One primary action per screen.** Multiple primaries dilute meaning.

### Transparency &amp; blur

Not used. The brand reads better when surfaces are opaque and structural. The
only translucent element is the focus ring.

---

## Iconography

- **System:** [Lucide](https://lucide.dev/) — line icons, 1.5–2px stroke weight,
  clean geometric construction.
- **Loaded via CDN** from `https://unpkg.com/lucide-static`. Substitute the
  closest match if Noted ships its own SVG set — see `assets/icons/` for a
  starter set.
- **Stroke weight:** 1.75px (Lucide default). Don't mix stroke weights across
  the UI.
- **Size:** 20px in nav and body, 24px in buttons and tab bars, 28–32px for
  large feature icons.
- **Colour:** inherits from text colour (`currentColor`). Functional colours
  (improvement green, attention amber, red flag) only when the icon's meaning
  is itself a state.

### What's allowed

- Lucide line icons.
- Simple **line-drawn mood faces** for the feeling selector (5 expressions).
  These live in `assets/icons/mood/`.
- Body-map silhouettes (front + back, gender-neutral) — `assets/body-map/`.

### What's banned

- Emoji in clinical contexts. Never use 🙂😟🥺 to represent symptom severity.
- Filled / "duotone" icon styles that read as decorative.
- AI/tech motifs: sparkles, lightning bolts, gradients, neon.
- Hand-drawn or illustrative icon styles.

---

## Components (summary)

Full specs and live previews are in `preview/`. The components in scope:

1. **Buttons** — Primary (filled teal), Secondary (outlined), Tertiary (text),
   Destructive (red flag). 56px tall for primary actions, 48px standard.
2. **Input fields** — Label above field, 56px tall, 1.5px border, 8px radius,
   clear focus state.
3. **Cards** — White surface, 12px radius, 1px border, no drop shadow.
4. **Status panels** — 4px coloured left border: blue (info), amber (note),
   red (important), green (positive).
5. **Severity slider** — Horizontal, gradient track using the severity scale,
   28px thumb, number displayed prominently above.
6. **Voice input button** — Circular mic, 80px primary placement, pulsing
   border on active recording.
7. **Body map** — Front/back gender-neutral silhouette, tap-to-place markers.
8. **Bottom navigation** — 4 tabs max (Today / Log / Insights / Profile),
   64px tall, icons with labels.
9. **Charts** — Single or dual-series line/bar, brand palette only,
   plain-language summary above each chart.

---

## Accessibility

- **Contrast:** 4.5:1 minimum for body, 7:1 for small text and meta. All
  primary token pairings have been picked to clear AA; key body text pairings
  clear AAA.
- **Tap targets:** 48×48px minimum, 56px preferred for primary actions.
- **Never colour alone.** Status is always carried by icon + text + colour.
- **Dark mode parity.** Same components, same hierarchy.
- **Screen reader labels.** Every interactive element gets a VoiceOver/TalkBack
  label. Decorative elements get `aria-hidden`.
- **Keyboard.** Full tab order, visible focus ring, `Esc` closes modals,
  `Enter`/`Space` activates buttons.
- **Reduced motion.** All transitions disabled under `prefers-reduced-motion`.

---

## Repository Index

```
README.md                       — this file
SKILL.md                        — Agent Skills entry point
colors_and_type.css             — design tokens (light + dark)
assets/
  logo/
    noted-wordmark.svg          — primary lockup
    noted-mark.svg              — standalone mark (icon, favicon)
  icons/mood/                   — 5 line-drawn mood faces
  body-map/                     — front + back gender-neutral silhouettes
preview/                        — one HTML card per design-system primitive
  colors-brand.html, colors-neutrals.html, colors-functional.html,
  colors-severity.html, colors-dark-mode.html
  type-scale.html, type-numerics.html
  spacing-scale.html, radii.html, elevation.html
  components-buttons.html, components-inputs.html, components-cards.html,
  components-status-panels.html, components-severity-slider.html,
  components-voice-button.html, components-bottom-nav.html,
  components-body-map.html, components-chart.html
  brand-logo.html, brand-mood-faces.html, icons-lucide.html
ui_kits/
  mobile/                       — click-through prototype with JSX components
    index.html                  — the working prototype
    App.jsx                     — root, tab routing, toast
    screens/                    — Today, LogEntry, Insights, Profile
    components/                 — Button, Card, Field, StatusPanel,
                                  SeveritySlider, MoodPicker, BodyMap,
                                  AppHeader, BottomNav, SymptomCard,
                                  WeeklyChart, Icons
```

---

## Caveats

- No source code, Figma file, or screenshots were provided. Everything here is
  derived from the written brief, so consider it a v1 reference implementation.
- Inter is loaded from Google Fonts. If Noted ships a different typeface, swap
  it in.
- Lucide is used as the icon set via CDN. If Noted maintains its own SVG icon
  library, replace.
- The body-map silhouette and mood-face icons are simple placeholder
  illustrations that follow the brand rules; if Noted has bespoke versions,
  swap them in.

</design-system-guide>
</attached-skill>

## Assistant

_[tool: list_files]_

_[tool: read_file]_

I'll start by exploring the existing prototype and design system so I build on what's already there.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

A lot of PWA scaffolding already exists. Let me read the key files to understand what's already built versus what I need to add.

_[tool: read_file]_

_[tool: read_file]_

The PWA foundation is solid but uses only local notifications with no backend. Let me read the Profile screen (which has an existing Reminders section), the data layer, and UI components to understand what to build on.

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

Now let me look at the UI component library, the App root (for toast + action handling + where logs live), and confirm the icon assets exist.

_[tool: grep]_

_[tool: grep]_

The architecture is clear. This is a well-built app with PWA scaffolding but local-only notifications. I need to add the server backend, wire real push, and rebuild the Reminders UI. Let me check the available icons before writing the UI.

_[tool: grep]_

_[tool: read_file]_

_[tool: update_todos]_

This is a comprehensive, well-specified engineering task on an existing, well-structured app. No design ambiguity — I'll build on the established Noted DS primitives. Let me lay out the plan and build.Let me build the backend first — package.json, the shared store, and the API endpoints.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now the cron endpoint — the core scheduling logic:

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: update_todos]_

_[tool: write_file]_

Backend complete. Now rewriting `pwa.js` to add VAPID config, server sync, and richer feature detection.

_[tool: str_replace_edit]_

Now the centerpiece — rebuilding the Reminders settings UI. Replacing the existing `RemindersSection` with the full preference editor.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now wire `lastLogDate` and `theme` through `ProfileScreen` → `RemindersSection`, and pass `lastLogDate` from `App.jsx`.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the manifest and service worker copy tweaks.

_[tool: write_file]_

Now the README documenting VAPID keys, env vars, and cron config.

_[tool: str_replace_edit]_

Let me update the older PWA-README push section so it isn't misleading, then verify.

_[tool: update_todos]_

_[tool: show_html]_

_[tool: show_html]_

The app boots straight to Today (session restored). Let me navigate to Profile and enable reminders to verify the new schedule editor renders correctly.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: str_replace_edit]_

_[tool: eval_js]_

A stale service worker is serving the old cached shell — expected, since the app shell changed. I'll bump the cache version (good practice for the real deploy too) and force the preview to refresh.

_[tool: show_html]_

The cache-clear is correctly blocked (shared storage). I'll instead rely on the bumped SW version to self-heal — the new `noted-v2` worker activates and purges old caches on navigation. Let me reload a couple of times to let it take over.

_[tool: eval_js]_

_[tool: eval_js]_

New code is live. Let me navigate to Profile and inspect the Reminders states. First, check the permission state in this preview.

_[tool: eval_js]_

The preview sandbox denies notifications, so I can see the denied/explainer states but not the granted schedule editor. Let me set the app's own pref key and stub the permission getter to render the full editor for verification (preview-only; doesn't affect the real app).

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

The schedule editor renders correctly — master toggle, the local-mode note, quantity segmented control, and time pickers. Let me scroll down to see the remaining time pickers, smart-skip toggle, and test button.

_[tool: save_screenshot]_

_[tool: eval_js]_

The FAB overlaps the time field and the scroll didn't advance — let me target the visible Profile scroll container specifically.

_[tool: save_screenshot]_

_[tool: eval_js]_

html-to-image captures from the top regardless of inner scroll, so I'll verify the lower controls via DOM instead.

_[tool: eval_js]_

All controls verified. Let me confirm the quantity control reshapes the schedule (4 → adds 12:00) and check the time-picker interaction wiring.

_[tool: eval_js]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Found a bug: increasing quantity pads with a duplicate `20:00` instead of inserting the canonical new default (`12:00`). The spec defines exact default sets per count. I'll make quantity changes load that count's sensible defaults directly.

_[tool: eval_js]_

Let me reset the pref key I wrote back to default, then reload twice (the SW serves stale-then-fresh for same-origin) to pick up the fix.

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

Clean (just the standard Babel dev warning). Let me verify the quantity fix now produces the correct default sets.

_[tool: eval_js]_

Quantity defaults match the spec exactly. Let me confirm dark-mode parity on the editor, then capture the denied-permission state.

_[tool: save_screenshot]_

_[tool: eval_js]_

Dark-mode parity is clean — the native time picker, info panel, and segmented control all adapt. The FAB overlap at the bottom edge is the app's existing FAB behavior (transient during scroll). Let me reset the pref key I wrote back to its default-off state so I leave the user's preview clean.

_[tool: delete_file]_

_[tool: snip]_

Let me clean up the temporary verification screenshots and finalize.

_[tool: update_todos]_

I've built the full server-backed reminder push system on top of your existing Noted prototype. Every existing screen and design-system rule is intact; the new work slots into Profile → Reminders and a new `api/` backend.

**What's new**

- **Server-backed Web Push** (`app/api/`): `subscribe`, `unsubscribe`, `test`, and a `send-reminders` cron endpoint that runs every 15 min (`vercel.json` `crons`). It reads each user's saved IANA timezone, fires reminders due in the window, honours smart-skip (checks `lastLogDate`), de-dupes per slot, and deletes expired (404/410) subscriptions. Uses the `web-push` library + VAPID; storage is Vercel KV/Upstash REST with an in-memory fallback.
- **Reminders UI** (Profile → Reminders): master toggle, quantity 1–4 (with the exact default sets — 8pm / 9am+8pm / +2pm / +12pm), per-reminder native time pickers, smart-skip toggle, an explainer-before-asking card with tap-triggered **Allow notifications**, calm denied-state instructions, an iOS **Add to Home Screen** walkthrough (Share → Add → open), Android install suggestion, and a **Send a test notification** button that fires a real end-to-end push. Light + dark parity, ≥48px targets, NHS-tone copy. Changes sync to the server immediately.
- **PWA glue** (`pwa.js`): VAPID config, feature detection (`PushManager`, iOS-Safari vs other iOS browsers, standalone), prefs sync, graceful degradation when no backend is configured (local-mode note shown).
- **README** (`app/README.md`): VAPID key generation, exact env vars, KV setup, and cron config — deploy with no guesswork.

**One thing to know:** the in-editor preview blocks notifications and has no backend, so it correctly shows the local/explainer states. Real push only works once deployed to Vercel over HTTPS with the VAPID keys set (per the README). To go live you need to paste your public key into `pwa.js`, set the env vars, and add a KV store; 15-min cron requires Vercel Pro.

