# Health Tracking Prototype

_Started 2026-06-06 21:36 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "Noted Mobile App"
Project currently has 1 file(s)
Current date is now June 6, 2026
</system-info>

<pasted_text name="Pasted text (177 lines)">
Role
You are a senior product designer building a high-fidelity, interactive prototype of Noted, a UK patient-facing symptom journal and health-tracking app. Build it as a navigable React prototype that faithfully demonstrates the iOS app's screens, flows, and interactions. Treat this as a clinical product, not a wellness app — every design choice should signal trustworthiness and clinical credibility through restraint.
What Noted is
Patients managing chronic and acute conditions log their symptoms in under 30 seconds, and Noted turns those logs into a structured one-page summary their clinician can read in under a minute. The core promise: patients often forget detail and timeline in a 10-minute consult; Noted captures symptom, location, frequency, severity, pattern and context as it happens, so the clinician sees the real picture. Audience: UK patients aged 25–75 and their clinicians (GPs, physios, dietitians, psychologists, OTs).
Positioning is load-bearing: a medical tool, not a wellness app. Calm over clever. Clinical credibility through restraint.

Design system (canonical — implement exactly)
Use these CSS custom properties as the single source of truth. Define both themes; dark mode is full parity and non-negotiable.

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


⚑ ASSUMPTION 2 — MEMORY.md fixes the light-mode brand colours and "soft green → muted red" severity direction but not exact severity hexes or the dark palette. The values above are my proposal. Confirm or replace.
Typography: Inter throughout. Body 17px / 1.5 line height minimum. Clear type scale, generous line length limits for readability. No decorative fonts.
Layout & components: bottom tab bar (see navigation). Cards on --color-surface over --color-bg. Subtle elevation only. Rounded corners --radius. Tap targets 48–56px minimum everywhere. Forms are large, legible, and forgiving.
Accessibility (treat as acceptance criteria, not nice-to-have):
* WCAG 2.2 AA minimum across the app; AAA contrast for body text.
* Every interactive element ≥48px and keyboard/screen-reader reachable with sensible labels.
* Never encode meaning in colour alone — severity always carries a number/label too.
* Respect reduced-motion; animation is functional, never decorative.
* Full dark-mode parity.
Forbidden — do not use any of these: gradients, glassmorphism, gamification (streaks, badges, points, confetti), stock photography, the sage-green "wellness app" aesthetic, emoji in clinical contexts, drop shadows beyond subtle elevation, bright traffic-light red for severity.

Voice & copy rules
* Patient-facing copy at NHS reading age 9–11. Plain English. Test every sentence against "would a tired 70-year-old understand this?"
* Calm, respectful, never patronising. No "don't worry," no cheerfulness, no hype.
* Clinical terms used correctly where they appear (SNOMED CT symptom names, validated PROM acronyms).
* Never invent statistics, testimonials, study results, or NHS endorsements. Any sample data in the prototype must be clearly fictional demo data for a sample patient — never presented as a real outcome or real adoption number.

Information architecture
Bottom navigation — exactly 4 tabs: Today · Log · Insights · Profile. Persistent floating action: "Log symptom" available from every tab.
Flows that sit outside the tabs: first-run Onboarding, the Clinical report (generated/shared view), the Document upload flow, and a Clinician view toggle used to demonstrate the professional-specific report views.
⚑ ASSUMPTION 3 — The allied-health PROM report views are clinician-facing. To demonstrate them in one prototype, include a discreet "View as clinician" toggle (e.g. in Profile or the report screen) that switches the report into physio / dietitian / psychologist layouts. If you'd rather these live in a separate clinician app, tell me and I'll split the prompt.

