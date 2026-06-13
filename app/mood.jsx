// Mood — line-drawn faces (the only illustrative faces allowed; never emoji).
// Inlined so they recolour with the theme via currentColor.

function MoodFace({ level, size = 34 }) {
  // level 1 (very low) → 5 (very good). Mouth curve interpolates.
  const mouths = {
    1: <path d="M16 32 Q24 26 32 32" />,        // deep frown
    2: <path d="M16 31 Q24 28 32 31" />,        // slight frown
    3: <line x1="16" y1="30" x2="32" y2="30" />,// flat
    4: <path d="M16 29 Q24 33 32 29" />,        // slight smile
    5: <path d="M15 28 Q24 36 33 28" />,        // big smile
  };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="20" />
      <circle cx="18" cy="20" r="1.3" fill="currentColor" />
      <circle cx="30" cy="20" r="1.3" fill="currentColor" />
      {mouths[level]}
    </svg>
  );
}

const MOODS = [
  { id: 1, label: 'Very low' },
  { id: 2, label: 'Low' },
  { id: 3, label: 'Okay' },
  { id: 4, label: 'Good' },
  { id: 5, label: 'Very good' },
];

function MoodPicker({ value, onChange, label = 'How do you feel?' }) {
  return (
    <div>
      {label && <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 10 }}>{label}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {MOODS.map(m => {
          const sel = value === m.id;
          return (
            <button key={m.id} type="button" onClick={() => onChange(m.id)} aria-pressed={sel} aria-label={m.label}
              className="npress"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 4px', minHeight: 48, cursor: 'pointer',
                background: sel ? 'var(--mood-soft)' : 'var(--surface)',
                border: sel ? '1.5px solid var(--mood)' : '1px solid var(--border)',
                borderRadius: 10,
                color: sel ? 'var(--mood)' : 'var(--text-secondary)',
              }}>
              <MoodFace level={m.id} size={32} />
              <span style={{ fontSize: 11.5, color: sel ? 'var(--mood)' : 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Generic 1–N rating row (mood/stress 1–5, PROM answers 0–3 etc.)
function ScalePicker({ value, onChange, options, columns }) {
  const cols = columns || options.length;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
      {options.map(o => {
        const v = typeof o === 'object' ? o.value : o;
        const lab = typeof o === 'object' ? o.label : o;
        const sel = v === value;
        return (
          <button key={v} type="button" onClick={() => onChange(v)} aria-pressed={sel}
            className="npress"
            style={{
              minHeight: 48, padding: '10px 8px', cursor: 'pointer', borderRadius: 10,
              background: sel ? 'var(--brand-deep-teal-blue)' : 'var(--surface)',
              color: sel ? 'var(--text-on-brand)' : 'var(--text)',
              border: sel ? '1.5px solid var(--brand-deep-teal-blue)' : '1px solid var(--border)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500, lineHeight: 1.3,
            }}>{lab}</button>
        );
      })}
    </div>
  );
}

Object.assign(window, { MoodFace, MoodPicker, ScalePicker });
