// Anatomical body silhouette (front/back). Single closed outline, filled with
// a soft vertical gradient plus a radial highlight to read as a rounded, 3D
// figure — modelled on a clinical body chart. viewBox is 0 0 200 480 and the
// marker coordinate system (cx = x*2, cy = y*4.8) is preserved.
const BODY_OUTLINE = "M100.00,15.00 C105.67,15.00 112.33,15.33 117.00,18.00 C121.67,20.67 125.83,25.67 128.00,31.00 C130.17,36.33 130.67,44.00 130.00,50.00 C129.33,56.00 126.67,63.17 124.00,67.00 C121.33,70.83 115.67,69.67 114.00,73.00 C112.33,76.33 112.00,84.00 114.00,87.00 C116.00,90.00 121.17,89.00 126.00,91.00 C130.83,93.00 138.00,95.50 143.00,99.00 C148.00,102.50 153.00,106.83 156.00,112.00 C159.00,117.17 159.83,123.17 161.00,130.00 C162.17,136.83 163.17,143.83 163.00,153.00 C162.83,162.17 161.33,174.33 160.00,185.00 C158.67,195.67 156.33,206.33 155.00,217.00 C153.67,227.67 151.83,240.83 152.00,249.00 C152.17,257.17 155.33,260.33 156.00,266.00 C156.67,271.67 157.00,278.67 156.00,283.00 C155.00,287.33 152.33,290.67 150.00,292.00 C147.67,293.33 143.67,293.83 142.00,291.00 C140.33,288.17 140.00,282.83 140.00,275.00 C140.00,267.17 141.00,256.17 142.00,244.00 C143.00,231.83 146.33,216.00 146.00,202.00 C145.67,188.00 142.50,171.17 140.00,160.00 C137.50,148.83 134.17,139.50 131.00,135.00 C127.83,130.50 121.83,128.50 121.00,133.00 C120.17,137.50 125.67,151.50 126.00,162.00 C126.33,172.50 123.67,187.00 123.00,196.00 C122.33,205.00 120.67,208.67 122.00,216.00 C123.33,223.33 129.17,232.67 131.00,240.00 C132.83,247.33 133.50,249.67 133.00,260.00 C132.50,270.33 129.67,287.67 128.00,302.00 C126.33,316.33 123.33,330.33 123.00,346.00 C122.67,361.67 126.83,380.00 126.00,396.00 C125.17,412.00 119.83,431.50 118.00,442.00 C116.17,452.50 113.83,454.33 115.00,459.00 C116.17,463.67 124.67,467.83 125.00,470.00 C125.33,472.17 120.33,473.17 117.00,472.00 C113.67,470.83 106.83,471.67 105.00,463.00 C103.17,454.33 105.50,437.17 106.00,420.00 C106.50,402.83 108.33,380.00 108.00,360.00 C107.67,340.00 105.17,315.83 104.00,300.00 C102.83,284.17 101.83,270.83 101.00,265.00 C100.17,259.17 99.83,259.17 99.00,265.00 C98.17,270.83 97.17,284.17 96.00,300.00 C94.83,315.83 92.33,340.00 92.00,360.00 C91.67,380.00 93.50,402.83 94.00,420.00 C94.50,437.17 96.83,454.33 95.00,463.00 C93.17,471.67 86.33,470.83 83.00,472.00 C79.67,473.17 74.67,472.17 75.00,470.00 C75.33,467.83 83.83,463.67 85.00,459.00 C86.17,454.33 83.83,452.50 82.00,442.00 C80.17,431.50 74.83,412.00 74.00,396.00 C73.17,380.00 77.33,361.67 77.00,346.00 C76.67,330.33 73.67,316.33 72.00,302.00 C70.33,287.67 67.50,270.33 67.00,260.00 C66.50,249.67 67.17,247.33 69.00,240.00 C70.83,232.67 76.67,223.33 78.00,216.00 C79.33,208.67 77.67,205.00 77.00,196.00 C76.33,187.00 73.67,172.50 74.00,162.00 C74.33,151.50 79.83,137.50 79.00,133.00 C78.17,128.50 72.17,130.50 69.00,135.00 C65.83,139.50 62.50,148.83 60.00,160.00 C57.50,171.17 54.33,188.00 54.00,202.00 C53.67,216.00 57.00,231.83 58.00,244.00 C59.00,256.17 60.00,267.17 60.00,275.00 C60.00,282.83 59.67,288.17 58.00,291.00 C56.33,293.83 52.33,293.33 50.00,292.00 C47.67,290.67 45.00,287.33 44.00,283.00 C43.00,278.67 43.33,271.67 44.00,266.00 C44.67,260.33 47.83,257.17 48.00,249.00 C48.17,240.83 46.33,227.67 45.00,217.00 C43.67,206.33 41.33,195.67 40.00,185.00 C38.67,174.33 37.17,162.17 37.00,153.00 C36.83,143.83 37.83,136.83 39.00,130.00 C40.17,123.17 41.00,117.17 44.00,112.00 C47.00,106.83 52.00,102.50 57.00,99.00 C62.00,95.50 69.17,93.00 74.00,91.00 C78.83,89.00 84.00,90.00 86.00,87.00 C88.00,84.00 87.67,76.33 86.00,73.00 C84.33,69.67 78.67,70.83 76.00,67.00 C73.33,63.17 70.67,56.00 70.00,50.00 C69.33,44.00 69.83,36.33 72.00,31.00 C74.17,25.67 78.33,20.67 83.00,18.00 C87.67,15.33 94.33,15.00 100.00,15.00 Z";

