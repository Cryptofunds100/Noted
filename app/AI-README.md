# Noted — AI features (Claude / Anthropic)

Four features are powered by Claude, all running **server-side** so the API key
never reaches the browser:

| Feature | Endpoint | What it does |
|---|---|---|
| Pattern detection (Insights) | `POST /api/insights` | Finds observations across the patient's real logs — never diagnoses |
| Clinical report | `POST /api/report` | Writes the report's summary + patterns + adherence note from real logs |
| Voice → structured entry | `POST /api/voice-parse` | Turns a spoken transcript into reviewable symptom fields |
| Document OCR | `POST /api/doc-extract` | Reads a photo/PDF of a letter or prescription into profile fields |

Each endpoint goes through [`api/_anthropic.js`](api/_anthropic.js), which holds
the model choice (`claude-opus-4-8`), a shared clinical-safety system prompt
(observations not diagnoses, plain English, never invent data), and a
forced-tool-use helper that guarantees structured JSON back.

## Setup

1. **Add the key as an environment variable** in Vercel
   (Project → Settings → Environment Variables):

   ```
   ANTHROPIC_API_KEY = sk-ant-...
   ```

   Optionally `ANTHROPIC_MODEL` to override the default `claude-opus-4-8`.

   > **Never** put this key in client code or commit it — it grants full billing
   > access. It lives only in the server env. (Unlike the Supabase *anon* key,
   > which is designed to be public.)

2. **Deploy.** `@anthropic-ai/sdk` is in [`package.json`](package.json); Vercel
   installs it. The AI endpoints have a 30–60s `maxDuration` in
   [`vercel.json`](vercel.json) — function durations over 10s need a Vercel
   **Pro** plan.

## Behaviour without a key

The client helper [`noted-ai.js`](noted-ai.js) calls these endpoints; if the key
isn't configured (or the app is served statically), every call rejects and each
screen falls back to its built-in demo content. The prototype stays fully usable
either way.

## Privacy notes

- Voice: only the **text** transcript is sent to be structured — never the audio.
- Documents: the image/PDF is sent to extract fields; nothing is saved until the
  patient confirms it on the review screen.
- This is self-reported data. Before storing real patient data or running this in
  production, complete a DPIA and review UK GDPR / clinical-safety (DCB0129)
  obligations — and note that symptom text is sent to Anthropic for processing.
