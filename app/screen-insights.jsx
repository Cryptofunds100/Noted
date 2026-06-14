// Insights — the longitudinal view. Calm visualisation, honest framing.
// Everything here is built from the user's OWN logs and completed PROMs.
// Sections show a plain empty state until there is real data to show.
// Suggested patterns are EXPLICITLY observations, not diagnoses.

function EmptyHint({ icon, children }) {
  const Icon = icon || Ic.List;
  return (
    <NB.Card style={{ textAlign: 'center', padding: '24px 20px' }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Icon size={24} /></div>
      <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{children}</div>
    </NB.Card>
  );
}

function InsightsScreen({ openProm, openRedFlagLog, openReport, logs, proms, goHome }) {
  const { PROMS } = DEMO;
  const { Card, SectionLabel, StatusPanel, Button, Chip } = NB;
  const [range, setRange] = React.useState('4w');

  const hasLogs = Array.isArray(logs) && logs.length > 0;
  const sev = severityByDay(logs);
  const freq = symptomFrequency(logs);
  const sevAvg = sev.data.length ? Math.round(sev.data.reduce((a, b) => a + b, 0) / sev.data.length) : null;
  const topSymptom = freq.length ? freq[0] : null;

  // Pattern detection from the patient's real logs.
  const [aiPatterns, setAiPatterns] = React.useState(null);
  const [aiState, setAiState] = React.useState('idle'); // idle | loading | done | error
  React.useEffect(() => {
    let alive = true;
    if (!(window.NotedAI && Array.isArray(logs) && logs.length)) return;
    setAiState('loading');
    NotedAI.detectPatterns(logs)
      .then((r) => {
        if (!alive) return;
        if (r && Array.isArray(r.patterns) && r.patterns.length) { setAiPatterns(r.patterns); setAiState('done'); }
        else setAiState('error');
      })
      .catch(() => { if (alive) setAiState('error'); });
    return () => { alive = false; };
  }, [logs]);

  return (
    <div className="screen-scroll anim-fade" style={{ paddingBottom: NC.NAV_H + NC.SAFE_BOTTOM + 96 }}>
      <NC.AppBar title="Insights" onHome={goHome}
        trailing={<NB.Button size="sm" variant="secondary" leadingIcon={<Ic.Share size={16} />} onClick={openReport}>Report</NB.Button>} />

      <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <NB.SegmentedControl value={range} onChange={setRange}
          options={[{ value: '1w', label: 'Week' }, { value: '4w', label: '4 weeks' }, { value: '3m', label: '3 months' }]} />

        {/* Severity trend */}
        <section>
          <SectionLabel>Severity over time</SectionLabel>
          {sev.days >= 2 ? (
            <Card>
              <p style={{ fontSize: 15, marginBottom: 4 }}>Your logged symptom severity is averaging <strong>{sevAvg}/10</strong> over {sev.days} days.</p>
              <LineChart series={[{ data: sev.data, color: 'var(--severity-7-8)' }]} labels={sev.labels} max={10} />
            </Card>
          ) : (
            <EmptyHint icon={Ic.Trend}>{hasLogs ? 'Log on more than one day to see your severity trend.' : 'Your severity trend appears here once you start logging symptoms.'}</EmptyHint>
          )}
        </section>

        {/* Symptom frequency */}
        <section>
          <SectionLabel>How often you logged each symptom</SectionLabel>
          {freq.length ? (
            <Card>
              <p style={{ fontSize: 15, marginBottom: 14 }}>{topSymptom.label} was your most logged symptom in this period.</p>
              <BarChart bars={freq} max={Math.max(...freq.map(b => b.value), 1)} />
            </Card>
          ) : (
            <EmptyHint icon={Ic.List}>Once you log symptoms, you'll see how often each one comes up.</EmptyHint>
          )}
        </section>

        {/* Suggested patterns — observations, NOT diagnoses */}
        <section>
          <SectionLabel trailing={aiState === 'done'
            ? <span className="meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic.Trend size={13} /> From your logs</span>
            : undefined}>Suggested patterns</SectionLabel>
          <StatusPanel tone="note" filled icon={Ic.Info} style={{ marginBottom: 10 }}>
            <strong>These are observations, not diagnoses.</strong> They show what your logs have in common. Only a clinician can diagnose.
          </StatusPanel>
          {aiState === 'loading' ? (
            <Card style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
              <span className="voice-spin" style={{ width: 18, height: 18, borderRadius: 999, border: '2px solid var(--border)', borderTopColor: 'var(--brand-deep-teal-blue)', flexShrink: 0 }} />
              <span style={{ fontSize: 15 }}>Looking for patterns in your logs…</span>
            </Card>
          ) : (aiPatterns && aiPatterns.length) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiPatterns.map((p, i) => (
                <Card key={i} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: 'var(--brand-deep-teal-blue)', marginTop: 1, flexShrink: 0 }}><Ic.Trend size={20} /></span>
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 500, lineHeight: 1.45 }}>{p.text}</div>
                    {p.basis && <div className="meta" style={{ marginTop: 4 }}>{p.basis}</div>}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyHint icon={Ic.Trend}>Keep logging — once there's enough, Noted will surface patterns in what you record.</EmptyHint>
          )}
        </section>

        {/* PROM scores */}
        <section>
          <SectionLabel trailing={<span className="meta">Validated questionnaires</span>}>Your scores over time</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['phq9', 'gad7', 'peg3'].map(k => <PromCard key={k} prom={PROMS[k]} stats={promStats(PROMS[k], proms)} onClick={() => openProm(k)} />)}
          </div>
        </section>

        {/* Functional impact — needs daily check-in data */}
        <section>
          <SectionLabel>Impact on your day</SectionLabel>
          <EmptyHint icon={Ic.Activity}>Log a few daily check-ins and you'll see how symptoms are affecting work, exercise, sleep and more.</EmptyHint>
        </section>

        {/* Medication adherence — needs daily check-in data */}
        <section>
          <SectionLabel>Medication adherence</SectionLabel>
          <EmptyHint icon={Ic.Pill}>As you record which medications you take in your daily check-ins, your adherence shows here.</EmptyHint>
        </section>

        {/* Red-flag log */}
        <section>
          <SectionLabel>Urgent-symptom record</SectionLabel>
          <Card interactive onClick={openRedFlagLog} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--red-flag-soft)', color: 'var(--red-flag)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic.Flag size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No urgent prompts recorded</div>
              <div className="meta">Times the app flags a symptom that may need urgent care will appear here.</div>
            </div>
            <Ic.ChevR size={20} style={{ color: 'var(--text-secondary)' }} />
          </Card>
        </section>
      </div>
    </div>
  );
}

function PromCard({ prom, stats, onClick }) {
  const data = (stats && stats.scores) || [];
  const last = stats ? stats.lastScore : null;
  const trendDown = data.length > 1 && data[data.length - 1] < data[0];
  return (
    <NB.Card interactive onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{prom.name}</span>
        </div>
        <div className="meta" style={{ marginTop: 2 }}>{prom.full}</div>
      </div>
      {prom.kind === 'inactive' ? (
        <span className="meta">Not active</span>
      ) : !(stats && stats.taken) ? (
        <span className="meta">Not taken yet</span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Sparkline data={data} max={prom.kind === 'numeric' ? 10 : prom.maxScore} color={trendDown ? 'var(--improvement)' : 'var(--mood)'} />
          <div style={{ textAlign: 'right' }}>
            <div className="tnum" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{last}</div>
            <div className="meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              {trendDown ? <Ic.ArrowDn size={12} style={{ color: 'var(--improvement)' }} /> : <Ic.ArrowR size={12} />} latest
            </div>
          </div>
        </div>
      )}
      <Ic.ChevR size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
    </NB.Card>
  );
}

Object.assign(window, { InsightsScreen, PromCard, EmptyHint });
