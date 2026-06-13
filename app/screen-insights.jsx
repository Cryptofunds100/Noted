// Insights — the longitudinal view. Calm visualisation, honest framing.
// Suggested patterns are EXPLICITLY observations, not diagnoses (visible, not buried).

function InsightsScreen({ openProm, openRedFlagLog, openReport, logs, goHome }) {
  const { PROMS, PATTERNS, RED_FLAGS, ADHERENCE, FUNCTION_IMPACT, SEV_TREND, SYMPTOM_FREQ } = DEMO;
  const { Card, SectionLabel, StatusPanel, Button, Chip } = NB;
  const [range, setRange] = React.useState('4w');

  // Pattern detection from the patient's real logs (falls back to demo data).
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
  const patterns = aiPatterns || PATTERNS;

  const adherencePct = Math.round(
    ADHERENCE.meds.reduce((a, m) => a + m.days.filter(Boolean).length, 0) /
    (ADHERENCE.meds.length * 7) * 100);

  return (
    <div className="screen-scroll anim-fade" style={{ paddingBottom: NC.NAV_H + NC.SAFE_BOTTOM + 96 }}>
      <NC.AppBar title="Insights" onHome={goHome}
        trailing={<NB.Button size="sm" variant="secondary" leadingIcon={<Ic.Share size={16} />} onClick={openReport}>Report</NB.Button>} />

      <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NC.DemoBadge />
          <span className="meta">Sample data — for demonstration.</span>
        </div>

        <NB.SegmentedControl value={range} onChange={setRange}
          options={[{ value: '1w', label: 'Week' }, { value: '4w', label: '4 weeks' }, { value: '3m', label: '3 months' }]} />

        {/* Severity trend */}
        <section>
          <SectionLabel>Severity over time</SectionLabel>
          <Card>
            <p style={{ fontSize: 15, marginBottom: 4 }}>Your pain severity is holding around <strong>6–7 out of 10</strong>, a little lower than last week.</p>
            <ChartLegend items={[{ label: 'This week', color: 'var(--severity-7-8)' }, { label: 'Last week', color: 'var(--text-secondary)', dashed: true }]} />
            <LineChart
              series={[
                { data: SEV_TREND.thisWeek, color: 'var(--severity-7-8)' },
                { data: SEV_TREND.lastWeek, color: 'var(--text-secondary)', dashed: true },
              ]}
              labels={SEV_TREND.labels} max={10} />
          </Card>
        </section>

        {/* Symptom frequency */}
        <section>
          <SectionLabel>How often you logged each symptom</SectionLabel>
          <Card>
            <p style={{ fontSize: 15, marginBottom: 14 }}>Back pain was your most logged symptom over the last 4 weeks.</p>
            <BarChart bars={SYMPTOM_FREQ} max={10} />
          </Card>
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {patterns.map((p, i) => (
                <Card key={i} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: 'var(--brand-deep-teal-blue)', marginTop: 1, flexShrink: 0 }}><Ic.Trend size={20} /></span>
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 500, lineHeight: 1.45 }}>{p.text}</div>
                    <div className="meta" style={{ marginTop: 4 }}>{p.basis}</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* PROM scores */}
        <section>
          <SectionLabel trailing={<span className="meta">Validated questionnaires</span>}>Your scores over time</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['phq9', 'gad7', 'peg3'].map(k => <PromCard key={k} prom={PROMS[k]} onClick={() => openProm(k)} />)}
          </div>
        </section>

        {/* Functional impact */}
        <section>
          <SectionLabel>Impact on your day</SectionLabel>
          <Card>
            <p style={{ fontSize: 15, marginBottom: 14 }}>Symptoms have most affected your <strong>exercise</strong> this period.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FUNCTION_IMPACT.map(f => (
                <div key={f.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 5 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      {f.label === 'Work' && <Ic.Footprint size={16} />}
                      {f.label === 'Exercise' && <Ic.Activity size={16} />}
                      {f.label === 'Social' && <Ic.User size={16} />}
                      {f.label === 'Sleep' && <Ic.Bed size={16} />}
                      {f.label}
                    </span>
                    <span className="tnum" style={{ color: 'var(--text-secondary)' }}>{f.value}/10</span>
                  </div>
                  <NB.ProgressBar value={f.value} max={10} color={sevHex(f.value)} />
                </div>
              ))}
            </div>
            <div className="meta" style={{ marginTop: 12 }}>Higher means more interference. Self-rated.</div>
          </Card>
        </section>

        {/* Medication adherence */}
        <section>
          <SectionLabel trailing={<span className="tnum" style={{ fontSize: 13, fontWeight: 600, color: 'var(--improvement)' }}>{adherencePct}% taken</span>}>Medication adherence</SectionLabel>
          <Card>
            <p style={{ fontSize: 15, marginBottom: 14 }}>You took most doses this week. A few evening doses were missed.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ADHERENCE.meds.map(m => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 96, fontSize: 14, fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ display: 'flex', gap: 5, flex: 1 }}>
                    {m.days.map((taken, i) => (
                      <div key={i} title={ADHERENCE.week[i]} style={{ flex: 1, aspectRatio: '1', borderRadius: 6, display: 'grid', placeItems: 'center',
                        background: taken ? 'var(--improvement-soft)' : 'var(--surface-sunken)',
                        border: taken ? '1px solid var(--improvement)' : '1px solid var(--border)',
                        color: taken ? 'var(--improvement)' : 'var(--text-secondary)' }}>
                        {taken ? <Ic.Check size={14} /> : <Ic.Close size={12} />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="tnum" style={{ display: 'flex', gap: 5, marginTop: 8, paddingLeft: 108 }}>
              {ADHERENCE.week.map(d => <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)' }}>{d[0]}</div>)}
            </div>
          </Card>
        </section>

        {/* Red-flag log */}
        <section>
          <SectionLabel>Urgent-symptom record</SectionLabel>
          <Card interactive onClick={openRedFlagLog} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--red-flag-soft)', color: 'var(--red-flag)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic.Flag size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{RED_FLAGS.length} urgent prompt{RED_FLAGS.length === 1 ? '' : 's'} recorded</div>
              <div className="meta">Times the app flagged a symptom that may need urgent care.</div>
            </div>
            <Ic.ChevR size={20} style={{ color: 'var(--text-secondary)' }} />
          </Card>
        </section>
      </div>
    </div>
  );
}

function PromCard({ prom, onClick }) {
  const data = prom.history ? prom.history.filter(h => h.score != null).map(h => h.score) : [];
  const last = prom.lastScore;
  const trendDown = data.length > 1 && data[data.length - 1] < data[0];
  return (
    <NB.Card interactive onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{prom.name}</span>
          {prom.due && <NB.Chip color="var(--attention)" leadingDot style={{ background: 'var(--attention-soft)', borderColor: 'transparent', color: 'var(--attention)' }}>{prom.dueLabel}</NB.Chip>}
        </div>
        <div className="meta" style={{ marginTop: 2 }}>{prom.full}</div>
      </div>
      {prom.kind === 'inactive' ? (
        <span className="meta">Not active</span>
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

Object.assign(window, { InsightsScreen, PromCard });