const frontDetails = (
  <g fill="none" style={{ stroke: 'var(--body-detail)' }} strokeWidth="1.5" strokeOpacity="0.55" strokeLinecap="round">
    {/* Collarbones */}
    <path d="M100,92 C112,95 124,97 138,103"/>
    <path d="M100,92 C88,95 76,97 62,103"/>
    {/* Pectoral / chest curves */}
    <path d="M152,124 C146,150 126,158 104,150" strokeOpacity="0.4"/>
    <path d="M48,124 C54,150 74,158 96,150" strokeOpacity="0.4"/>
    {/* Faint centre line */}
    <path d="M100,104 L100,196" strokeOpacity="0.28"/>
    {/* Navel */}
    <path d="M100,200 C97,202 97,206 100,208 C103,206 103,202 100,200" strokeOpacity="0.5"/>
    {/* Groin creases */}
    <path d="M101,262 C111,256 119,247 124,236"/>
    <path d="M99,262 C89,256 81,247 76,236"/>
    {/* Knee hints */}
    <path d="M111,346 C116,351 122,351 127,346" strokeOpacity="0.4"/>
    <path d="M89,346 C84,351 78,351 73,346" strokeOpacity="0.4"/>
  </g>
);

const backDetails = (
  <g fill="none" style={{ stroke: 'var(--body-detail)' }} strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round">
    {/* Spine */}
    <path d="M100,100 C100,160 100,210 100,250" strokeOpacity="0.4"/>
    {/* Shoulder blades */}
    <path d="M132,118 C124,132 119,148 122,166"/>
    <path d="M68,118 C76,132 81,148 78,166"/>
    {/* Lower-back dimples + glute curves */}
    <path d="M130,250 C120,262 110,267 101,267"/>
    <path d="M70,250 C80,262 90,267 99,267"/>
    <path d="M100,250 L100,288" strokeOpacity="0.4"/>
    {/* Knee creases (back) */}
    <path d="M111,348 C116,353 122,353 127,348" strokeOpacity="0.4"/>
    <path d="M89,348 C84,353 78,353 73,348" strokeOpacity="0.4"/>
    {/* Calf hints */}
    <path d="M120,392 C126,402 126,416 121,428" strokeOpacity="0.35"/>
    <path d="M80,392 C74,402 74,416 79,428" strokeOpacity="0.35"/>
  </g>
);

