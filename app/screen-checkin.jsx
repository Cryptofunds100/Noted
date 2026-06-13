// Daily background check-in — light, once-a-day. Smart defaults pre-populated;
// passive sleep already filled from the wearable. Never blocks; one screen.

function CheckinFlow({ onClose, onSave, onHome, sleepSource, profile }) {
  const d = DEMO.CHECKIN_DEFAULTS;
  // The user's own medications (live profile), falling back to the demo seed.
  const medsList = (profile && profile.medications) || DEMO.PATIENT.medications;
  const [sleepHours, setSleepHours] = React.useState(d.sleepHours);
  const [sleepEdited, setSleepEdited] = React.useState(false);
  const [editSleep, setEditSleep] = React.useState(false);
  const [sleepQ, setSleepQ] = React.useState(d.sleepQuality);
  const [hydration, setHydration] = React.useState(d.hydration);
  const [appetite, setAppetite] = React.useState(d.appetite);
  const [bowel, setBowel] = React.useState(d.bowel);
  const [activity, setActivity] = React.useState(d.activity);
  const [mood, setMood] = React.useState(d.mood);
  const [meds, setMeds] = React.useState(d.medsTaken);
  const [bristolOpen, setBristolOpen] = React.useState(false);

  const { Button, Card, Field, SectionLabel, StatusPanel, ChoicePill, SelfReportedNote } = NB;
  const bristol = DEMO.BRISTOL.find(b => b.type === bowel);

  return (
    <NC.OverlayScreen
      header={<NC.ScreenHeader title="Daily check-in" onClose={onClose} onHome={onHome} subtitle={DEMO.TODAY_LABEL} />}
      footer={<Button block onClick={() => onSave({ sleepHours, sleepQ, hydration, appetite, bowel, activity, mood, meds })}>Save check-in</Button>}>
      <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <StatusPanel tone="info" filled icon={Ic.Refresh}>
          {sleepSource
            ? `Most of this is filled in from yesterday and ${sleepSource.name}. Change only what's different today.`
            : "Most of this is filled in from yesterday. Connect a watch in your profile to fill sleep and activity on their own."}
        </StatusPanel>

        {/* Sleep — passive from the wearable, but always editable */}
        <div>
          <SectionLabel trailing={
            <NB.Chip leadingDot color={sleepEdited ? 'var(--attention)' : 'var(--improvement)'}
              style={{ background: 'transparent', border: 0, padding: 0 }}>
              {sleepEdited ? 'Edited' : (sleepSource ? 'Auto-filled' : 'Manual')}
            </NB.Chip>}>Sleep</SectionLabel>
          <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Ic.Bed size={22} style={{ color: 'var(--brand-deep-teal-blue)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="tnum" style={{ fontSize: 16, fontWeight: 600 }}>{fmtSleep(sleepHours)}</div>
              <div className="meta">
                {sleepEdited
                  ? 'Adjusted by you'
                  : sleepSource
                    ? `From ${sleepSource.name} · ${sleepSource.device}`
                    : 'Tap edit to add your sleep'}
              </div>
            </div>
            <NC.RoundIconButton label={editSleep ? 'Done editing sleep' : 'Edit sleep hours'} onClick={() => setEditSleep(v => !v)}>
              {editSleep ? <Ic.Check size={19} /> : <Ic.Edit size={18} />}
            </NC.RoundIconButton>
          </Card>
          {editSleep && (
            <div className="anim-fade" style={{ marginTop: 12 }}>
              <SleepStepper value={sleepHours}
                onChange={(v) => { setSleepHours(v); setSleepEdited(true); }} />
              {sleepEdited && sleepSource && (
                <button onClick={() => { setSleepHours(DEMO.PASSIVE.sleepHours); setSleepEdited(false); }}
                  className="npress" style={{ marginTop: 10, border: 0, background: 'transparent', color: 'var(--brand-deep-teal-blue)',
                    fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '4px 2px',
                    display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Ic.Refresh size={16} /> Use {sleepSource.device} reading
                </button>
              )}
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 15, marginBottom: 8 }}>How rested do you feel?</div>
            <ScalePicker value={sleepQ} onChange={setSleepQ}
              options={[{ value: 1, label: 'Not at all' }, { value: 2, label: 'A little' }, { value: 3, label: 'Okay' }, { value: 4, label: 'Well' }, { value: 5, label: 'Very well' }]} />
          </div>
        </div>

        {/* Mood */}
        <div><MoodPicker value={mood} onChange={setMood} label="How is your mood today?" /></div>

        {/* Hydration */}
        <Field label="Drinks so far" help="Roughly how many glasses of water or squash.">
          <Counter value={hydration} onChange={setHydration} unit="glasses" icon={<Ic.Droplet size={18} />} max={16} />
        </Field>

        {/* Appetite */}
        <Field label="Appetite">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Poor', 'Reduced', 'Normal', 'Increased'].map(a => (
              <ChoicePill key={a} selected={appetite === a} onClick={() => setAppetite(a)}>{a}</ChoicePill>
            ))}
          </div>
        </Field>

        {/* Bowel — Bristol */}
        <Field label="Bowel movement" help="Bristol Stool Chart — used to track gut symptoms.">
          <button onClick={() => setBristolOpen(true)} className="npress"
            style={{ height: 56, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface)', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
            <span className="tnum" style={{ fontSize: 16, color: 'var(--text)' }}>Type {bowel} · {bristol.desc}</span>
            <Ic.ChevR size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </Field>

        {/* Activity */}
        <Field label="Activity today">
          <NativeSelect value={activity} onChange={setActivity}
            options={['None', 'Light — short walk', 'Moderate — 30 min walk', 'Active — exercise', 'Very active']} />
        </Field>

        {/* Meds taken with adherence */}
        <div>
          <SectionLabel>Medications taken</SectionLabel>
          <Card padding={0}>
            {medsList.length === 0 && (
              <div className="meta" style={{ padding: '14px 16px' }}>No medications in your record.</div>
            )}
            {medsList.map((m, i, arr) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <Ic.Pill size={20} style={{ color: 'var(--brand-deep-teal-blue)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{m.name} <span className="meta">{m.dose}</span></div>
                  <div className="meta">{m.schedule}</div>
                </div>
                <NB.Toggle checked={!!meds[m.name]} onChange={(v) => setMeds(s => ({ ...s, [m.name]: v }))} label={`${m.name} taken`} />
              </div>
            ))}
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}><SelfReportedNote /></div>
      </div>

      <NC.Sheet open={bristolOpen} onClose={() => setBristolOpen(false)} title="Bristol Stool Chart">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DEMO.BRISTOL.map((b, i, arr) => (
            <button key={b.type} onClick={() => { setBowel(b.type); setBristolOpen(false); }} className="npress"
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 4px', minHeight: 56,
                border: 0, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                background: bowel === b.type ? 'var(--surface-sunken)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              <span className="tnum" style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center',
                background: 'var(--brand-deep-teal-blue)', color: 'var(--text-on-brand)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{b.type}</span>
              <span style={{ fontSize: 15, color: 'var(--text)' }}>{b.desc}</span>
              {bowel === b.type && <span style={{ marginLeft: 'auto', color: 'var(--brand-deep-teal-blue)' }}><Ic.Check size={20} /></span>}
            </button>
          ))}
        </div>
        <div className="meta" style={{ marginTop: 10 }}>Types 1–2 suggest constipation; 6–7 suggest diarrhoea. 3–4 are ideal.</div>
      </NC.Sheet>
    </NC.OverlayScreen>
  );
}

function Counter({ value, onChange, unit, icon, max = 99, min = 0 }) {
  const btn = (label, fn, disabled) => (
    <button onClick={fn} disabled={disabled} aria-label={label} className="npress"
      style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-strong)',
        background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', display: 'grid', placeItems: 'center',
        opacity: disabled ? 0.4 : 1 }}>
      {label === 'Decrease' ? <Ic.ChevD size={20} /> : <Ic.ChevU size={20} />}
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {btn('Decrease', () => onChange(Math.max(min, value - 1)), value <= min)}
      <div style={{ flex: 1, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)' }}>
        {icon && <span style={{ color: 'var(--brand-deep-teal-blue)' }}>{icon}</span>}
        <span className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>{value}</span>
        <span className="meta">{unit}</span>
      </div>
      {btn('Increase', () => onChange(Math.min(max, value + 1)), value >= max)}
    </div>
  );
}

