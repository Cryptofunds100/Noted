// Noted — seed demo data. EVERYTHING here is clearly-fictional sample data for a
// demonstration patient. No real people, outcomes, statistics or endorsements.

const TODAY_LABEL = '6 June 2026';
const TODAY_KEY = '2026-06-06';

const PATIENT = {
  name: 'Ade Bello',
  firstName: 'Ade',
  demo: true,
  age: 54,
  sexAtBirth: 'Male',
  gender: 'Man',
  pronouns: 'he/him',
  nhsLinked: false,
  conditions: [
    { name: 'Chronic lower back pain', code: 'SNOMED 279039007', since: '2021' },
    { name: 'Osteoarthritis of knee', code: 'SNOMED 239873007', since: '2022' },
    { name: 'Depression', code: 'SNOMED 35489007', since: '2023' },
  ],
  medications: [
    { name: 'Naproxen', dose: '500 mg', schedule: 'Twice a day with food', code: 'SNOMED 323402007' },
    { name: 'Amitriptyline', dose: '10 mg', schedule: 'At night', code: 'SNOMED 376367009' },
    { name: 'Sertraline', dose: '50 mg', schedule: 'Once in the morning', code: 'SNOMED 412348000' },
  ],
  allergies: [
    { name: 'Penicillin', reaction: 'Rash', code: 'SNOMED 294505008' },
  ],
};

// Passive data — presented as already pulled from a wearable, not asked.
const PASSIVE = {
  source: 'Health app',
  sleepHours: 5.8,
  sleepQuality: 'Restless',
  steps: 3120,
  restingHr: 72,
  syncedAt: '07:10',
};

// Connected health platforms + the wearable metrics they can bring in.
const HEALTH_SOURCES = {
  apple:   { id: 'apple',   name: 'Apple Health',   device: 'Apple Watch',   exportName: 'export.zip',  exportHint: 'Health app \u2192 your profile \u2192 Export All Health Data' },
  samsung: { id: 'samsung', name: 'Samsung Health', device: 'Galaxy Watch',  exportName: 'shealth.zip', exportHint: 'Samsung Health \u2192 Settings \u2192 Download personal data' },
};

// Default connection state. Apple is linked in the demo; Samsung is available.
const HEALTH_DEFAULT = {
  apple:   { connected: true,  lastSync: '07:10' },
  samsung: { connected: false, lastSync: null },
  imports: [],
};

// Metrics Noted can read from an export or a live sync. Order = display order.
const HEALTH_METRICS = [
  { id: 'sleep',        label: 'Sleep',               icon: 'Bed',       sample: '5h 48m last night' },
  { id: 'sleepStages',  label: 'Sleep stages',        icon: 'Activity',  sample: 'REM \u00b7 deep \u00b7 light' },
  { id: 'restingHr',    label: 'Resting heart rate',  icon: 'Heart',     sample: '72 bpm average' },
  { id: 'exerciseHr',   label: 'Exercise heart rate', icon: 'Heart',     sample: '128 bpm peak' },
  { id: 'steps',        label: 'Steps',               icon: 'Footprint', sample: '3,120 today' },
  { id: 'calories',     label: 'Calories',            icon: 'Flame',     sample: '1,840 kcal' },
  { id: 'oxygen',       label: 'Blood oxygen',        icon: 'Droplet',   sample: '97% SpO\u2082' },
  { id: 'ecg',          label: 'ECG results',         icon: 'Activity',  sample: 'Sinus rhythm' },
  { id: 'vo2',          label: 'VO\u2082 max',            icon: 'Trend',     sample: '34.2 ml/kg/min' },
];

