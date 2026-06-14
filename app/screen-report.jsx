// Clinical report — one page, readable in under 60 seconds. Structured like a
// clinical letter. In-app longitudinal view + a clean printable layout.
// "View as clinician" switches profession-specific emphasis.

const CLINICIAN_VIEWS = {
  patient:    { label: 'Standard', icon: 'List', lead: null },
  physio:     { label: 'Physio', icon: 'Bone', lead: 'movement' },
  dietitian:  { label: 'Dietitian', icon: 'Utensils', lead: 'gut' },
  psych:      { label: 'Psychologist', icon: 'Brain', lead: 'mood' },
};

function ReportFlow({ onClose, initialView = 'patient', onPrint, onHome, logs, profile, proms }) {
  const [view, setView] = React.useState(initialView);
  const { PROMS } = DEMO;
  // The report renders the user's own details (live profile).
  const PATIENT = { ...DEMO.PATIENT, ...(profile || {}) };
  const { Card, SectionLabel, StatusPanel, Button } = NB;

  const hasLogs = Array.isArray(logs) && logs.length > 0;
  const sev = severityByDay(logs);
  const freq = symptomFrequency(logs);
  const sevAvg = sev.data.length ? Math.round(sev.data.reduce((a, b) => a + b, 0) / sev.data.length) : null;
  const generatedOn = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const promMax = (k) => (PROMS[k].kind === 'numeric' ? PROMS[k].scaleMax : PROMS[k].maxScore);
  const promLine = (k, label) => {
    const s = promStats(PROMS[k], proms);
    if (!s.taken) return null;
    return [label, `${s.lastScore}/${promMax(k)} — ${promBand(PROMS[k], s.lastScore)} (latest)`];
  };
  const promRows = [['phq9', 'PHQ-9 (depression)'], ['gad7', 'GAD-7 (anxiety)'], ['peg3', 'PEG-3 (pain)']]
    .map(([k, label]) => { const s = promStats(PROMS[k], proms); return s.taken ? [label, `${s.lastScore}/${promMax(k)}`, promBand(PROMS[k], s.lastScore)] : null; })
    .filter(Boolean);

  // Generate the prose sections (summary, patterns) from the patient's real
  // logs. Stays absent (with honest empty copy) when AI is unavailable.
  const [ai, setAi] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    if (!(window.NotedAI && Array.isArray(logs) && logs.length)) return;
    NotedAI.generateReport({ profile, logs, proms })
      .then((r) => { if (alive && r && r.symptomSummary) setAi(r); })
      .catch(() => {});
    return () => { alive = false; };
  }, [logs]);
  const reportPatterns = (ai && Array.isArray(ai.patterns) && ai.patterns.length) ? ai.patterns : [];

  // Profession-specific "leads with" block — built only from real PROM scores.
  const leadBlock = () => {
    let pts = [];
    if (view === 'physio') pts = [promLine('peg3', 'PEG-3 pain interference')].filter(Boolean);
    else if (view === 'psych') pts = [promLine('phq9', 'PHQ-9 (depression)'), promLine('gad7', 'GAD-7 (anxiety)')].filter(Boolean);
    else return null;
    if (!pts.length) return null;
    const tone = view === 'psych' ? 'mood' : 'info';
    const icon = view === 'physio' ? Ic.Bone : Ic.Brain;
    const title = view === 'physio' ? 'For physiotherapy' : 'For psychology';
    return <ReportLead tone={tone} icon={icon} title={title} points={pts} />;
  };

  return (
    <NC.OverlayScreen
      header={<NC.ScreenHeader title="Clinical report" onClose={onClose} onHome={onHome}
        trailing={<NC.RoundIconButton label="Print or save PDF" onClick={onPrint}><Ic.Printer size={20} /></NC.RoundIconButton>} />}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="md" leadingIcon={<Ic.Printer size={18} />} onClick={onPrint}>Print / PDF</Button>
          <Button block leadingIcon={<Ic.Share size={18} />}>Share securely</Button>
        </div>
      }>
      <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Clinician view toggle */}
        <div>
          <SectionLabel>View as</SectionLabel>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="screen-scroll">
            {Object.entries(CLINICIAN_VIEWS).map(([k, v]) => {
              const Icon = Ic[v.icon];
              const sel = view === k;
              return (
                <button key={k} onClick={() => setView(k)} aria-pressed={sel} className="npress"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0 14px', height: 44, flexShrink: 0,
                    borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                    background: sel ? 'var(--brand-deep-teal-blue)' : 'var(--surface)', color: sel ? 'var(--text-on-brand)' : 'var(--text)',
                    border: sel ? '1.5px solid var(--brand-deep-teal-blue)' : '1.5px solid var(--border-strong)' }}>
                  <Icon size={16} /> {v.label}
                </button>
              );
            })}
          </div>
          {view !== 'patient' && <div className="meta" style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Ic.Eye size={14} /> Preview of what a {CLINICIAN_VIEWS[view].label.toLowerCase()} sees. Same data, their emphasis.
          </div>}
        </div>

        {/* The report sheet itself */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {/* Letterhead */}
          <div style={{ padding: '18px 20px', borderBottom: '2px solid var(--brand-deep-teal-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img src="assets/noted-wordmark.svg" alt="Noted" style={{ height: 24 }} />
              <span className="meta tnum">Generated {generatedOn}</span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{PATIENT.name || 'Your name'}</span>
            </div>
            <div className="meta tnum" style={{ marginTop: 2 }}>
              {[PATIENT.age != null && `${PATIENT.age} years`, PATIENT.sexAtBirth && `${PATIENT.sexAtBirth} at birth`, PATIENT.gender, PATIENT.pronouns].filter(Boolean).join(' · ') || 'Add your details in Profile'}
            </div>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {leadBlock()}

            {/* Summary */}
            <ReportSection title="Active conditions">
              {PATIENT.conditions.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {PATIENT.conditions.map(c => <li key={c.name} style={{ fontSize: 15 }}>{c.name}{c.code ? <span className="meta tnum"> ({c.code})</span> : null}</li>)}
                </ul>
              ) : <div className="meta">None recorded.</div>}
            </ReportSection>

            <ReportSection title="Current medications">
              {PATIENT.medications.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {PATIENT.medications.map(m => <li key={m.name} style={{ fontSize: 15 }}>{[m.name, m.dose].filter(Boolean).join(' ')}{m.schedule ? ` — ${m.schedule.toLowerCase()}` : ''}</li>)}
                </ul>
              ) : <div className="meta">None recorded.</div>}
            </ReportSection>

            <ReportSection title="Allergies">
              <div style={{ fontSize: 15 }}>{PATIENT.allergies.length ? PATIENT.allergies.map(a => `${a.name}${a.reaction ? ` (${a.reaction.toLowerCase()})` : ''}`).join('; ') : <span className="meta">None recorded.</span>}</div>
            </ReportSection>

            {/* Symptom summary */}
            <ReportSection title="Symptom frequency & pattern">
              {hasLogs ? (
                <React.Fragment>
                  <div style={{ fontSize: 15, lineHeight: 1.5 }}>
                    {ai && ai.symptomSummary
                      ? ai.symptomSummary
                      : `${freq.map(f => `${f.label} logged ${f.value}×`).join(', ')}${sevAvg != null ? `. Severity averaging ${sevAvg}/10.` : '.'}`}
                  </div>
                  {sev.days >= 2 && (
                    <div style={{ marginTop: 12 }}>
                      <LineChart series={[{ data: sev.data, color: 'var(--severity-7-8)' }]} labels={sev.labels} max={10} height={110} />
                    </div>
                  )}
                </React.Fragment>
              ) : <div className="meta">No symptoms logged yet — log some to build the clinical picture.</div>}
            </ReportSection>

            {/* PROMs table */}
            <ReportSection title="Outcome measures (PROMs)">
              {promRows.length ? <ReportTable rows={promRows} /> : <div className="meta">No questionnaires completed yet.</div>}
            </ReportSection>

            {/* Suggested patterns */}
            {reportPatterns.length > 0 && (
              <ReportSection title="Suggested patterns">
                <div style={{ padding: '8px 12px', background: 'var(--attention-soft)', borderRadius: 6, marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--attention)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Ic.Info size={14} /> Observations from self-logged data — not diagnoses
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {reportPatterns.map((p, i) => <li key={i} style={{ fontSize: 15, lineHeight: 1.45 }}>{p.text}</li>)}
                </ul>
              </ReportSection>
            )}

            {/* Red-flag log */}
            <ReportSection title="Urgent-symptom record">
              <div className="meta">None recorded.</div>
            </ReportSection>

            {/* Footer / SNOMED + disclaimer */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PATIENT.conditions.some(c => c.code) && (
                <div className="meta">
                  <strong>SNOMED CT mapping:</strong>{' '}
                  {PATIENT.conditions.map(c => c.code).filter(Boolean).join(', ')}.
                </div>
              )}
              <StatusPanel tone="important" icon={Ic.ShieldChk}>
                <strong>Self-reported — clinical verification required.</strong> This summary is built from the patient's own logs and is not a diagnosis.
              </StatusPanel>
            </div>
          </div>
        </div>
      </div>
    </NC.OverlayScreen>
  );
}

function ReportLead({ tone, icon: Icon, title, points }) {
  return (
    <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: tone === 'mood' ? 'var(--mood-soft)' : 'var(--info-soft)',
      border: `1px solid ${tone === 'mood' ? 'var(--mood)' : 'var(--info)'}`, borderLeftWidth: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: tone === 'mood' ? 'var(--mood)' : 'var(--info)', fontWeight: 700, fontSize: 15 }}>
        <Icon size={18} /> {title} — leads with
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {points.map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14.5, lineHeight: 1.4 }}>
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{k}</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportSection({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--brand-deep-teal-blue)', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function ReportTable({ rows }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 1fr', gap: 8, padding: '10px 12px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 14.5, alignItems: 'center',
          background: i % 2 ? 'var(--surface-sunken)' : 'transparent' }}>
          <span>{r[0]}</span>
          <span className="tnum" style={{ fontWeight: 700 }}>{r[1]}</span>
          <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>{r[2]}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { ReportFlow, CLINICIAN_VIEWS, ReportSection, ReportTable });
