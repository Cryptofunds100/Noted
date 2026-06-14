// Charts — line / bar, brand palette only. A plain-language summary always sits
// ABOVE the chart in the screen; the chart itself stays honest and unadorned.

function ChartLegend({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: it.dashed ? 0 : 10, borderRadius: 2, background: it.dashed ? 'transparent' : it.color,
            borderTop: it.dashed ? `2px dashed ${it.color}` : undefined }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

// series: [{ data:[numbers], color, dashed }]
function LineChart({ series, labels, max = 10, height = 150, yTicks = [10, 5, 0] }) {
  const W = 280, H = 130, padL = 6, padR = 6;
  const n = labels.length;
  const stepX = (W - padL - padR) / (n - 1);
  const toX = (i) => padL + i * stepX;
  const toY = (v) => H - (v / max) * (H - 10) - 4;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 8 }}>
      <div className="tnum" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--text-secondary)', padding: '2px 0', height }}>
        {yTicks.map(t => <span key={t}>{t}</span>)}
      </div>
      <div>
        <div style={{ position: 'relative', height, borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          {yTicks.map((t, i) => i < yTicks.length - 1 && (
            <div key={t} style={{ position: 'absolute', left: 0, right: 0, top: `${(i / (yTicks.length - 1)) * 100}%`, borderTop: '1px dashed var(--border)' }} />
          ))}
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {series.map((s, si) => (
              <polyline key={si} fill="none" stroke={s.color} strokeWidth={s.dashed ? 2 : 2.5}
                strokeDasharray={s.dashed ? '5 4' : undefined}
                strokeLinecap="round" strokeLinejoin="round"
                points={s.data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')} />
            ))}
            {series.filter(s => !s.dashed).map((s, si) => (
              <g key={si} fill={s.color}>
                {s.data.map((v, i) => <circle key={i} cx={toX(i)} cy={toY(v)} r="3" />)}
              </g>
            ))}
          </svg>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, textAlign: 'center' }}>
          {labels.map((d, i) => <span key={i}>{d}</span>)}
        </div>
      </div>
    </div>
  );
}

// bars: [{ label, value, color, caption }]
function BarChart({ bars, max = 10, height = 130, unit }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, borderBottom: '1px solid var(--border)' }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
            <div className="tnum" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{b.value}{unit || ''}</div>
            <div style={{ width: '100%', maxWidth: 30, height: `${Math.max(2, (b.value / max) * 100)}%`,
              background: b.color || 'var(--brand-deep-teal-blue)', borderRadius: '4px 4px 0 0' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11.5, color: 'var(--text-secondary)' }}>{b.label}</div>
        ))}
      </div>
    </div>
  );
}

// Tiny inline sparkline.
function Sparkline({ data, color = 'var(--brand-deep-teal-blue)', max = 10, width = 64, height = 22 }) {
  if (!data || data.length < 2) return null;
  const stepX = width / (data.length - 1);
  const toY = (v) => height - (v / max) * (height - 3) - 1.5;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ display: 'block' }}>
      <polyline fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
        points={data.map((v, i) => `${i * stepX},${toY(v)}`).join(' ')} />
    </svg>
  );
}

// ---- Real-data analytics helpers ------------------------------------------
// Derive chart inputs from the user's own logs / completed PROMs. Each returns
// an empty-but-safe shape so screens can render honest empty states.

const _fmtDay = (dk, opts) => {
  const d = new Date(dk);
  return isNaN(d) ? String(dk) : d.toLocaleDateString('en-GB', opts);
};

// A PROM's score history from completed entries → { points, scores, lastScore, taken }.
function promStats(promDef, promEntries) {
  const mine = (promEntries || [])
    .filter(e => e && e.key === promDef.key && e.score != null)
    .slice()
    .sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
  const points = mine.map(e => ({ date: _fmtDay(e.dateKey, { day: 'numeric', month: 'short' }), score: e.score }));
  const scores = points.map(p => p.score);
  return { points, scores, lastScore: scores.length ? scores[scores.length - 1] : null, taken: scores.length > 0 };
}

// Daily max symptom severity from logs → { labels, data, days } oldest→newest.
function severityByDay(logs) {
  const byDay = {};
  (logs || []).forEach(l => {
    if (l == null || l.severity == null || !l.dateKey) return;
    byDay[l.dateKey] = Math.max(byDay[l.dateKey] || 0, l.severity);
  });
  const keys = Object.keys(byDay).sort();
  return { labels: keys.map(k => _fmtDay(k, { weekday: 'short' })), data: keys.map(k => byDay[k]), days: keys.length };
}

// Symptom frequency bars from logs (top 6 by count), coloured by avg severity.
function symptomFrequency(logs) {
  const counts = {}, sevSum = {};
  (logs || []).forEach(l => {
    if (!l || !l.name) return;
    counts[l.name] = (counts[l.name] || 0) + 1;
    sevSum[l.name] = (sevSum[l.name] || 0) + (l.severity || 0);
  });
  const names = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 6);
  const sev = (typeof sevHex === 'function') ? sevHex : () => 'var(--brand-deep-teal-blue)';
  return names.map(n => ({ label: n.split(' ')[0], value: counts[n], color: sev(Math.round(sevSum[n] / counts[n])) }));
}

Object.assign(window, { ChartLegend, LineChart, BarChart, Sparkline, promStats, severityByDay, symptomFrequency });
