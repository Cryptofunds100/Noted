// Noted — app chrome: nav bar, bottom tabs, FAB, sheets, modal, small bits.
// Safe-area constants tuned to the iOS frame (status bar + home indicator).

const SAFE_TOP = 62;
const SAFE_BOTTOM = 30;
const NAV_H = 64;

const NAV_TABS = [
  { id: 'today', label: 'Today', Icon: Ic.Home },
  { id: 'log', label: 'Log', Icon: Ic.Plus },
  { id: 'insights', label: 'Insights', Icon: Ic.Trend },
  { id: 'profile', label: 'Profile', Icon: Ic.User },
];

function BottomNav({ active, onChange }) {
  return (
    <nav aria-label="Main" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      height: `calc(${NAV_H}px + var(--safe-bottom))`, paddingBottom: 'var(--safe-bottom)',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      background: 'var(--surface)', borderTop: '1px solid var(--border)',
    }}>
      {NAV_TABS.map(({ id, label, Icon }) => {
        const sel = active === id;
        return (
          <button key={id} onClick={() => onChange(id)} aria-current={sel ? 'page' : undefined} aria-label={label}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, border: 0, background: 'transparent', cursor: 'pointer',
              color: sel ? 'var(--brand-deep-teal-blue)' : 'var(--text-secondary)',
              fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600,
            }}>
            <Icon size={24} strokeWidth={sel ? 2 : 1.75} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

// Persistent floating "Log symptom" action, sits above the bottom nav.
function FAB({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Log a symptom"
      style={{
        position: 'absolute', right: 18, bottom: `calc(${NAV_H}px + var(--safe-bottom) + 16px)`, zIndex: 31,
        height: 56, paddingLeft: 18, paddingRight: 22, borderRadius: 999, border: 0, cursor: 'pointer',
        background: 'var(--brand-deep-teal-blue)', color: 'var(--text-on-brand)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
        boxShadow: '0 2px 10px rgba(11,92,107,0.35)',
      }}>
      <Ic.Plus size={22} strokeWidth={2.25} />
      Log
    </button>
  );
}

// Persistent "return to home" control — top-left across the whole app.
// Sentence-case label + house icon. Calm pill, no shadow.
function HomeButton({ onClick, style }) {
  return (
    <button onClick={onClick} aria-label="Go to home" className="npress"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 40,
        padding: '0 14px 0 11px', borderRadius: 999, flexShrink: 0,
        border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, ...style,
      }}>
      <Ic.Home size={18} /> Home
    </button>
  );
}

// Header for a tab screen — large title that scrolls with content.
function AppBar({ title, subtitle, trailing, leading, onHome }) {
  return (
    <div style={{ padding: 'var(--safe-top) 20px 8px' }}>
      {onHome && (
        <div style={{ display: 'flex', marginBottom: 12 }}>
          <HomeButton onClick={onHome} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {subtitle && <div className="tnum" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 2 }}>{subtitle}</div>}
          <h1 style={{ fontSize: 28, lineHeight: 1.15 }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginTop: subtitle ? 18 : 2 }}>
          {leading}{trailing}
        </div>
      </div>
    </div>
  );
}

