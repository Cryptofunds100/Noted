# Noted — saving users & entries with Supabase

Noted stores each user's **profile** (their information) and their **entries**
(symptom logs, daily check-ins, PROM results) under their login. It works in two
modes, chosen automatically:

| Mode | When | Where data lives |
|---|---|---|
| **In-browser store** (default) | `supabase-config.js` is blank | `localStorage` on the device — accounts, profile and entries all persist locally, no backend needed |
| **Supabase** | you fill in `supabase-config.js` | your Supabase project — data follows the user across devices |

The app is fully usable in either mode; flipping to Supabase needs no code
changes, just credentials.

## Enable real cloud sync

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Create the tables.** Open the project's **SQL editor**, paste the contents
   of [`supabase-schema.sql`](supabase-schema.sql), and run it. This creates the
   `profiles` and `entries` tables with **row-level security** so each user can
   only ever touch their own rows.
3. **Add your credentials.** In **Settings → API**, copy the **Project URL** and
   the **anon public** key into [`supabase-config.js`](supabase-config.js):

   ```js
   window.NOTED_SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
   window.NOTED_SUPABASE_ANON_KEY = 'eyJhbGci...';   // the anon public key
   ```

   Both are safe in the client — the anon key is meant to be public; RLS is what
   protects the data.
4. **Turn email confirmation OFF.** Onboarding signs the user in immediately
   after sign-up, so it expects Supabase to return a session right away. Under
   **Authentication → Providers → Email**, switch **"Confirm email" OFF**. If
   it's left on, Supabase withholds the session until the user clicks an emailed
   link — sign-up will appear to work but nothing will save (row-level security
   needs an authenticated session), and the account won't persist on reload.

   > If you later decide you *do* want email verification, it should move back
   > into onboarding as a dedicated "check your email" step rather than being
   > left half-on — ask and it can be re-added.

## How it maps to the code

- [`auth.jsx`](auth.jsx) exposes `window.NotedAuth` with `signUp`, `signIn`,
  `signOut`, `getSession`, `saveProfile`, and `listEntries` / `saveEntry` /
  `deleteEntry`. It picks the Supabase backend when configured, else the
  in-browser one — same interface either way.
- [`App.jsx`](App.jsx) loads the user's entries on login, persists every new log
  / check-in / PROM via `saveEntry`, and debounce-syncs profile edits via
  `saveProfile`.
- [`screen-onboarding.jsx`](screen-onboarding.jsx) calls `signUp` / `signIn` and
  saves the collected profile.

## Data model

`profiles` is one row per user (name, age, gender, conditions, medications,
allergies, note). `entries` keeps the full client entry object in a `jsonb`
`payload`, with `kind` (`log` / `checkin` / `prom`) and `logged_at` promoted to
columns for filtering and ordering. The primary key `(user_id, id)` lets the
client's own entry id upsert cleanly.

> Like the rest of Noted, this is self-reported data. If you take it to
> production, complete a DPIA and review retention, encryption and access
> controls for UK GDPR / NHS DSP Toolkit expectations before storing real
> patient data.
