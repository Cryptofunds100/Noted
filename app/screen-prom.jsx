// PROMs — validated outcome measures as clean questionnaire flows. PHQ-9, GAD-7
// (option scales), PEG-3 (0–10 numeric). Scored, banded, honest framing.
// PHQ-9 item 9 (self-harm) triggers a calm safety response.

function promBand(prom, score) {
  const b = (prom.bands || []).find(x => score <= x.max);
  return b ? b.label : '';
}

function PromFlow({ promKey, onClose, onComplete, onRedFlag, onHome }) {
  const prom = DEMO.PROMS[promKey];
  const [step, setStep] = React.useState(0); // 0..n-1 questions, then n = result
  const [answers, setAnswers] = React.useState(Array(prom.items.length).fill(null));
  const total = prom.items.length;
  const answered = answers[step] != null;
  const allDone = answers.every(a => a != null);

  const { Button, Card, StatusPanel, SelfReportedNote, Stepper } = NB;

  const setAns = (v) => {
    const next = [...answers]; next[step] = v; setAnswers(next);
    // auto-advance for option scales after a short beat (feels fast)
    if (prom.kind === 'options' && step < total - 1) {
      setTimeout(() => setStep(s => Math.min(total, s + 1)), 220);
    }
  };

  const score = answers.reduce((a, b) => a + (b || 0), 0);
  const displayScore = prom.kind === 'numeric' ? (score / total).toFixed(1) : score;
  const band = promBand(prom, prom.kind === 'numeric' ? score / total : score);

  // PHQ-9 item 9 safety net
  const phq9SelfHarm = promKey === 'phq9' && answers[8] != null && answers[8] >= 1;

  const finishToResult = () => {
    if (phq9SelfHarm) { onRedFlag({ name: 'PHQ-9 item 9 — thoughts of self-harm', prom: true }); return; }
    setStep(total);
  };

  // ----- Result screen -----
  if (step === total) {
    return (
      <NC.OverlayScreen
        header={<NC.ScreenHeader title={`${prom.name} result`} onClose={onClose} onHome={onHome} />}
        footer={<Button block onClick={() => onComplete(promKey, prom.kind === 'numeric' ? score / total : score)}>Add to my record</Button>}>
        <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div className="meta" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{prom.full}</div>
            <div className="tnum" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, color: 'var(--text)' }}>{displayScore}</div>
            <div className="meta tnum" style={{ marginTop: 4 }}>out of {prom.kind === 'numeric' ? prom.scaleMax : prom.maxScore}</div>
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
              background: 'var(--mood-soft)', color: 'var(--mood)', fontWeight: 600, fontSize: 15 }}>
              <Ic.Brain size={16} /> {band}
            </div>
          </Card>

          <StatusPanel tone="info" title="What this score means">
            This is a recognised questionnaire. The score helps you and your clinician see change over time. It is not a diagnosis.
          </StatusPanel>

          {prom.history && prom.history.filter(h => h.score != null).length > 1 && (
            <Card>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Your {prom.name} over time</div>
              <div className="meta" style={{ marginBottom: 14 }}>
                Lower is better. Your scores have eased from {prom.history.find(h=>h.score!=null).score} to {displayScore} since April.
              </div>
              <LineChart
                series={[{ data: [...prom.history.filter(h => h.score != null).map(h => h.score), prom.kind === 'numeric' ? score / total : score], color: 'var(--mood)' }]}
                labels={[...prom.history.filter(h => h.score != null).map(h => h.date), 'Now']}
                max={prom.kind === 'numeric' ? 10 : prom.maxScore}
                yTicks={prom.kind === 'numeric' ? [10, 5, 0] : [prom.maxScore, Math.round(prom.maxScore / 2), 0]} />
            </Card>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}><SelfReportedNote /></div>
        </div>
      </NC.OverlayScreen>
    );
  }

  // ----- Question screen -----
  const item = prom.items[step];
  const qText = prom.kind === 'numeric' ? item.q : item;

  return (
    <NC.OverlayScreen
      header={
        <div style={{ paddingTop: 'var(--safe-top)', paddingBottom: 12, paddingLeft: 12, paddingRight: 12, background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 40, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)} aria-label="Back" className="npress"
                style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'transparent', color: 'var(--text)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <Ic.ChevL size={26} />
              </button>
              {onHome && <NC.HomeButton onClick={onHome} />}
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{prom.name}</div>
              <div className="meta tnum">Question {step + 1} of {total}</div>
            </div>
            <button onClick={onClose} aria-label="Close" className="npress"
              style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'transparent', color: 'var(--text)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Ic.Close size={22} />
            </button>
          </div>
          <div style={{ padding: '0 4px' }}><Stepper current={step} total={total} /></div>
        </div>
      }
      footer={
        <Button block disabled={!answered} onClick={step === total - 1 ? finishToResult : () => setStep(s => s + 1)}>
          {step === total - 1 ? 'See result' : 'Next'}
        </Button>
      }>
      <div className="anim-fade" key={step} style={{ padding: '24px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {prom.kind === 'options' && step === 0 && (
          <div className="meta">Over the last 2 weeks, how often have you been bothered by the following?</div>
        )}
        <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.35, color: 'var(--text)' }}>{qText}</div>

        {prom.kind === 'options' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prom.options.map(o => {
              const sel = answers[step] === o.value;
              return (
                <button key={o.value} onClick={() => setAns(o.value)} aria-pressed={sel} className="npress"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0 18px', minHeight: 56,
                    border: sel ? '1.5px solid var(--brand-deep-teal-blue)' : '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    background: sel ? 'var(--primary-tint, var(--surface-sunken))' : 'var(--surface)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)' }}>{o.label}</span>
                  <span style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                    border: sel ? '7px solid var(--brand-deep-teal-blue)' : '2px solid var(--border-strong)', background: 'var(--surface)' }} />
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="tnum" style={{ textAlign: 'center', fontSize: 56, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>
              {answers[step] != null ? answers[step] : '–'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 4, marginTop: 10 }}>
              {Array.from({ length: 11 }).map((_, n) => {
                const sel = answers[step] === n;
                return (
                  <button key={n} onClick={() => setAns(n)} aria-label={`${n}`} className="npress tnum"
                    style={{ minHeight: 48, borderRadius: 8, border: sel ? '1.5px solid var(--brand-deep-teal-blue)' : '1px solid var(--border)',
                      background: sel ? 'var(--brand-deep-teal-blue)' : 'var(--surface)', color: sel ? 'var(--text-on-brand)' : 'var(--text)',
                      fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
                );
              })}
            </div>
            <div className="meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span>{item.low}</span><span>{item.high}</span>
            </div>
          </div>
        )}
      </div>
    </NC.OverlayScreen>
  );
}

Object.assign(window, { PromFlow, promBand });
