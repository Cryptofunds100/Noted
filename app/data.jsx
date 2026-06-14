// Noted — app catalogs + empty starting state.
//
// This file holds only the app's FUNCTIONAL content (symptom quick-pick list,
// validated questionnaire definitions, the Bristol chart, pain descriptors,
// health-platform names, sharing categories) plus neutral starting defaults.
// It contains NO fabricated patient record — every account starts empty and is
// filled only by what the user logs, enters, or uploads.

const TODAY_LABEL = '6 June 2026';
const TODAY_KEY = '2026-06-06';

// Real local "today" — used to stamp new entries (logs, check-ins, PROMs) with
// the actual day they were made, and to find today's logs. Local-calendar based
// so an entry near midnight keeps the user's own date. TODAY_LABEL/KEY above are
// retained only as harmless display fallbacks.
function notedTodayKey(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}
function notedTodayLabel(d = new Date()) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
window.notedTodayKey = notedTodayKey;
window.notedTodayLabel = notedTodayLabel;

// Empty profile template — a fresh account starts here. Filled via onboarding,
// the Profile screen, or a document upload.
const PATIENT = {
  name: '',
  firstName: '',
  age: null,
  sexAtBirth: '',
  gender: '',
  pronouns: '',
  nhsLinked: false,
  conditions: [],
  medications: [],
  allergies: [],
  note: '',
};

// Connected health platforms + the wearable metrics they can bring in.
const HEALTH_SOURCES = {
  apple:   { id: 'apple',   name: 'Apple Health',   device: 'Apple Watch',   exportName: 'export.zip',  exportHint: 'Health app → your profile → Export All Health Data' },
  samsung: { id: 'samsung', name: 'Samsung Health', device: 'Galaxy Watch',  exportName: 'shealth.zip', exportHint: 'Samsung Health → Settings → Download personal data' },
};

// Default connection state — nothing connected until the user links a device.
const HEALTH_DEFAULT = {
  apple:   { connected: false, lastSync: null },
  samsung: { connected: false, lastSync: null },
  imports: [],
};

// Metrics Noted can read from an export or a live sync. Order = display order.
const HEALTH_METRICS = [
  { id: 'sleep',        label: 'Sleep',               icon: 'Bed' },
  { id: 'sleepStages',  label: 'Sleep stages',        icon: 'Activity' },
  { id: 'restingHr',    label: 'Resting heart rate',  icon: 'Heart' },
  { id: 'exerciseHr',   label: 'Exercise heart rate', icon: 'Heart' },
  { id: 'steps',        label: 'Steps',               icon: 'Footprint' },
  { id: 'calories',     label: 'Calories',            icon: 'Flame' },
  { id: 'oxygen',       label: 'Blood oxygen',        icon: 'Droplet' },
  { id: 'ecg',          label: 'ECG results',         icon: 'Activity' },
  { id: 'vo2',          label: 'VO₂ max',            icon: 'Trend' },
];

// Once-daily check-in — neutral starting positions the user adjusts each day.
const CHECKIN_DEFAULTS = {
  sleepHours: 7,
  sleepQuality: 3,        // 1–5
  hydration: 0,           // glasses so far
  appetite: 'Normal',
  bowel: 4,               // Bristol 1–7
  activity: 'None',
  mood: 3,                // 1–5
  medsTaken: {},          // keyed by the user's own medication names
};

const BRISTOL = [
  { type: 1, desc: 'Separate hard lumps' },
  { type: 2, desc: 'Lumpy, sausage-shaped' },
  { type: 3, desc: 'Sausage with cracks' },
  { type: 4, desc: 'Smooth, soft sausage' },
  { type: 5, desc: 'Soft blobs, clear edges' },
  { type: 6, desc: 'Mushy, ragged edges' },
  { type: 7, desc: 'Watery, no solid pieces' },
];

const CHARACTERS = ['Sharp', 'Dull', 'Throbbing', 'Burning', 'Cramping', 'Aching', 'Shooting', 'Stiff'];

const COMMON_SYMPTOMS = [
  { name: 'Lower back pain', code: 'SNOMED 279039007' },
  { name: 'Knee pain', code: 'SNOMED 30989003' },
  { name: 'Low mood', code: 'SNOMED 366979004' },
  { name: 'Headache', code: 'SNOMED 25064002' },
  { name: 'Poor sleep', code: 'SNOMED 301345002' },
  { name: 'Fatigue', code: 'SNOMED 84229001' },
  { name: 'Neck pain', code: 'SNOMED 81680005' },
  { name: 'Nausea', code: 'SNOMED 422587007' },
  { name: 'Dizziness', code: 'SNOMED 404640003' },
  { name: 'Stomach pain', code: 'SNOMED 271681002' },
];