function RoundIconButton({ onClick, label, children, active }) {
  return (
    <button onClick={onClick} aria-label={label} aria-pressed={active}
      className="npress"
      style={{
        width: 44, height: 44, borderRadius: 999, cursor: 'pointer',
        border: '1px solid var(--border)', background: active ? 'var(--primary-tint, var(--surface-sunken))' : 'var(--surface)',
        color: active ? 'var(--brand-deep-teal-blue)' : 'var(--text)',
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>{children}</button>
  );
}

// Header for an overlay/flow screen — back chevron + centred title.
function ScreenHeader({ title, onBack, onClose, onHome, trailing, sticky = true, subtitle }) {
  const leftCluster = onBack || onHome;
  return (
    <div style={{
      position: sticky ? 'sticky' : 'static', top: 0, zIndex: 20,
      paddingTop: 'var(--safe-top)', paddingBottom: 12, paddingLeft: 12, paddingRight: 12,
      background: 'var(--bg)', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 40 }}>
        {leftCluster && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {onBack && (
              <button onClick={onBack} aria-label="Back" className="npress"
                style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'transparent',
                  color: 'var(--text)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Ic.ChevL size={26} />
              </button>
            )}
            {onHome && <HomeButton onClick={onHome} />}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, textAlign: leftCluster ? 'left' : 'center', paddingLeft: leftCluster ? 4 : 8 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{subtitle}</div>}
        </div>
        {trailing
          ? <div style={{ flexShrink: 0, display: 'flex', gap: 4 }}>{trailing}</div>
          : onClose
            ? <button onClick={onClose} aria-label="Close" className="npress"
                style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'transparent',
                  color: 'var(--text)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Ic.Close size={22} />
              </button>
            : <div style={{ width: 40, flexShrink: 0 }} />}
      </div>
    </div>
  );
}

// Full-screen overlay scaffold for flows (onboarding, log, report…).
function OverlayScreen({ children, header, footer }) {
  return (
    <div className="anim-screen" style={{
      position: 'absolute', inset: 0, zIndex: 40, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      {header}
      <div className="screen-scroll" style={{ flex: 1 }}>{children}</div>
      {footer && (
        <div style={{ padding: `12px 20px calc(var(--safe-bottom) + 12px)`, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// Esc-to-close support for layered dialogs. A simple stack so Escape only
// dismisses the topmost open sheet/modal (e.g. the item editor, not the
// record sheet underneath it).
const __dialogStack = [];
function useEscClose(open, onClose) {
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    if (!open) return;
    const entry = {};
    __dialogStack.push(entry);
    const onKey = (e) => {
      if (e.key === 'Escape' && __dialogStack[__dialogStack.length - 1] === entry) {
        e.stopPropagation();
        closeRef.current && closeRef.current();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      const i = __dialogStack.indexOf(entry);
      if (i >= 0) __dialogStack.splice(i, 1);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
}

// Bottom sheet modal.
function Sheet({ open, onClose, title, children, maxHeight = '86%' }) {
  useEscClose(open, onClose);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      onClick={onClose}
      style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div className="anim-fade" style={{ position: 'absolute', inset: 0, background: 'rgba(15,26,36,0.45)' }} />
      <div className="anim-sheet" onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', background: 'var(--surface)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
          maxHeight, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sheet)', overflow: 'hidden',
        }}>
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--border-strong)' }} />
        </div>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 12px', flexShrink: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 600 }}>{title}</div>
            <button onClick={onClose} aria-label="Close" className="npress"
              style={{ width: 36, height: 36, borderRadius: 999, border: 0, background: 'var(--surface-sunken)', color: 'var(--text)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Ic.Close size={20} />
            </button>
          </div>
        )}
        <div className="screen-scroll" style={{ padding: `0 20px calc(var(--safe-bottom) + 16px)` }}>{children}</div>
      </div>
    </div>
  );
}

// Centred confirmation modal (used for red-flag, destructive actions).
function Modal({ open, onClose, children, tone }) {
  useEscClose(open, onClose);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="anim-fade" style={{ position: 'absolute', inset: 0, background: 'rgba(15,26,36,0.5)' }} />
      <div className="anim-screen" onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: 340, background: 'var(--surface)',
          borderRadius: 'var(--radius-md)', padding: 22, boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          borderTop: tone ? `4px solid ${tone}` : undefined }}>
        {children}
      </div>
    </div>
  );
}

// Toast — small confirmation, auto-dismiss.
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div aria-live="polite" style={{
      position: 'absolute', left: 20, right: 20, bottom: `calc(${NAV_H}px + var(--safe-bottom) + 84px)`, zIndex: 80,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div className="anim-fade" style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 18px',
        background: 'var(--text)', color: 'var(--bg)', borderRadius: 999, fontSize: 15, fontWeight: 500,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)', maxWidth: '100%',
      }}>
        <span style={{ color: 'var(--improvement)', display: 'flex' }}><Ic.CheckCirc size={18} /></span>
        {toast}
      </div>
    </div>
  );
}

Object.assign(window, {
  NC: { SAFE_TOP, SAFE_BOTTOM, NAV_H, BottomNav, FAB, AppBar, HomeButton, RoundIconButton, ScreenHeader, OverlayScreen, Sheet, Modal, Toast },
});
