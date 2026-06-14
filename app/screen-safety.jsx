// Clinical safety — red-flag prompts override product elegance. Calm, clear,
// never alarmist, never minimising. Directs to appropriate urgent care and is
// logged to the red-flag record.

function RedFlagModal({ open, payload, onClose, onLog }) {
  if (!open || !payload) return null;
  const isProm = payload.prom;
  const { Button } = NB;

  const advice = isProm
    ? {
        title: 'It’s good you told us',
        body: 'You said you’ve had thoughts of being better off dead, or of hurting yourself. You don’t have to face this alone, and help is available now.',
        actions: [
          { label: 'Call 111 — option 2', sub: 'NHS mental health crisis line', icon: Ic.Phone, primary: true, tel: '111' },
          { label: 'Text SHOUT to 85258', sub: 'Free, 24/7 text support', icon: Ic.Bell },
          { label: 'Call Samaritans 116 123', sub: 'Free, any time, day or night', icon: Ic.Phone },
        ],
      }
    : {
        title: 'This may need urgent care',
        body: `You logged ${payload.name.toLowerCase()}. Chest pain that spreads to your arm can be serious and should be checked straight away.`,
        actions: [
          { label: 'Call 999 now', sub: 'For chest pain that spreads or won’t ease', icon: Ic.Phone, primary: true, danger: true, tel: '999' },
          { label: 'Call 111', sub: 'If you’re not sure how urgent it is', icon: Ic.Phone, tel: '111' },
        ],
      };

  return (
    <NC.Modal open={open} onClose={onClose} tone="var(--red-flag)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--red-flag-soft)', color: 'var(--red-flag)', display: 'grid', placeItems: 'center' }}>
          <Ic.Alert size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>{advice.title}</h2>
          <p style={{ color: 'var(--text)', fontSize: 16, lineHeight: 1.5 }}>{advice.body}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {advice.actions.map((a, i) => (
            <a key={i} href={a.tel ? `tel:${a.tel}` : undefined} className="npress"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', minHeight: 56, textDecoration: 'none',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: a.danger ? 'var(--red-flag)' : a.primary ? 'var(--brand-deep-teal-blue)' : 'var(--surface)',
                color: (a.danger || a.primary) ? '#fff' : 'var(--text)',
                border: (a.danger || a.primary) ? 'none' : '1px solid var(--border-strong)' }}>
              <a.icon size={22} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{a.label}</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>{a.sub}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <Button variant="ghost" block size="md" onClick={onLog}>
            {isProm ? 'I’ve got support — continue' : 'I’ve got help — log this and close'}
          </Button>
          <div className="meta" style={{ textAlign: 'center', marginTop: 10 }}>
            We’ve added this to your urgent-symptom record so your clinician can see it.
          </div>
        </div>
      </div>
    </NC.Modal>
  );
}

// Red-flag log — the historical record (the user's own flagged events).
function RedFlagLogSheet({ open, onClose, entries = [] }) {
  return (
    <NC.Sheet open={open} onClose={onClose} title="Urgent-symptom record">
      <NB.StatusPanel tone="info" filled style={{ marginBottom: 16 }} icon={Ic.Flag}>
        Times Noted flagged a symptom that may need urgent care, and what you did next.
      </NB.StatusPanel>
      {entries.length === 0 && (
        <div className="meta" style={{ padding: '4px 2px 12px' }}>
          None recorded yet. If Noted ever flags a symptom that may need urgent care, it will appear here.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.map(r => (
          <NB.Card key={r.id} style={{ borderLeft: '4px solid var(--red-flag)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{r.symptom}</span>
              <span className="meta tnum">{r.date} · {r.time}</span>
            </div>
            <div className="meta" style={{ marginTop: 4 }}>Rule matched: {r.rule}</div>
            <div style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>{r.action}.</div>
            <div style={{ fontSize: 15, marginTop: 4, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.outcome}</div>
          </NB.Card>
        ))}
      </div>
      <NB.UrgentLine style={{ marginTop: 16 }} />
    </NC.Sheet>
  );
}

Object.assign(window, { RedFlagModal, RedFlagLogSheet });
