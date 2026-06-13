// Noted — token-based UI primitives. Faithful to the DS component specs
// (heights, radii, borders, weights) but reading from var(--*) so dark mode
// has true parity. currentColor + tokens throughout.

(function () {
  if (document.getElementById('noted-ui-style')) return;
  const s = document.createElement('style');
  s.id = 'noted-ui-style';
  s.textContent = `
  .nbtn { font-family: inherit; font-weight: 500; border-radius: var(--radius-sm);
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: 0; cursor: pointer; transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
    white-space: nowrap; }
  .nbtn:disabled { opacity: .4; pointer-events: none; }
  .nbtn--primary { background: var(--brand-deep-teal-blue); color: var(--text-on-brand); }
  .nbtn--primary:hover { background: var(--brand-deep-teal-blue-hover); }
  .nbtn--primary:active { background: var(--brand-deep-teal-blue-press); }
  .nbtn--secondary { background: transparent; color: var(--brand-deep-teal-blue); border: 1.5px solid var(--brand-deep-teal-blue); }
  .nbtn--secondary:hover { background: var(--primary-tint, rgba(11,92,107,.06)); }
  .nbtn--tertiary { background: transparent; color: var(--brand-deep-teal-blue); }
  .nbtn--tertiary:hover { text-decoration: underline; }
  .nbtn--destructive { background: var(--red-flag); color: #fff; }
  .nbtn--destructive:hover { filter: brightness(.94); }
  .nbtn--ghost { background: var(--surface-sunken); color: var(--text); }
  .nbtn--ghost:hover { background: var(--border); }
  .npress { transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease); }
  .nlink { color: var(--brand-deep-teal-blue); cursor: pointer; font-weight: 500; }
  .nlink:hover { text-decoration: underline; }
  `;
  document.head.appendChild(s);
})();

const SIZES = {
  lg: { height: 'var(--tap-primary)', padding: '0 22px', fontSize: 17 },
  md: { height: 'var(--tap-min)', padding: '0 20px', fontSize: 17 },
  sm: { height: 40, padding: '0 14px', fontSize: 15 },
};

function Button({ variant = 'primary', size = 'lg', block, children, leadingIcon, trailingIcon, style, ...rest }) {
  const sz = SIZES[size];
  return (
    <button className={`nbtn nbtn--${variant}`}
      style={{ ...sz, width: block ? '100%' : undefined, ...style }} {...rest}>
      {leadingIcon}{children}{trailingIcon}
    </button>
  );
}

function Card({ children, style, padding, sunken, interactive, ...rest }) {
  return (
    <div className={interactive ? 'npress' : undefined}
      style={{
        background: sunken ? 'var(--surface-sunken)' : 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: padding != null ? padding : 'var(--pad-card)',
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }} {...rest}>
      {children}
    </div>
  );
}

function SectionLabel({ children, trailing, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      margin: '0 0 10px', ...style }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: 'var(--text-secondary)' }}>{children}</div>
      {trailing}
    </div>
  );
}

function Field({ label, help, error, children, id, optional }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span>{label}</span>
          {optional && <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>Optional</span>}
        </label>
      )}
      {children}
      {error
        ? <div style={{ fontSize: 13, color: 'var(--red-flag)' }}>{error}</div>
        : help && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{help}</div>}
    </div>
  );
}

const inputBase = {
  fontFamily: 'inherit', fontSize: 17, color: 'var(--text)',
  background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border-strong)', outline: 'none',
  width: '100%', boxSizing: 'border-box',
};
function focusOn(e) { e.target.style.borderColor = 'var(--brand-deep-teal-blue)'; e.target.style.boxShadow = '0 0 0 3px var(--focus-ring)'; }
function focusOff(e) { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }

function TextInput({ id, leading, style, ...rest }) {
  if (leading) {
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)', display: 'flex', pointerEvents: 'none' }}>{leading}</span>
        <input id={id} style={{ ...inputBase, height: 56, padding: '0 14px 0 44px', ...style }}
          onFocus={focusOn} onBlur={focusOff} {...rest} />
      </div>
    );
  }
  return <input id={id} style={{ ...inputBase, height: 56, padding: '0 14px', ...style }}
    onFocus={focusOn} onBlur={focusOff} {...rest} />;
}

function Textarea({ id, rows = 4, style, ...rest }) {
  return <textarea id={id} rows={rows} style={{ ...inputBase, padding: 14, lineHeight: 1.5, resize: 'vertical', ...style }}
    onFocus={focusOn} onBlur={focusOff} {...rest} />;
}

const STATUS_META = {
  info:      { color: 'var(--info)',        soft: 'var(--info-soft)',        Icon: Ic.Info },
  note:      { color: 'var(--attention)',   soft: 'var(--attention-soft)',   Icon: Ic.Info },
  important: { color: 'var(--red-flag)',    soft: 'var(--red-flag-soft)',    Icon: Ic.Alert },
  positive:  { color: 'var(--improvement)', soft: 'var(--improvement-soft)', Icon: Ic.CheckCirc },
  mood:      { color: 'var(--mood)',        soft: 'var(--mood-soft)',        Icon: Ic.Brain },
};