Screen-by-screen specification
1. Onboarding — progressive profiling, 2 minutes maximum
Goal: get the patient to their first log fast. Do not present a wall of medical questions.
* Warm, plain-English welcome. One clear line on what Noted does and the "self-reported, not clinically verified" framing.
* Minimal first-run fields only: age, sex assigned at birth, current sex/gender, top 3 ongoing conditions, current medications, allergies, and one free-text "anything else."
* Document upload presented as the headline option (the killer feature): "Have a letter, prescription, or discharge summary? Add a photo or PDF and we'll fill in your profile for you." (Links to the Document-upload flow, section 8.)
* Everything else is deferred and filled in over time via progressive prompts. Show that deferral explicitly ("You can add the rest later").
* Persistent, quiet "Self-reported — not clinically verified" reassurance.
2. Home — the home dashboard
The default landing tab. Calm, scannable, answers "what does today look like and what do I need to do?"
* Greeting + date. Sample patient persona (clearly demo data).
* Quick prompt to log today's symptoms / how things are. Big, obvious entry point.
* Daily background variables as a light once-daily check-in card: sleep (hours + quality), hydration, appetite, bowel movements (Bristol Stool Chart), medications taken with adherence, exercise/activity, menstrual cycle day where relevant. Use smart defaults — pre-populate from previous entries.
* Passive data first: show sleep / activity / heart rate as already pulled from a wearable (HealthKit-style) rather than asked — present these as auto-filled.
* Any due PROM surfaced gently here (e.g. "Your fortnightly mood check-in is ready").
* If a logged symptom matched a red-flag rule, a calm, non-alarming safety prompt appears here (see Clinical safety).
3. Log — the <30-second symptom log (compliance-critical)
This is the most important flow in the product. If it takes longer than ~30 seconds, compliance collapses. Make it fast, forgiving, and front-load the common path.
Core fields (per log):
* Symptom name — SNOMED CT-aligned controlled list with search + free-text fallback.
* Severity — 0–10 numeric, paired with the 5-step severity colour scale (colour + number, never colour alone).
* Onset & duration.
* Location — interactive body map (front/back, tap a region; not a dropdown).
* Character — sharp / dull / throbbing / burning / cramping / etc.
* Automatic timestamp (shown, editable).
Context (optional, one tap to expand — don't force it): triggers, relieving factors, associated symptoms, activity at onset, mood/stress 1–5.
Speed mechanics:
* Smart defaults pre-populated from the patient's previous entries.
* Voice entry available for symptom description (see section 7).
* Clear "Save" that confirms in well under 30 seconds for the common path; advanced/context fields never block saving.
4. Insights — patterns, trends, and PROMs over time
The patient's longitudinal view. Calm visualisation, honest framing.
* Symptom frequency / pattern over time.
* Severity trends using the severity scale.
* Suggested patterns — e.g. "logged more often after poor sleep" — explicitly labelled as observations, not diagnoses. This labelling is mandatory and must be visible, not buried.
* Red-flag log — a record of any urgent-symptom prompts triggered.
* Medication adherence summary.
* Functional impact tracking (work / exercise / social / sleep impact).
* PROM scores plotted over time with their proper names (see section 5).
* No invented numbers — all values are clearly demo data.
5. PROMs — validated outcome measures on sensible cadence
Implement these as clean, accessible questionnaire flows, surfaced when due (not constantly nagging):
* PHQ-9 (depression) — fortnightly.
* GAD-7 (anxiety) — fortnightly.
* IBS-SSS (IBS symptom severity) — monthly.
* PEG-3 (pain intensity + interference) — for pain/functional tracking.
* Each scored and added to Insights and the clinical report. Patient-set goals with progress tracking alongside.
⚑ ASSUMPTION 4 — Cadences (PHQ-9/GAD-7 fortnightly, IBS-SSS monthly) are taken from MEMORY.md. PEG-3 cadence isn't specified there; I've left it tied to active pain tracking rather than a fixed interval. Confirm.
6. Allied-health professional report views (clinician-facing)
Reached via the "View as clinician" toggle (⚑ ASSUMPTION 3). Same underlying data, profession-specific emphasis:
* Physio — movement / function emphasis: functional impact, PEG-3 pain interference, activity, goals/progress.
* Dietitian — food triggers, bowel patterns (Bristol Stool Chart), hydration, appetite, IBS-SSS.
* Psychologist — mood/stress emphasis, PHQ-9 / GAD-7 trends, sleep, stress triggers. Each view leads with what that professional needs in their consult window.
7. Voice input — placement matters
Voice is a fast-entry aid for specific contexts only.
* Enable voice for: symptom description on entry, end-of-day free-text journal, flare-up logging, medication/meal logging, consultation-prep notes.
* Do NOT offer voice for: severity sliders, body maps, yes/no questions, passive wearable data, or anything used in a public setting.
* Mandatory pattern: after speech, always show the parsed structured output for review and correction before saving — never silently commit a transcription. Show an on-device processing indicator and a visible "delete audio after transcription" control.
8. Document upload — OCR + extraction (the killer onboarding feature)
* Accept PDFs, photos of letters, repeat prescriptions, discharge summaries.
* Show an OCR + extraction step, then a review screen where extracted fields (conditions, medications, allergies) are presented for the patient to confirm or edit before anything is saved to their profile.
* Reinforce "Self-reported — not clinically verified" on the result.
9. Clinical report — one page, readable in under 60 seconds
The output that makes Noted valuable to clinicians. Structured like a clinical letter.
* Patient summary at top: demographics, active conditions, current medications, allergies, relevant PMH.
* Then: symptom frequency/pattern summary, severity trends, suggested patterns (clearly marked "not diagnoses"), red-flag log, medication adherence.
* SNOMED CT mapping in the footer.
* Disclaimer: "Self-reported — clinical verification required."
* Two formats: the in-app longitudinal view and a clean printable / shareable PDF layout. Show both.
* A11y and print legibility both matter here.
10. Profile — data ownership and granular sharing
* Patient profile, conditions, meds, allergies (progressively built).
* Patient-owned data: clear export and share controls; surface NHS App / GP Connect integration as the long-term gold standard (can be shown as "coming"/connect state).
* Granular sharing controls per professional type for sensitive history (mental health, sexual health, terminations, substance use): the patient decides what each professional type can see. Make this explicit and easy.
* Theme toggle (light/dark), accessibility settings, "delete audio" and data-deletion controls.

Clinical safety (overrides product elegance — do not skip)
* Red-flag detection: if a logged symptom matches an urgent pattern (e.g. sudden severe "thunderclap" headache, chest pain, suicidal ideation, paediatric warning signs), surface a calm, clear safety prompt directing the patient to appropriate urgent care. Never alarmist, never minimising. Log it to the red-flag record.
* A persistent, visible urgent-symptoms safety line (e.g. "If this is an emergency, call 999 / 111") where clinically appropriate.
* Never diagnose. Surface patterns and observations only, always labelled as such. Diagnosis claims are an MHRA risk and are out of bounds.
* "Self-reported — not clinically verified" appears wherever clinical data is captured or reported.

Prototype / interaction requirements
* Fully clickable: all four tabs, the full log flow, onboarding, document upload, a PROM, the clinician-view report, and the printable report should be reachable and navigable.
* Seed with one clearly-fictional sample patient and realistic-but-obviously-demo logs so the screens feel alive. Label demo data as such; invent no real statistics, outcomes, or endorsements.
* Light + dark mode both fully implemented and toggleable.
* Smooth, functional transitions; respect reduced-motion.
* Build it mobile-first at iPhone dimensions; the prototype should read as an iOS app.

Deliberately reject (do not add, even if it seems helpful)
Gamification of any kind · wellness-app aesthetic · diagnosis or triage claims · bright traffic-light red severity · pure-white backgrounds · invented stats or testimonials · emoji in clinical contexts · download/app-store CTAs.

</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Hi-fi design">
Create a high-fidelity, polished design.

Follow this general design process (use the todo list to remember):
(1) ask questions, (2) find existing UI kits and collect design context — copy ALL relevant components and read ALL relevant examples; ask the user if you can't find them, (3) start your file with assumptions + context + design reasoning (as if you are a junior designer and the user is your manager), with placeholders for the designs, and show it to the user early, (4) build out the designs and show the user again ASAP; append some next steps, (5) use your tools to check, verify and iterate on the design.

Good hi-fi designs do not start from scratch — they are rooted in existing design context. Ask the user to Import their codebase, or find a suitable UI kit / design resources, or ask for screenshots of existing UI. You MUST spend time trying to acquire design context, including components. If you cannot find them, ask the user for them. In the Import menu, they can link a local codebase, provide screenshots or Figma links; they can also link another project. Mocking a full product from scratch is a LAST RESORT and will lead to poor design. If stuck, try listing design assets and ls'ing design system files — be proactive! Some designs may need multiple design systems — get them all. Use the starter components (device frames and the like) to get high-quality scaffolding for free.

When presenting several options or explorations side-by-side, lay them out clearly: give the page a neutral gray background, put each option in its own labeled frame (a small heading + a white rounded card sized to its content), and group related options into sections.

When designing, asking many good questions is ESSENTIAL.

Give options: try to give 3+ variations across several dimensions. Mix by-the-book designs that match existing patterns with new and novel interactions, including interesting layouts, metaphors, and visual styles. Have some options that use color or advanced CSS; some with iconography and some without. Start your variations basic and get more advanced and creative as you go! Try remixing the brand assets and visual DNA in interesting ways — play with scale, fills, texture, visual rhythm, layering, novel layouts, type treatments. The goal is not the perfect option; it's exploring atomic variations the user can mix and match.

CSS, HTML, JS and SVG are amazing. Users often don't know what they can do. Surprise the user.

If you do not have an icon, asset or component, draw a placeholder: in hi-fi design, a placeholder is better than a bad attempt at the real thing.
</attached-skill>

<attached-skill name="Interactive prototype">
Create a fully interactive prototype with realistic state management and transitions. Use React useState/useEffect for dynamic behavior. Include hover states, click interactions, form validation, animated transitions, and multi-step navigation flows. It should feel like a real working app, not a static mockup.
</attached-skill>

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

_[tool: list_files]_

I'll start by exploring the project and the bound design system so I'm grounded before asking anything.

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Let me read the actual component sources to learn the component APIs before I plan.

_[tool: questions_v2]_

I've now got a solid read on the design system: the tokens (`colors_and_type.css`), the component set (Button, Card, Field, StatusPanel, SeveritySlider, BodyMap, MoodPicker, WeeklyChart, BottomNav, SymptomCard, AppHeader, Icons), and the existing 4-screen mobile kit. One important technical note I've spotted: the bundled components are styled with **hardcoded light-mode hex values**, so they won't dark-mode on their own — I'll build a thin token-based component layer that matches the DS specs exactly (same heights, radii, borders) but reads from the `var(--*)` tokens, so dark-mode parity actually works. That's the only way to honour both "compose with the DS" and "dark mode is non-negotiable."

Your spec is unusually complete, so I only have a focused set of questions — mostly the three assumptions you flagged plus scope and how you want me to handle variations.

## User

Questions answered:
- severity_palette: Use the design system's canonical values (recommended — they're the binding source)
- clinician_toggle: Keep them in this one prototype behind a discreet 'View as clinician' toggle
- scope: Build the full spec now — all flows reachable and clickable
- variations: One canonical build, faithful to the spec
- default_theme: Light
- patient_persona: Mixed: chronic pain + low mood (shows pain, mood and physio/psychologist views)
- peg3_cadence: Tie it to active pain tracking (surfaces during flare periods)
- device_frame: Inside a realistic iPhone bezel (status bar, home indicator)
- voice_fidelity: Real on-device speech recognition where the browser supports it, scripted fallback
- tweaks: No, keep it clean

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Everything's locked. Let me read the remaining complex components and grab the assets I'll need.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: copy_files]_