// A fresh account has no symptom logs.
const LOGS = [];

// PROMs ---------------------------------------------------------------------

const PHQ9_ITEMS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading or watching television',
  'Moving or speaking so slowly that other people could have noticed — or being so restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
];
const PHQ_GAD_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

const GAD7_ITEMS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

const PEG3_ITEMS = [
  { q: 'What number best describes your pain on average in the past week?', low: '0 — No pain', high: '10 — Worst imaginable' },
  { q: 'What number best describes how, during the past week, pain has interfered with your enjoyment of life?', low: '0 — Does not interfere', high: '10 — Completely interferes' },
  { q: 'What number best describes how, during the past week, pain has interfered with your general activity?', low: '0 — Does not interfere', high: '10 — Completely interferes' },
];

// Questionnaire definitions only — no prior scores. History/lastScore are
// computed from the user's own completed PROMs.
const PROMS = {
  phq9: {
    key: 'phq9', name: 'PHQ-9', full: 'Patient Health Questionnaire — depression',
    cadence: 'Every 2 weeks', maxScore: 27,
    items: PHQ9_ITEMS, options: PHQ_GAD_OPTIONS, kind: 'options', domain: 'mood',
    bands: [
      { max: 4, label: 'Minimal' }, { max: 9, label: 'Mild' }, { max: 14, label: 'Moderate' },
      { max: 19, label: 'Moderately severe' }, { max: 27, label: 'Severe' },
    ],
  },
  gad7: {
    key: 'gad7', name: 'GAD-7', full: 'Generalised Anxiety Disorder — anxiety',
    cadence: 'Every 2 weeks', maxScore: 21,
    items: GAD7_ITEMS, options: PHQ_GAD_OPTIONS, kind: 'options', domain: 'mood',
    bands: [{ max: 4, label: 'Minimal' }, { max: 9, label: 'Mild' }, { max: 14, label: 'Moderate' }, { max: 21, label: 'Severe' }],
  },
  peg3: {
    key: 'peg3', name: 'PEG-3', full: 'Pain intensity and interference',
    cadence: 'During pain flares', maxScore: 30,
    items: PEG3_ITEMS, kind: 'numeric', scaleMax: 10, domain: 'pain',
    bands: [{ max: 3, label: 'Mild' }, { max: 6, label: 'Moderate' }, { max: 10, label: 'Severe' }],
    note: 'Score is the average of the three answers (0–10).',
  },
  ibsSss: {
    key: 'ibsSss', name: 'IBS-SSS', full: 'IBS symptom severity',
    cadence: 'Monthly', maxScore: 500,
    kind: 'inactive', domain: 'gut',
  },
};

// Sharing — granular per professional type.
const PROFESSIONALS = [
  { id: 'gp', label: 'GP', icon: 'Stethoscope' },
  { id: 'physio', label: 'Physiotherapist', icon: 'Bone' },
  { id: 'psych', label: 'Psychologist', icon: 'Brain' },
  { id: 'dietitian', label: 'Dietitian', icon: 'Utensils' },
];
const SENSITIVE_CATEGORIES = [
  { id: 'mh', label: 'Mental health history', detail: 'Mood, PHQ-9/GAD-7 scores, stress notes' },
  { id: 'sexual', label: 'Sexual health', detail: 'Sexual health visits and results' },
  { id: 'termination', label: 'Pregnancy terminations', detail: 'Any recorded terminations' },
  { id: 'substance', label: 'Alcohol & substance use', detail: 'Self-reported use and notes' },
];
// default visibility[categoryId][professionalId] = boolean
const DEFAULT_SHARING = {
  mh:          { gp: true,  physio: false, psych: true,  dietitian: false },
  sexual:      { gp: true,  physio: false, psych: false, dietitian: false },
  termination: { gp: true,  physio: false, psych: false, dietitian: false },
  substance:   { gp: true,  physio: false, psych: true,  dietitian: true  },
};

Object.assign(window, {
  DEMO: {
    TODAY_LABEL, TODAY_KEY, PATIENT, CHECKIN_DEFAULTS, BRISTOL, CHARACTERS,
    COMMON_SYMPTOMS, LOGS, PROMS, PROFESSIONALS,
    SENSITIVE_CATEGORIES, DEFAULT_SHARING,
    HEALTH_SOURCES, HEALTH_DEFAULT, HEALTH_METRICS,
  },
});