function StatusPanel({ tone = 'info', title, children, filled, icon, style, action }) {
  const m = STATUS_META[tone];
  const Ico = icon || m.Icon;
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 16px',
      background: filled ? m.soft : 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
      borderLeft: `4px solid ${m.color}`, ...style,
    }}>
      <div style={{ color: m.color, flexShrink: 0, marginTop: 1 }}><Ico size={20} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3, color: 'var(--text)' }}>{title}</div>}
        <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text)' }}>{children}</div>
        {action && <div style={{ marginTop: 10 }}>{action}</div>}
      </div>
    </div>
  );
}

function Chip({ children, color, leadingDot, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 'var(--radius-xs)',
      background: 'var(--surface-sunken)', border: '1px solid var(--border)',
      fontSize: 13, fontWeight: 500, color: 'var(--text)', ...style,
    }}>
      {leadingDot && <span style={{ width: 8, height: 8, borderRadius: 99, background: color || 'var(--text-secondary)' }} />}
      {children}
    </span>
  );
}

// Selectable pill (single-tap choice). 48px tall hit area enforced via padding.
function ChoicePill({ selected, children, onClick, style }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className="npress"
      style={{
        minHeight: 48, padding: '10px 16px', borderRadius: 'var(--radius-pill)',
        fontFamily: 'inherit', fontSize: 15, fontWeight: 500, cursor: 'pointer',
        background: selected ? 'var(--brand-deep-teal-blue)' : 'var(--surface)',
        color: selected ? 'var(--text-on-brand)' : 'var(--text)',
        border: selected ? '1.5px solid var(--brand-deep-teal-blue)' : '1.5px solid var(--border-strong)',
        ...style,
      }}>{children}</button>
  );
}

function SegmentedControl({ options, value, onChange, style }) {
  return (
    <div role="tablist" style={{ display: 'flex', padding: 4, gap: 4, background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-sm)', ...style }}>
      {options.map(o => {
        const v = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const sel = v === value;
        return (
          <button key={v} role="tab" aria-selected={sel} onClick={() => onChange(v)} className="npress"
            style={{
              flex: 1, minHeight: 40, padding: '8px 10px', border: 0, borderRadius: 6,
              background: sel ? 'var(--surface)' : 'transparent',
              color: sel ? 'var(--brand-deep-teal-blue)' : 'var(--text-secondary)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: sel ? 'var(--shadow-subtle)' : 'none',
            }}>{label}</button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange, label, id }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} id={id}
      onClick={() => onChange(!checked)}
      style={{
        width: 52, height: 32, borderRadius: 999, border: 0, cursor: 'pointer', flexShrink: 0,
        background: checked ? 'var(--brand-deep-teal-blue)' : 'var(--border-strong)',
        position: 'relative', transition: 'background var(--dur-base) var(--ease)', padding: 0,
      }}>
      <span style={{
        position: 'absolute', top: 3, left: checked ? 23 : 3, width: 26, height: 26,
        borderRadius: 999, background: '#fff', transition: 'left var(--dur-base) var(--ease)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// Settings / list row with optional leading icon, title, subtitle, trailing.
function ListRow({ icon, iconBg, title, subtitle, trailing, onClick, chevron, danger, last }) {
  const clickable = !!onClick;
  return (
    <div role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={clickable ? 'npress' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 4px',
        minHeight: 56, cursor: clickable ? 'pointer' : 'default',
        borderBottom: last ? 'none' : '1px solid var(--border)',
      }}>
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: iconBg || 'var(--surface-sunken)', color: danger ? 'var(--red-flag)' : 'var(--brand-deep-teal-blue)' }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: danger ? 'var(--red-flag)' : 'var(--text)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{subtitle}</div>}
      </div>
      {trailing}
      {chevron && <span style={{ color: 'var(--text-secondary)', flexShrink: 0, display: 'flex' }}><Ic.ChevR size={20} /></span>}
    </div>
  );
}

function ProgressBar({ value, max = 100, color, height = 8 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ height, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || 'var(--brand-deep-teal-blue)',
        borderRadius: 999, transition: 'width var(--dur-base) var(--ease)' }} />
    </div>
  );
}

function Stepper({ current, total, style }) {
  return (
    <div style={{ display: 'flex', gap: 6, ...style }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          flex: 1, height: 4, borderRadius: 99,
          background: i <= current ? 'var(--brand-deep-teal-blue)' : 'var(--border-strong)',
          transition: 'background var(--dur-base) var(--ease)',
        }} />
      ))}
    </div>
  );
}

// "Self-reported — not clinically verified" — the quiet, persistent reassurance.
function SelfReportedNote({ style, compact }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)',
      fontSize: 13, lineHeight: 1.4, ...style }}>
      <Ic.ShieldChk size={15} />
      <span>Self-reported — not clinically verified{compact ? '' : '.'}</span>
    </div>
  );
}

// Persistent urgent-care line.
function UrgentLine({ style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
      borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', border: '1px solid var(--border)',
      color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.4, ...style }}>
      <span style={{ color: 'var(--red-flag)', display: 'flex', flexShrink: 0 }}><Ic.Phone size={16} /></span>
      <span>If this is an emergency, call <strong style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>999</strong>. For urgent advice, call <strong style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>111</strong>.</span>
    </div>
  );
}

Object.assign(window, {
  NB: {
    Button, Card, SectionLabel, Field, TextInput, Textarea, StatusPanel,
    Chip, ChoicePill, SegmentedControl, Toggle, ListRow, ProgressBar, Stepper,
    SelfReportedNote, UrgentLine,
  },
});
