# Claude Design Build Prompt — Noted App (Full Product Prototype)

> **How to use this file.** Paste everything inside the `=== BUILD PROMPT ===` block into Claude Design as a single message. The design system is embedded as CSS custom properties so it travels cleanly into follow-up chats. Resolve the **⚑ ASSUMPTION** flags (collected at the end of this file) before or during the build — each one is a decision I inferred and you may want to change.
>
> **Scope:** maximal. Onboarding → Today → full symptom-log flow → Insights → PROMs → allied-health professional report views → document-upload OCR → voice input → one-page clinical report → Profile with granular sharing controls.
>
> **Default output:** an interactive web/React prototype that demonstrates the iOS app's screens and flows (clickable, navigable, light + dark mode). It is a high-fidelity demo, not production iOS code. See **⚑ ASSUMPTION 1** if you want a different target.

---

=== BUILD PROMPT ===

## Role

You are a senior product designer building a high-fidelity, interactive prototype of **Noted**, a UK patient-facing symptom journal and health-tracking app. Build it as a navigable React prototype that faithfully demonstrates the iOS app's screens, flows, and interactions. Treat this as a clinical product, not a wellness app — every design choice should signal trustworthiness and clinical credibility through restraint.

## What Noted is

Patients managing chronic and acute conditions log their symptoms in under 30 seconds, and Noted turns those logs into a structured one-page summary their clinician can read in under a minute. The core promise: patients often forget detail and timeline in a 10-minute consult; Noted captures symptom, location, frequency, severity, pattern and context as it happens, so the clinician sees the real picture. Audience: UK patients aged 25–75 and their clinicians (GPs, physios, dietitians, psychologists, OTs).

Positioning is load-bearing: **a medical tool, not a wellness app.** Calm over clever. Clinical credibility through restraint.

---

## Design system (canonical — implement exactly)

Use these CSS custom properties as the single source of truth. Define both themes; dark mode is full parity and non-negotiable.

```css
:root {
  /* Brand */
  --color-primary: #0B5C6B;        /* deep teal-blue — trust, distinct from NHS blue #005EB8 */
  --color-primary-hover: #094C59;
  --color-primary-tint: #E6F0F2;   /* light fill for selected/active states */

  /* Surfaces & text (light) */
  --color-bg: #F8F7F4;             /* warm white — never pure white; easier at 3am */
  --color-surface: #FFFFFF;
  --color-surface-alt: #F1EFEA;
  --color-border: #E2DFD8;
  --color-text: #1F2937;           /* charcoal — never pure black */
  --color-text-muted: #5B6470;

  /* Severity scale — 5 steps, soft green → muted red. NEVER bright traffic-light red. */
  --sev-1: #7Fae8f;  /* mild  */
  --sev-2: #B7C08A;
  --sev-3: #E2C879;  /* moderate */
  --sev-4: #D79A6B;
  --sev-5: #C0746B;  /* severe — muted, not alarming */

  /* Functional */
  --color-flag: #B4533F;           /* red-flag / urgent indicator (used sparingly) */
  --color-success: #2F6E4F;
  --color-info: var(--color-primary);

  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-body: 17px;          /* minimum body size */
  --line-height-body: 1.5;
  --font-size-small: 15px;         /* never below this for readable text */

  /* Geometry */
  --radius: 12px;
  --tap-target-min: 48px;          /* 48–56px minimum on every interactive element */
  --elevation: 0 1px 2px rgba(31,41,55,0.06); /* subtle elevation only */
}

:root[data-theme="dark"] {
  --color-bg: #11161A;
  --color-surface: #1A2127;
  --color-surface-alt: #222B32;
  --color-border: #303B43;
  --color-text: #ECEFF2;
  --color-text-muted: #9AA6B0;
  --color-primary: #4FB3C4;        /* lifted for contrast on dark */
  --color-primary-hover: #6AC2D1;
  --color-primary-tint: #14323A;
  /* Severity steps lifted for dark-mode contrast: */
  --sev-1: #6FA382; --sev-2: #A6B47C; --sev-3: #D8BE71; --sev-4: #CE8F63; --sev-5: #C56F66;
  --color-elevation: 0 1px 2px rgba(0,0,0,0.4);
}
```
> ⚑ ASSUMPTION 2 — MEMORY.md fixes the light-mode brand colours and "soft green → muted red" severity direction but not exact severity hexes or the dark palette. The values above are my proposal. Confirm or replace.

