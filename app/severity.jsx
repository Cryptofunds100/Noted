// Severity — 1–10 scale paired with the 5-step colour band. Colour is never
// the only signal: number + word label always accompany it.

const SEV_BANDS = [
  { max: 2,  label: 'Mild',     color: 'var(--severity-1-2)',  hex: '#6FAE7E' },
  { max: 4,  label: 'Low',      color: 'var(--severity-3-4)',  hex: '#C9B26B' },
  { max: 6,  label: 'Moderate', color: 'var(--severity-5-6)',  hex: '#C99A4E' },
  { max: 8,  label: 'High',     color: 'var(--severity-7-8)',  hex: '#B87355' },
  { max: 10, label: 'Severe',   color: 'var(--severity-9-10)', hex: '#A8392E' },
];
function sevInfo(v) { return SEV_BANDS.find(b => v <= b.max) || SEV_BANDS[4]; }
function sevHex(v) { return sevInfo(v).hex; }

function SeverityDot({ value, size = 9 }) {
  return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: 99,
    background: sevHex(value), boxShadow: '0 0 0 1px rgba(15,26,36,0.15)', flexShrink: 0, display: 'inline-block' }} />;
}

// number + colour + word — used in cards, reports, lists.
function SeverityTag({ value, style }) {
  const { label } = sevInfo(value);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px',
      borderRadius: 999, background: 'var(--surface-sunken)', border: '1px solid var(--border)',
      fontSize: 13, fontWeight: 600, color: 'var(--text)', ...style }}>
      <SeverityDot value={value} />
      <span className="tnum">{value}/10</span>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>· {label}</span>
    </span>
  );
}

function SeveritySlider({ value, onChange }) {
  const { label, hex } = sevInfo(value);
  const pct = ((value - 1) / 9) * 100;
  const trackRef = React.useRef(null);

  const setFromX = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, clientX - r.left));
    const v = Math.round((x / r.width) * 9) + 1;
    onChange(Math.max(1, Math.min(10, v)));
  };
  const onDown = (e) => {
    setFromX(e.clientX ?? e.touches?.[0]?.clientX);
    const move = (e2) => setFromX(e2.clientX ?? e2.touches?.[0]?.clientX);
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(10, value + 1)); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(1, value - 1)); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="tnum" style={{ fontWeight: 700, fontSize: 48, lineHeight: 1, color: 'var(--text)' }}>{value}</span>
        <span style={{ fontSize: 19, color: 'var(--text-secondary)', fontWeight: 500 }}>/ 10</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
          <SeverityDot value={value} size={12} />{label}
        </span>
      </div>
      <div ref={trackRef} onPointerDown={onDown} onKeyDown={onKey}
        role="slider" aria-valuemin={1} aria-valuemax={10} aria-valuenow={value}
        aria-label={`Severity ${value} out of 10, ${label}`} tabIndex={0}
        style={{ position: 'relative', padding: '16px 0', touchAction: 'none', cursor: 'pointer', marginTop: 8 }}>
        <div style={{ height: 12, borderRadius: 999, background: 'var(--severity-track-gradient)', border: '1px solid var(--border)' }} />
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)',
          width: 28, height: 28, background: '#FFFFFF', border: `3px solid ${hex}`,
          borderRadius: 999, boxShadow: '0 1px 3px rgba(15,26,36,0.25)',
        }} />
      </div>
      <div className="tnum" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
      </div>
    </div>
  );
}

Object.assign(window, { SEV_BANDS, sevInfo, sevHex, SeverityDot, SeverityTag, SeveritySlider });
