// Today — the home dashboard. Calm, scannable: "what does today look like and
// what do I need to do?" Passive wearable data shown as already pulled.

function PassiveStat({ icon, value, unit, label, note }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: 'var(--text-secondary)', display: 'flex' }}>{icon}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span className="tnum" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{label}</div>
      {note && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{note}</div>}
    </div>
  );
}

function TodayScreen({ go, openLog, openProm, openReport, openCheckin, checkinDone, logsToday, redFlagActive, openRedFlag }) {
  const { PATIENT, PASSIVE, PROMS } = DEMO;
  const { Card, Button, SectionLabel, StatusPanel, SelfReportedNote, UrgentLine } = NB;

  // Live full date + time of day. Computed fresh on mount — so it's current
  // each time someone logs in and lands here — and ticks to stay accurate.
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const fullDate = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeOfDay = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const duePhq = PROMS.phq9;

  return (
    <div className="screen-scroll anim-fade" style={{ paddingBottom: NC.NAV_H + NC.SAFE_BOTTOM + 96 }}>
      <NC.AppBar
        subtitle={`${greeting} · ${fullDate} · ${timeOfDay}`}
        title={`Hello, ${PATIENT.firstName}`}
        trailing={<NC.RoundIconButton label="Notifications" onClick={() => go('profile')}><Ic.Bell size={20} /></NC.RoundIconButton>}
      />

      <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NC.DemoBadge />
          <NB.SelfReportedNote />
        </div>

        {/* Red-flag safety prompt — calm, non-alarming, only if triggered */}
        {redFlagActive && (
          <StatusPanel tone="important" filled title="Some symptoms need urgent care"
            icon={Ic.Alert}
            action={<Button variant="destructive" size="md" onClick={openRedFlag}>See what to do</Button>}>
            You logged chest tightness spreading to your arm. This can be serious.
          </StatusPanel>
        )}

        {/* Primary entry point — big and obvious */}
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <button onClick={() => openLog()} className="npress"
            style={{ width: '100%', textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer',
              padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: 'var(--brand-deep-teal-blue)',
              color: 'var(--text-on-brand)', display: 'grid', placeItems: 'center' }}>
              <Ic.Plus size={26} strokeWidth={2.25} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: 'var(--text)' }}>How are things right now?</div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 2 }}>Log a symptom in under 30 seconds.</div>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}><Ic.ChevR size={22} /></span>
          </button>
        </Card>

        {/* Passive data — pulled, not asked */}
        <div>
          <SectionLabel trailing={<span className="tnum" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Synced {PASSIVE.syncedAt}</span>}>
            From your Health app
          </SectionLabel>
          <Card padding={0}>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <PassiveStat icon={<Ic.Bed size={18} />} value={PASSIVE.sleepHours} unit="hrs" label="Sleep" note={PASSIVE.sleepQuality} />
              <div style={{ width: 1, background: 'var(--border)', margin: '12px 0' }} />
              <PassiveStat icon={<Ic.Activity size={18} />} value={PASSIVE.steps.toLocaleString()} label="Steps" />
              <div style={{ width: 1, background: 'var(--border)', margin: '12px 0' }} />
              <PassiveStat icon={<Ic.Heart size={18} />} value={PASSIVE.restingHr} unit="bpm" label="Resting HR" />
            </div>
          </Card>
        </div>

        {/* Daily background check-in */}
        <div>
          <SectionLabel>Today's check-in</SectionLabel>
          <Card interactive onClick={openCheckin} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0,
              background: checkinDone ? 'var(--improvement-soft)' : 'var(--surface-sunken)',
              color: checkinDone ? 'var(--improvement)' : 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center' }}>
              {checkinDone ? <Ic.CheckCirc size={22} /> : <Ic.List size={22} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{checkinDone ? 'Check-in done for today' : 'Quick daily check-in'}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                {checkinDone ? 'Thanks for logging. Tap to review.' : 'Sleep, meds, mood and more. Pre-filled from yesterday.'}
              </div>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}><Ic.ChevR size={20} /></span>
          </Card>
        </div>

        {/* Due PROM — surfaced gently */}
        {duePhq.due && (
          <div>
            <SectionLabel>Due for you</SectionLabel>
            <Card style={{ borderLeft: '4px solid var(--mood)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--mood)', marginTop: 2 }}><Ic.Brain size={22} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Your fortnightly mood check-in is ready</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.45 }}>
                    {duePhq.name} · {duePhq.full.split('—')[1].trim()}. Takes about 2 minutes.
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Button size="md" onClick={() => openProm('phq9')}>Start check-in</Button>
                    <Button size="md" variant="tertiary">Not now</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Today's logs */}
        <div>
          <SectionLabel trailing={logsToday.length > 0 ? <span className="nlink" style={{ fontSize: 14 }} onClick={() => go('insights')}>See all</span> : null}>
            Logged today
          </SectionLabel>
          {logsToday.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Ic.List size={26} /></div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Nothing logged yet today.<br />Add a symptom when you're ready.
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {logsToday.map(l => <LogCard key={l.id} log={l} onClick={() => openLog(l)} />)}
            </div>
          )}
        </div>

        <UrgentLine style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}

// Compact symptom card used across Today / Insights.
function LogCard({ log, onClick, showDate }) {
  return (
    <NB.Card interactive={!!onClick} onClick={onClick} padding={16}
      style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <SeverityDot value={log.severity} size={12} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{log.name}</span>
        </div>
        <div className="tnum" style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
          {showDate ? `${log.date} · ` : ''}{log.time} · {log.character.length ? log.character.join(', ') : log.onset}
        </div>
      </div>
      <SeverityTag value={log.severity} />
      {onClick && <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}><Ic.ChevR size={18} /></span>}
    </NB.Card>
  );
}

Object.assign(window, { TodayScreen, LogCard, PassiveStat });