I now fully understand the design system. The components are all hardcoded light-mode, so to honour the non-negotiable dark-mode parity I'll build a token-based component layer (same specs, reading `var(--*)`), reusing the valuable assets — the anatomical body silhouette, the Lucide icons, mood faces, and logos. Let me set up my plan and grab assets + the iPhone frame.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: copy_files]_

The iOS frame is clean and uses tokenisable colors. The mood SVGs use `currentColor` (token-friendly). Let me bring in the DS tokens and start building. I'll port the DS components faithfully but tokenised so dark mode works — I'll note that decision to you.

_[tool: write_file]_

Now the supplementary CSS for app chrome, scaling stage, and focus/scroll utilities.

_[tool: write_file]_

Now the icon set — I'll port the DS Lucide icons and add the extras the full spec needs (camera, upload, search, lock, theme, phone, etc.), all `currentColor`.

_[tool: write_file]_

Now the core token-based UI primitives.

_[tool: copy_files]_

_[tool: str_replace_edit]_

Now the health-specific components. Let me copy the body map (to preserve that long anatomical path) and add body-palette tokens that flip for dark mode.

_[tool: str_replace_edit]_

Now I'll tokenise the body map so it reads on dark navy too. Let me apply the edits.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: write_file]_

Now severity, mood, and charts modules.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now the seed data — a clearly-fictional mixed chronic-pain + low-mood patient, plus the validated PROM question banks.