**Typography:** Inter throughout. Body 17px / 1.5 line height minimum. Clear type scale, generous line length limits for readability. No decorative fonts.

**Layout & components:** bottom tab bar (see navigation). Cards on `--color-surface` over `--color-bg`. Subtle elevation only. Rounded corners `--radius`. Tap targets 48–56px minimum everywhere. Forms are large, legible, and forgiving.

**Accessibility (treat as acceptance criteria, not nice-to-have):**
- WCAG 2.2 AA minimum across the app; AAA contrast for body text.
- Every interactive element ≥48px and keyboard/screen-reader reachable with sensible labels.
- Never encode meaning in colour alone — severity always carries a number/label too.
- Respect reduced-motion; animation is functional, never decorative.
- Full dark-mode parity.

**Forbidden — do not use any of these:**
gradients, glassmorphism, gamification (streaks, badges, points, confetti), stock photography, the sage-green "wellness app" aesthetic, emoji in clinical contexts, drop shadows beyond subtle elevation, bright traffic-light red for severity.

---

## Voice & copy rules

- Patient-facing copy at **NHS reading age 9–11.** Plain English. Test every sentence against "would a tired 70-year-old understand this?"
- Calm, respectful, never patronising. No "don't worry," no cheerfulness, no hype.
- Clinical terms used correctly where they appear (SNOMED CT symptom names, validated PROM acronyms).
- **Never invent statistics, testimonials, study results, or NHS endorsements.** Any sample data in the prototype must be clearly fictional demo data for a sample patient — never presented as a real outcome or real adoption number.

---

## Information architecture

**Bottom navigation — exactly 4 tabs:** `Today` · `Log` · `Insights` · `Profile`.
**Persistent floating action: "Log symptom"** available from every tab.

Flows that sit outside the tabs: first-run **Onboarding**, the **Clinical report** (generated/shared view), the **Document upload** flow, and a **Clinician view** toggle used to demonstrate the professional-specific report views.

> ⚑ ASSUMPTION 3 — The allied-health PROM report views are clinician-facing. To demonstrate them in one prototype, include a discreet "View as clinician" toggle (e.g. in Profile or the report screen) that switches the report into physio / dietitian / psychologist layouts. If you'd rather these live in a separate clinician app, tell me and I'll split the prompt.

---

## Screen-by-screen specification

### 1. Onboarding — progressive profiling, 2 minutes maximum
Goal: get the patient to their first log fast. Do **not** present a wall of medical questions.

- Warm, plain-English welcome. One clear line on what Noted does and the "self-reported, not clinically verified" framing.
- Minimal first-run fields only: age, sex assigned at birth, current sex/gender, top 3 ongoing conditions, current medications, allergies, and one free-text "anything else."
- **Document upload presented as the headline option** (the killer feature): "Have a letter, prescription, or discharge summary? Add a photo or PDF and we'll fill in your profile for you." (Links to the Document-upload flow, section 8.)
- Everything else is deferred and filled in over time via progressive prompts. Show that deferral explicitly ("You can add the rest later").
- Persistent, quiet **"Self-reported — not clinically verified"** reassurance.

### 2. Today — the home dashboard
The default landing tab. Calm, scannable, answers "what does today look like and what do I need to do?"

- Greeting + date. Sample patient persona (clearly demo data).
- Quick prompt to log today's symptoms / how things are. Big, obvious entry point.
- **Daily background variables** as a light once-daily check-in card: sleep (hours + quality), hydration, appetite, bowel movements (Bristol Stool Chart), medications taken with adherence, exercise/activity, menstrual cycle day where relevant. Use smart defaults — pre-populate from previous entries.
- **Passive data first:** show sleep / activity / heart rate as already pulled from a wearable (HealthKit-style) rather than asked — present these as auto-filled.
- Any due PROM surfaced gently here (e.g. "Your fortnightly mood check-in is ready").
- If a logged symptom matched a red-flag rule, a calm, non-alarming **safety prompt** appears here (see Clinical safety).