// Once-daily background check-in. Smart defaults pre-filled from yesterday.
const CHECKIN_DEFAULTS = {
  sleepHours: 5.8,         // auto from wearable
  sleepQuality: 3,         // 1–5
  hydration: 4,            // glasses so far
  appetite: 'Reduced',
  bowel: 4,                // Bristol 1–7
  activity: 'Light — short walk',
  mood: 2,                 // 1–5
  medsTaken: { Naproxen: true, Amitriptyline: false, Sertraline: true },
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

// Recent symptom logs (newest first within their day).
const LOGS = [
  {
    id: 'l1', name: 'Lower back pain', code: 'SNOMED 279039007',
    severity: 7, time: '08:24', date: '6 June 2026', dateKey: '2026-06-06',
    onset: 'On waking', duration: 'Ongoing', character: ['Aching', 'Stiff'],
    note: 'Stiff after a poor night. Hard to bend to put socks on.',
    markers: [{ id: 'm1', side: 'back', x: 50, y: 50, size: 26, severity: 7 }],
    context: { triggers: ['Poor sleep'], relieving: ['Heat', 'Walking'], activity: 'Getting out of bed', mood: 2 },
  },
  {
    id: 'l2', name: 'Low mood', code: 'SNOMED 366979004',
    severity: 6, time: '21:40', date: '5 June 2026', dateKey: '2026-06-05',
    onset: 'Evening', duration: 'Most of the day', character: [],
    note: 'Flat all day. Cancelled seeing a friend.',
    markers: [], context: { triggers: ['Pain', 'Tiredness'], relieving: [], activity: 'At home', mood: 1 },
  },
  {
    id: 'l3', name: 'Knee pain', code: 'SNOMED 30989003',
    severity: 5, time: '17:05', date: '5 June 2026', dateKey: '2026-06-05',
    onset: 'After standing', duration: 'A few hours', character: ['Throbbing'],
    note: 'Right knee after standing to cook.',
    markers: [{ id: 'm2', side: 'front', x: 56, y: 71, size: 22, severity: 5 }],
    context: { triggers: ['Standing'], relieving: ['Rest', 'Ice'], activity: 'Cooking', mood: 3 },
  },
  {
    id: 'l4', name: 'Lower back pain', code: 'SNOMED 279039007',
    severity: 8, time: '14:30', date: '3 June 2026', dateKey: '2026-06-03',
    onset: 'Lifting', duration: 'Rest of day', character: ['Sharp', 'Shooting'],
    note: 'Sharp catch lifting shopping. Spread down left leg.',
    markers: [{ id: 'm3', side: 'back', x: 46, y: 52, size: 30, severity: 8 }, { id: 'm3b', side: 'back', x: 44, y: 70, size: 20, severity: 5 }],
    context: { triggers: ['Lifting'], relieving: ['Lying down'], activity: 'Carrying shopping', mood: 2 },
  },
  {
    id: 'l5', name: 'Headache', code: 'SNOMED 25064002',
    severity: 4, time: '11:15', date: '1 June 2026', dateKey: '2026-06-01',
    onset: 'Late morning', duration: '2 hours', character: ['Dull'],
    note: 'Behind the eyes. Eased after water and a break from the screen.',
    markers: [{ id: 'm4', side: 'front', x: 50, y: 8, size: 22, severity: 4 }],
    context: { triggers: ['Screen time', 'Dehydration'], relieving: ['Water', 'Rest'], activity: 'Admin', mood: 3 },
  },
];

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

const PROMS = {
  phq9: {
    key: 'phq9', name: 'PHQ-9', full: 'Patient Health Questionnaire — depression',
    cadence: 'Every 2 weeks', due: true, dueLabel: 'Due today', maxScore: 27,
    items: PHQ9_ITEMS, options: PHQ_GAD_OPTIONS, kind: 'options', domain: 'mood',
    bands: [
      { max: 4, label: 'Minimal' }, { max: 9, label: 'Mild' }, { max: 14, label: 'Moderate' },
      { max: 19, label: 'Moderately severe' }, { max: 27, label: 'Severe' },
    ],
    history: [
      { date: '11 Apr', score: 16 }, { date: '25 Apr', score: 15 }, { date: '9 May', score: 14 },
      { date: '23 May', score: 12 }, { date: '6 Jun', score: null },
    ],
    lastScore: 12,
  },
  gad7: {
    key: 'gad7', name: 'GAD-7', full: 'Generalised Anxiety Disorder — anxiety',
    cadence: 'Every 2 weeks', due: false, dueLabel: 'Next in 5 days', maxScore: 21,
    items: GAD7_ITEMS, options: PHQ_GAD_OPTIONS, kind: 'options', domain: 'mood',
    bands: [{ max: 4, label: 'Minimal' }, { max: 9, label: 'Mild' }, { max: 14, label: 'Moderate' }, { max: 21, label: 'Severe' }],
    history: [
      { date: '11 Apr', score: 11 }, { date: '25 Apr', score: 10 }, { date: '9 May', score: 9 }, { date: '23 May', score: 8 },
    ],
    lastScore: 8,
  },
  peg3: {
    key: 'peg3', name: 'PEG-3', full: 'Pain intensity and interference',
    cadence: 'During pain flares', due: true, dueLabel: 'Suggested — flare logged', maxScore: 30,
    items: PEG3_ITEMS, kind: 'numeric', scaleMax: 10, domain: 'pain',
    bands: [{ max: 3, label: 'Mild' }, { max: 6, label: 'Moderate' }, { max: 10, label: 'Severe' }],
    history: [
      { date: '11 Apr', score: 7.3 }, { date: '25 Apr', score: 7.0 }, { date: '9 May', score: 6.7 },
      { date: '23 May', score: 6.3 }, { date: '3 Jun', score: 7.7 },
    ],
    lastScore: 7.7,
    note: 'Score is the average of the three answers (0–10).',
  },
  ibsSss: {
    key: 'ibsSss', name: 'IBS-SSS', full: 'IBS symptom severity',
    cadence: 'Monthly', due: false, dueLabel: 'Not active for you', maxScore: 500,
    kind: 'inactive', domain: 'gut',
    history: [],
    lastScore: null,
  },
};

// Patterns — observations, never diagnoses.
const PATTERNS = [
  { text: 'Back pain was logged more often on days after fewer than 6 hours of sleep.', basis: 'Based on 14 of your logs over 4 weeks.' },
  { text: 'Low mood entries often appeared on the same day as a pain flare of 7/10 or higher.', basis: 'Based on 9 of your logs over 4 weeks.' },
  { text: 'Pain eased on days with a short walk logged.', basis: 'Based on 11 of your logs over 4 weeks.' },
];

// Red-flag record — past urgent-symptom prompts.
const RED_FLAGS = [
  { id: 'rf1', date: '20 May 2026', time: '22:15', symptom: 'Chest tightness', rule: 'Chest pain', action: 'Advised to call 111', outcome: 'You logged: spoke to 111, advised to monitor.' },
];

// Medication adherence (last 7 days, true = taken).
const ADHERENCE = {
  week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  meds: [
    { name: 'Naproxen', days: [1, 1, 1, 0, 1, 1, 1] },
    { name: 'Amitriptyline', days: [1, 1, 0, 1, 1, 0, 1] },
    { name: 'Sertraline', days: [1, 1, 1, 1, 1, 1, 1] },
  ],
};

// Functional impact (self-rated 0–10 interference, this vs last week average).
const FUNCTION_IMPACT = [
  { label: 'Work', value: 6 },
  { label: 'Exercise', value: 7 },
  { label: 'Social', value: 5 },
  { label: 'Sleep', value: 6 },
];

// Severity trend for Insights (this week vs last, 0–10).
const SEV_TREND = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  thisWeek: [6, 7, 5, 8, 6, 5, 7],
  lastWeek: [7, 7, 8, 7, 6, 7, 6],
};