// Renders the shaded silhouette plus side-specific anatomy. uid keeps gradient
// ids unique across the multiple SVG instances on a screen.
function BodyArt({ side, strokeWidth = 2.2 }) {
  const rawId = React.useId();
  const uid = rawId.replace(/[:]/g, '');
  const fillId = 'bodyfill-' + uid;
  const shadeId = 'bodyshade-' + uid;
  return (
    <g>
      <defs>
        <linearGradient id={fillId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--body-fill-top)' }}/>
          <stop offset="0.55" style={{ stopColor: 'var(--body-fill-mid)' }}/>
          <stop offset="1" style={{ stopColor: 'var(--body-fill-bot)' }}/>
        </linearGradient>
        <radialGradient id={shadeId} cx="0.38" cy="0.28" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7"/>
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.12"/>
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <path d={BODY_OUTLINE} fill={`url(#${fillId})`} style={{ stroke: 'var(--body-stroke)' }}
            strokeWidth={strokeWidth} strokeLinejoin="round"/>
      <path d={BODY_OUTLINE} fill={`url(#${shadeId})`} stroke="none"/>
      {side === 'back' ? backDetails : frontDetails}
    </g>
  );
}

function colorForSev(v) {
  if (v <= 2) return '#6FAE7E';
  if (v <= 4) return '#C9B26B';
  if (v <= 6) return '#C99A4E';
  if (v <= 8) return '#B87355';
  return '#A8392E';
}

function labelForSev(v) {
  if (v <= 2) return 'Mild';
  if (v <= 4) return 'Low';
  if (v <= 6) return 'Moderate';
  if (v <= 8) return 'High';
  return 'Severe';
}

const MARKER_MIN = 14;  // px
const MARKER_MAX = 64;
const MARKER_DEFAULT = 22;