### 3. Log — the <30-second symptom log (compliance-critical)
This is the most important flow in the product. If it takes longer than ~30 seconds, compliance collapses. Make it fast, forgiving, and front-load the common path.

**Core fields (per log):**
- Symptom name — SNOMED CT-aligned controlled list with search + free-text fallback.
- Severity — 0–10 numeric, paired with the 5-step severity colour scale (colour + number, never colour alone).
- Onset & duration.
- Location — interactive **body map** (front/back, tap a region; not a dropdown).
- Character — sharp / dull / throbbing / burning / cramping / etc.
- Automatic timestamp (shown, editable).

**Context (optional, one tap to expand — don't force it):**
triggers, relieving factors, associated symptoms, activity at onset, mood/stress 1–5.

**Speed mechanics:**
- Smart defaults pre-populated from the patient's previous entries.
- Voice entry available for symptom description (see section 7).
- Clear "Save" that confirms in well under 30 seconds for the common path; advanced/context fields never block saving.

### 4. Insights — patterns, trends, and PROMs over time
The patient's longitudinal view. Calm visualisation, honest framing.

- **Symptom frequency / pattern** over time.
- **Severity trends** using the severity scale.
- **Suggested patterns** — e.g. "logged more often after poor sleep" — **explicitly labelled as observations, not diagnoses.** This labelling is mandatory and must be visible, not buried.
- **Red-flag log** — a record of any urgent-symptom prompts triggered.
- **Medication adherence** summary.
- **Functional impact** tracking (work / exercise / social / sleep impact).
- PROM scores plotted over time with their proper names (see section 5).
- No invented numbers — all values are clearly demo data.

### 5. PROMs — validated outcome measures on sensible cadence
Implement these as clean, accessible questionnaire flows, surfaced when due (not constantly nagging):
- **PHQ-9** (depression) — fortnightly.
- **GAD-7** (anxiety) — fortnightly.
- **IBS-SSS** (IBS symptom severity) — monthly.
- **PEG-3** (pain intensity + interference) — for pain/functional tracking.
- Each scored and added to Insights and the clinical report. Patient-set **goals with progress tracking** alongside.
> ⚑ ASSUMPTION 4 — Cadences (PHQ-9/GAD-7 fortnightly, IBS-SSS monthly) are taken from MEMORY.md. PEG-3 cadence isn't specified there; I've left it tied to active pain tracking rather than a fixed interval. Confirm.

### 6. Allied-health professional report views (clinician-facing)
Reached via the "View as clinician" toggle (⚑ ASSUMPTION 3). Same underlying data, **profession-specific emphasis**:
- **Physio** — movement / function emphasis: functional impact, PEG-3 pain interference, activity, goals/progress.
- **Dietitian** — food triggers, bowel patterns (Bristol Stool Chart), hydration, appetite, IBS-SSS.
- **Psychologist** — mood/stress emphasis, PHQ-9 / GAD-7 trends, sleep, stress triggers.
Each view leads with what that professional needs in their consult window.

### 7. Voice input — placement matters
Voice is a fast-entry aid for specific contexts only.
- **Enable voice for:** symptom description on entry, end-of-day free-text journal, flare-up logging, medication/meal logging, consultation-prep notes.
- **Do NOT offer voice for:** severity sliders, body maps, yes/no questions, passive wearable data, or anything used in a public setting.
- **Mandatory pattern:** after speech, always show the **parsed structured output for review and correction before saving** — never silently commit a transcription. Show an on-device processing indicator and a visible **"delete audio after transcription"** control.

### 8. Document upload — OCR + extraction (the killer onboarding feature)
- Accept PDFs, photos of letters, repeat prescriptions, discharge summaries.
- Show an OCR + extraction step, then a **review screen** where extracted fields (conditions, medications, allergies) are presented for the patient to confirm or edit before anything is saved to their profile.
- Reinforce "Self-reported — not clinically verified" on the result.

### 9. Clinical report — one page, readable in under 60 seconds
The output that makes Noted valuable to clinicians. Structured like a clinical letter.
- **Patient summary at top:** demographics, active conditions, current medications, allergies, relevant PMH.
- Then: symptom frequency/pattern summary, severity trends, **suggested patterns (clearly marked "not diagnoses")**, **red-flag log**, medication adherence.
- **SNOMED CT mapping in the footer.**
- **Disclaimer: "Self-reported — clinical verification required."**
- Two formats: the in-app longitudinal view **and** a clean **printable / shareable PDF** layout. Show both.
- A11y and print legibility both matter here.

### 10. Profile — data ownership and granular sharing
- Patient profile, conditions, meds, allergies (progressively built).
- **Patient-owned data:** clear export and share controls; surface NHS App / GP Connect integration as the long-term gold standard (can be shown as "coming"/connect state).
- **Granular sharing controls per professional type** for sensitive history (mental health, sexual health, terminations, substance use): the patient decides what each professional type can see. Make this explicit and easy.
- Theme toggle (light/dark), accessibility settings, "delete audio" and data-deletion controls.

---

## Clinical safety (overrides product elegance — do not skip)

- **Red-flag detection:** if a logged symptom matches an urgent pattern (e.g. sudden severe "thunderclap" headache, chest pain, suicidal ideation, paediatric warning signs), surface a **calm, clear safety prompt** directing the patient to appropriate urgent care. Never alarmist, never minimising. Log it to the red-flag record.
- A persistent, visible **urgent-symptoms safety line** (e.g. "If this is an emergency, call 999 / 111") where clinically appropriate.
- **Never diagnose.** Surface patterns and observations only, always labelled as such. Diagnosis claims are an MHRA risk and are out of bounds.
- **"Self-reported — not clinically verified"** appears wherever clinical data is captured or reported.

---

## Prototype / interaction requirements

- Fully clickable: all four tabs, the full log flow, onboarding, document upload, a PROM, the clinician-view report, and the printable report should be reachable and navigable.
- Seed with one **clearly-fictional sample patient** and realistic-but-obviously-demo logs so the screens feel alive. Label demo data as such; invent no real statistics, outcomes, or endorsements.
- Light + dark mode both fully implemented and toggleable.
- Smooth, functional transitions; respect reduced-motion.
- Build it mobile-first at iPhone dimensions; the prototype should read as an iOS app.

---

## Deliberately reject (do not add, even if it seems helpful)

Gamification of any kind · wellness-app aesthetic · diagnosis or triage claims · bright traffic-light red severity · pure-white backgrounds · invented stats or testimonials · emoji in clinical contexts · download/app-store CTAs.

=== END BUILD PROMPT ===

---

## ⚑ Assumption flags — resolve these (collected)

1. **Output target.** I've assumed an interactive **web/React prototype that simulates the iOS app**, because that's what Claude Design builds well and it's the fastest way to see and test the product. If you want native iOS handoff specs (Swift/SwiftUI structure, exact iOS components) or a Figma-style static spec instead, that's a different deliverable — say so and I'll re-cut the prompt.
2. **Dark palette + severity hexes.** MEMORY.md fixes the light-mode brand colours and the "soft green → muted red" direction, but not exact severity values or the dark theme. I proposed both in the CSS block — confirm or replace.
3. **Clinician views in one app.** I bundled the allied-health professional report views into this prototype behind a "View as clinician" toggle. If clinician-facing screens should be a separate app/prompt, I'll split them out.
4. **PEG-3 cadence.** MEMORY.md specifies PHQ-9/GAD-7 fortnightly and IBS-SSS monthly; it doesn't pin a PEG-3 interval, so I tied it to active pain tracking. Confirm the cadence you want.
5. **Single mega-prompt vs. your usual two-prompt pattern.** You normally prefer a design-system prompt + a build prompt. Because the design system is already codified in MEMORY.md, I embedded a compact version at the top of one build prompt instead. If you'd rather keep the established two-message pattern (prime the design system first, then request the build), I'll split this into Prompt 1 / Prompt 2.