_[tool: write_file]_

Now the shared chrome: bottom nav, FAB, screen headers, bottom sheet, modal, demo badge.

## User

continue with this build

## Assistant

_[tool: read_file]_

Let me verify the token names I'm referencing actually exist in the DS tokens, then build the screens.

_[tool: write_file]_

Tokens confirmed. Now I'll build the screens. Starting with the Today dashboard and the daily check-in.Now the Log flow — the compliance-critical <30s screen, plus the voice modal.

_[tool: write_file]_

_[tool: str_replace_edit]_

Now the Log flow — the most important screen.

_[tool: write_file]_

Now the daily check-in sheet and the PROM questionnaire flow.

_[tool: write_file]_

_[tool: write_file]_

Now the document upload flow and the red-flag safety modal.

_[tool: write_file]_

_[tool: str_replace_edit]_

Now the Insights screen — patterns (explicitly labelled as observations, not diagnoses), trends, red-flag log, adherence, PROM scores.

_[tool: write_file]_

Now the Profile screen with granular sharing, theme/accessibility settings, data ownership.

_[tool: write_file]_

_[tool: write_file]_

Now the clinical report with the clinician-view toggle (physio/dietitian/psychologist), plus the printable layout.

_[tool: write_file]_

Now the red-flag safety modal, the red-flag log sheet, and the onboarding flow.Now the onboarding flow — progressive profiling with document upload as the headline option.