function BodyMap({ markers, onChange, severity }) {
  const [side, setSide]               = React.useState('front');
  const [selectedId, setSelId]        = React.useState(null);
  const [severityDirty, setSevDirty]  = React.useState(true); // true = ok to place
  const [pendingTap, setPendingTap]   = React.useState(null);  // { x, y } awaiting severity confirmation
  const wrapRef                       = React.useRef(null);
  const lastSevRef                    = React.useRef(severity);

  const visible = markers.filter(m => m.side === side);

  // Watch the severity prop. When it changes externally (slider moved), mark
  // the slider as "dirty" so the next tap can place a marker, and dismiss any
  // pending prompt so the user can simply tap again.
  React.useEffect(() => {
    if (severity !== lastSevRef.current) {
      lastSevRef.current = severity;
      setSevDirty(true);
      setPendingTap(null);
    }
  }, [severity]);

  const placeMarker = (x, y) => {
    const id = Math.random().toString(36).slice(2, 9);
    onChange([...markers, { id, side, x, y, size: MARKER_DEFAULT, severity }]);
    setSelId(id);
    setSevDirty(false);   // require severity change before another marker
    setPendingTap(null);
  };

  // Add a marker on tap to empty space
  const onMapPointerDown = (e) => {
    if (e.target !== wrapRef.current && e.target.tagName !== 'svg' && !e.target.closest('svg')) return;
    const r = wrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width)  * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;

    // If there is already at least one marker and the severity hasn't been
    // adjusted since, ask the user to set the severity for THIS spot before
    // we drop the marker. The colour of each marker matches its own severity,
    // so reusing the last value silently would lose intent.
    if (markers.length > 0 && !severityDirty) {
      setPendingTap({ x, y });
      setSelId(null);
      return;
    }

    placeMarker(x, y);
  };

  const confirmPendingWithCurrent = () => {
    if (!pendingTap) return;
    placeMarker(pendingTap.x, pendingTap.y);
  };

  const cancelPending = () => {
    setPendingTap(null);
  };

  const updateMarker = (id, patch) => {
    onChange(markers.map(m => m.id === id ? { ...m, ...patch } : m));
  };
  const removeMarker = (id) => {
    onChange(markers.filter(m => m.id !== id));
    setSelId(null);
  };

  // Drag the marker body
  const onMarkerPointerDown = (e, m) => {
    e.stopPropagation();
    setSelId(m.id);
    setPendingTap(null);
    const r = wrapRef.current.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const origX  = m.x, origY = m.y;
    const move = (ev) => {
      const dx = ((ev.clientX - startX) / r.width)  * 100;
      const dy = ((ev.clientY - startY) / r.height) * 100;
      updateMarker(m.id, {
        x: Math.max(0, Math.min(100, origX + dx)),
        y: Math.max(0, Math.min(100, origY + dy)),
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup',   up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup',   up);
  };

  // Drag resize handle
  const onResizePointerDown = (e, m) => {
    e.stopPropagation();
    setSelId(m.id);
    const startX = e.clientX, startY = e.clientY;
    const origSize = m.size;
    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const delta = (dx + dy) / 2;
      const next = Math.max(MARKER_MIN, Math.min(MARKER_MAX, origSize + delta));
      updateMarker(m.id, { size: next });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup',   up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup',   up);
  };

  // Deselect on outside click
  React.useEffect(() => {
    if (!selectedId) return;
    const onDocPointerDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setSelId(null);
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [selectedId]);

  const nextSevColor = colorForSev(severity);
  const nextSevLabel = labelForSev(severity);

  // Helper text varies depending on state
  const helperText = markers.length === 0
    ? 'Tap where it hurts. Each marker uses the severity colour from the slider above.'
    : (severityDirty
        ? `Next marker will be ${nextSevLabel.toLowerCase()} (${severity}/10). Tap to place.`
        : 'Adjust the severity slider before placing another marker — colours show how each spot compares.');

  return (
    <div>
      <div style={{ display: 'flex', padding: 4, background: 'var(--surface-sunken)', borderRadius: 8, marginBottom: 12 }}>
        {['front', 'back'].map(s => (
          <button key={s} onClick={() => setSide(s)} aria-pressed={side === s}
            style={{
              flex: 1, height: 36, border: 0, background: side === s ? 'var(--surface)' : 'transparent',
              color: side === s ? 'var(--brand-deep-teal-blue)' : 'var(--text-secondary)', fontWeight: 600, fontSize: 14,
              borderRadius: 6, cursor: 'pointer',
              boxShadow: side === s ? '0 1px 2px rgba(15,26,36,0.04)' : 'none',
              textTransform: 'capitalize', fontFamily: 'inherit',
            }}>{s}</button>
        ))}
      </div>
      <div ref={wrapRef} onPointerDown={onMapPointerDown}
        style={{
          position: 'relative',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12, padding: 14,
          height: 320, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'crosshair',
          touchAction: 'none',
          userSelect: 'none',
          overflow: 'hidden',
        }}>
        {/* "Next marker" badge — shows what colour the next tap will produce */}
        <div aria-hidden="true"
          style={{
            position: 'absolute', top: 10, left: 10,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px 4px 6px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 999, fontSize: 12, color: 'var(--text-secondary)',
            boxShadow: '0 1px 2px rgba(15,26,36,0.04)',
            pointerEvents: 'none',
          }}>
          <span style={{
            width: 14, height: 14, borderRadius: 999,
            background: nextSevColor,
            border: '2px solid #FFFFFF',
            boxShadow: '0 0 0 1px rgba(15,26,36,0.20)',
          }}/>
          Next: {nextSevLabel} · {severity}/10
        </div>

        <svg viewBox="0 0 200 480"
             style={{ height: '100%', maxHeight: 292, pointerEvents: 'none' }}>
          <BodyArt side={side} strokeWidth={2.2}/>
        </svg>
        {visible.map(m => {
          const sel = m.id === selectedId;
          return (
            <div key={m.id} style={{
              position: 'absolute', left: `${m.x}%`, top: `${m.y}%`,
              transform: 'translate(-50%, -50%)',
              width: m.size, height: m.size, borderRadius: 999,
              background: colorForSev(m.severity || 5),
              border: '2px solid #FFFFFF',
              boxShadow: sel
                ? `0 0 0 2px ${colorForSev(m.severity || 5)}, 0 0 0 4px rgba(255,255,255,0.9)`
                : '0 0 0 1px rgba(15,26,36,0.20)',
              cursor: 'grab',
            }}
              onPointerDown={(e) => onMarkerPointerDown(e, m)}
              role="button"
              aria-label={`Marker at ${Math.round(m.x)}% across, ${Math.round(m.y)}% down. Severity ${m.severity}. Tap to select.`}>
              {sel && (
                <>
                  {/* Delete */}
                  <button
                    onPointerDown={(e) => { e.stopPropagation(); removeMarker(m.id); }}
                    aria-label="Remove marker"
                    style={{
                      position: 'absolute', top: -10, right: -10,
                      width: 22, height: 22, borderRadius: 999, border: 0,
                      background: '#1F2937', color: '#FFFFFF', cursor: 'pointer',
                      display: 'grid', placeItems: 'center',
                      boxShadow: '0 1px 2px rgba(15,26,36,0.20)',
                    }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  {/* Resize handle (bottom-right) */}
                  <div
                    onPointerDown={(e) => onResizePointerDown(e, m)}
                    role="slider"
                    aria-label="Drag to resize marker"
                    aria-valuemin={MARKER_MIN}
                    aria-valuemax={MARKER_MAX}
                    aria-valuenow={Math.round(m.size)}
                    style={{
                      position: 'absolute', bottom: -8, right: -8,
                      width: 18, height: 18, borderRadius: 999,
                      background: '#FFFFFF', border: '2px solid #1F2937',
                      cursor: 'nwse-resize', touchAction: 'none',
                      boxShadow: '0 1px 2px rgba(15,26,36,0.20)',
                    }}/>
                </>
              )}
            </div>
          );
        })}

        {/* Ghost dot at the pending tap location */}
        {pendingTap && (
          <div aria-hidden="true" style={{
            position: 'absolute', left: `${pendingTap.x}%`, top: `${pendingTap.y}%`,
            transform: 'translate(-50%, -50%)',
            width: MARKER_DEFAULT, height: MARKER_DEFAULT, borderRadius: 999,
            background: 'transparent',
            border: `2px dashed ${nextSevColor}`,
            pointerEvents: 'none',
          }}/>
        )}
      </div>

      {/* Severity-confirmation prompt — appears between body map and helper line */}
      {pendingTap && (
        <div role="dialog" aria-label="Set severity for this spot"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            marginTop: 10,
            padding: 12,
            background: 'var(--surface)',
            border: `1px solid ${nextSevColor}`,
            borderLeft: `4px solid ${nextSevColor}`,
            borderRadius: 12,
            display: 'flex', flexDirection: 'column', gap: 10,
            boxShadow: '0 2px 8px rgba(15,26,36,0.06)',
          }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span aria-hidden="true" style={{
              flexShrink: 0, marginTop: 2,
              width: 14, height: 14, borderRadius: 999,
              background: nextSevColor,
              border: '2px solid #FFFFFF',
              boxShadow: '0 0 0 1px rgba(15,26,36,0.20)',
            }}/>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>
              <strong style={{ fontWeight: 600 }}>Set the severity for this spot.</strong>
              <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                Adjust the slider above so the marker matches how this area feels — or keep it at {nextSevLabel.toLowerCase()} ({severity}/10).
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={cancelPending}
              style={{
                height: 36, padding: '0 14px', borderRadius: 999,
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text)', fontSize: 14, fontWeight: 500,
                fontFamily: 'inherit', cursor: 'pointer',
              }}>Cancel</button>
            <button type="button" onClick={confirmPendingWithCurrent}
              style={{
                height: 36, padding: '0 14px', borderRadius: 999,
                border: 0, background: 'var(--brand-deep-teal-blue)', color: '#FFFFFF',
                fontSize: 14, fontWeight: 500,
                fontFamily: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              <span aria-hidden="true" style={{
                width: 10, height: 10, borderRadius: 999, background: nextSevColor,
                border: '1.5px solid #FFFFFF',
              }}/>
              Keep {severity}/10
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
        {helperText} Drag to move, drag the handle to resize, tap × to remove.
      </div>
    </div>
  );
}

// Compact, read-only body silhouette with marker dots. Used on the Home screen
// inside SymptomCard to preview where the user logged their symptom.
function BodyThumb({ markers = [], side = null, width = 22, height = 52 }) {
  const all = side ? markers.filter(m => m.side === side) : markers;
  return (
    <svg viewBox="30 0 140 480" width={width} height={height}
         preserveAspectRatio="xMidYMid meet"
         aria-hidden="true"
         style={{ display: 'block', flexShrink: 0 }}>
      <BodyArt side={side === 'back' ? 'back' : 'front'} strokeWidth={4}/>
      {all.map((m, i) => (
        <circle key={m.id || i} cx={m.x * 2} cy={m.y * 4.8}
                r="18"
                fill={colorForSev(m.severity || 5)}
                stroke="#FFFFFF" strokeWidth="4"/>
      ))}
    </svg>
  );
}

Object.assign(window, { BodyMap, BodyThumb, colorForSev });