// Format decimal hours as "5h 48m".
function fmtSleep(h) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// Sleep stepper — adjust in 15-minute steps. Big numeric readout above.
function SleepStepper({ value, onChange, min = 0, max = 16, step = 0.25 }) {
  const btn = (dir, fn, disabled) => (
    <button onClick={fn} disabled={disabled} aria-label={dir === 'down' ? 'Less sleep' : 'More sleep'} className="npress"
      style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-strong)',
        background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', display: 'grid', placeItems: 'center',
        opacity: disabled ? 0.4 : 1, flexShrink: 0 }}>
      {dir === 'down' ? <Ic.ChevD size={20} /> : <Ic.ChevU size={20} />}
    </button>
  );
  const round = (v) => Math.round(v / step) * step;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {btn('down', () => onChange(round(Math.max(min, value - step))), value <= min)}
      <div style={{ flex: 1, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)' }}>
        <Ic.Bed size={18} style={{ color: 'var(--brand-deep-teal-blue)' }} />
        <span className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>{fmtSleep(value)}</span>
        <span className="meta">slept</span>
      </div>
      {btn('up', () => onChange(round(Math.min(max, value + step))), value >= max)}
    </div>
  );
}

Object.assign(window, { CheckinFlow, Counter, SleepStepper, fmtSleep });