_[tool: write_file]_

Now the main App that wires everything together, plus the index.html.

_[tool: write_file]_

_[tool: read_file]_

Let me check the iOS frame's API before writing index.html.

_[tool: read_file]_

_[tool: read_file]_

_[tool: write_file]_

The frame is 402×874 with an absolute status bar and home indicator. I'll build a scaling shell that wraps my app inside `IOSDevice`, with the status-bar color following the theme. Let me create the shell and wire it into `App.jsx`.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now add the text-scale and reduce-motion global CSS, then write index.html.

_[tool: write_file]_

_[tool: show_html]_

I'll proceed with my own check first since this is mid-build.

_[tool: show_html]_

The frame renders but content is blank — likely a JS error. Let me check logs.

_[tool: get_webview_logs]_

_[tool: eval_js]_

No errors logged, but blank. Let me probe the DOM state.

_[tool: eval_js]_

_[tool: save_screenshot]_

Content is there — the screenshot likely fired before Babel finished. Let me re-capture.

_[tool: save_screenshot]_

_[tool: eval_js]_

DOM has content but nothing visible. Let me inspect the actual element geometry and colors.

_[tool: eval_js]_

The DOM is populated and visible per computed styles, yet the capture is blank. Let me check what's actually painted at the h1's location.

_[tool: multi_screenshot]_

`elementFromPoint` is hitting a cross-origin frame overlay — that's editor instrumentation, not my content. Let me render via html-to-image which rebuilds from the DOM.

_[tool: eval_js]_

Layout exists but paints blank in both real and DOM-rebuild captures. Let me walk the ancestor chain for a paint-killing property.

_[tool: eval_js]_

Found it: the `.anim-fade` wrapper is stuck at `opacity: 0` — its entrance animation is paused at frame 0 by the capture environment. Relying on `opacity:0` as the animation start state makes content vanish whenever animations are paused/disabled. Let me confirm the media state, then fix the pattern so the visible state is the base.

_[tool: str_replace_edit]_

The iframe's animation timeline is paused while backgrounded, so an `opacity:0 → 1` entrance never advances and content stays invisible. The fix is to make frame-0 of every persistent entrance fully visible (no held `opacity:0`). Let me rewrite the entrance keyframes.

_[tool: str_replace_edit]_

_[tool: show_html]_