// Symptom frequency (count this period).
const SYMPTOM_FREQ = [
  { label: 'Back', value: 9, color: 'var(--severity-7-8)' },
  { label: 'Knee', value: 5, color: 'var(--severity-5-6)' },
  { label: 'Mood', value: 6, color: 'var(--mood)' },
  { label: 'Head', value: 2, color: 'var(--severity-3-4)' },
];

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

// Document upload — fields the OCR step "extracts" for review.
const EXTRACTED_DOC = {
  source: 'Discharge summary — Royal Infirmary',
  dateOnDoc: '14 May 2026',
  conditions: [
    { name: 'Chronic lower back pain', confidence: 'high' },
    { name: 'Lumbar radiculopathy', confidence: 'medium' },
  ],
  medications: [
    { name: 'Naproxen 500 mg', detail: 'Twice daily', confidence: 'high' },
    { name: 'Amitriptyline 10 mg', detail: 'At night', confidence: 'high' },
    { name: 'Lansoprazole 15 mg', detail: 'Once daily', confidence: 'medium' },
  ],
  allergies: [
    { name: 'Penicillin', detail: 'Rash', confidence: 'high' },
  ],
};

Object.assign(window, {
  DEMO: {
    TODAY_LABEL, TODAY_KEY, PATIENT, PASSIVE, CHECKIN_DEFAULTS, BRISTOL, CHARACTERS,
    COMMON_SYMPTOMS, LOGS, PROMS, PATTERNS, RED_FLAGS, ADHERENCE,
    FUNCTION_IMPACT, SEV_TREND, SYMPTOM_FREQ, PROFESSIONALS,
    SENSITIVE_CATEGORIES, DEFAULT_SHARING, EXTRACTED_DOC,
    HEALTH_SOURCES, HEALTH_DEFAULT, HEALTH_METRICS,
  },
});