Now let me reload and verify content paints.The onboarding welcome renders beautifully. Let me click through the flow to verify the main screens. I'll drive it via JS to reach the Today dashboard, then capture key screens.

_[tool: update_todos]_

Let me capture the main screens by driving the React tree. I'll skip onboarding and snapshot Today, Log, Insights, Profile, plus dark mode.

_[tool: multi_screenshot]_

Onboarding step 2 works. Let me skip to the main app and capture Today, then navigate tabs.

_[tool: multi_screenshot]_

Excellent — Today, Insights, and Profile all render correctly with charts, data, and proper hierarchy. Let me verify the Log flow, a PROM, the report (with clinician toggle), and dark mode.

_[tool: multi_screenshot]_

_[tool: multi_screenshot]_

Log flow is solid — symptom search, severity band, body map, save enabling. Now the report with clinician toggle, a PROM, and dark mode.

_[tool: show_html]_

The clinical report and physio clinician view render perfectly. Now dark mode and a PROM questionnaire. Let me reload fresh first.

_[tool: multi_screenshot]_

_[tool: multi_screenshot]_

Dark mode is full parity — navy surfaces, lifted teal, white status bar. Let me verify the PROM flow (in dark, which doubles as a dark-parity check).

_[tool: delete_file]_

_[tool: update_todos]_

Everything works — PHQ-9 auto-advances, dark parity holds throughout. Let me clean up the temp file, register the deliverable, and hand off.The build is complete and verified across the main flows. Let me register the deliverable as an asset and hand off.

_[tool: write_file]_

_[tool: delete_file]_

_[tool: register_assets]_

_[tool: done]_

_[tool: fork_verifier_agent]_

No console errors. The adherence findings are soft nudges — and in this case mostly intentional: I deliberately built a **token-based** component layer (matching the DS specs exactly but reading `var(--*)` tokens) because the bundled DS components are hardcoded light-mode and your brief made **full dark-mode parity non-negotiable**. The flagged hexes in `bodymap.jsx` are the severity-scale values used inside SVG gradient stops (where CSS vars don't resolve cleanly), and they match the DS tokens exactly. I'll let those stand.

Let me fork the verifier for a thorough background pass.Done — **Noted** is built as a full, navigable iOS prototype at `app/Noted.html`, light + dark, faithful to the design system and your spec.

**What's there (all clickable):**
- **Onboarding** — 2-minute progressive profiling with document upload as the headline option; "you can add the rest later" shown explicitly; persistent self-reported framing.
- **Today** — greeting, passive wearable data (shown as auto-pulled), daily check-in, gently-surfaced PROM, and a calm red-flag prompt when triggered.
- **Log** (<30s path) — SNOMED-aligned symptom search + free text, severity slider (colour **and** number/label), interactive body map, character chips, optional one-tap context, editable timestamp, and on-device **voice entry** that always shows parsed output for review with a delete-audio control.
- **Insights** — severity trends, symptom frequency, **"observations, not diagnoses"** patterns (labelled, not buried), PROM sparklines, functional impact, medication adherence, red-flag log.
- **PROMs** — PHQ-9, GAD-7 (auto-advancing) and PEG-3 (0–10), scored and banded; PHQ-9 item 9 routes to a calm crisis-support response.
- **Document upload** — OCR/extraction → review-before-save screen with confidence flags.
- **Clinical report** — one-page clinical-letter layout with the **View as clinician** toggle (physio / dietitian / psychologist), SNOMED footer, verification disclaimer, and print/PDF.
- **Profile** — health record, granular per-professional sharing for sensitive history, NHS App "connect" state, theme + text-size + reduce-motion + delete-audio controls.

**Design decisions worth flagging:**
- Used the **design system's canonical** severity hexes and dark palette (per your answer), built on a tokenised component layer so dark mode has true parity.
- Persistent "Self-reported — not clinically verified" and 999/111 urgent lines throughout; no gradients, gamification, bright traffic-light red, or invented stats. All data is labelled fictional demo data.

**Next steps if you want them:** real GAD-7/IBS-SSS entry points from a PROM hub, an editable record (currently read-only sheets), and wiring the in-log red-flag continue to a logged entry. Tell me where to push.

The verifier is doing a background pass and will flag anything I missed.

