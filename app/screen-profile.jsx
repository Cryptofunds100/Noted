// Profile — data ownership and granular sharing. Patient decides what each
// professional type can see for sensitive categories. Theme + accessibility +
// delete-audio + data-deletion controls. NHS App / GP Connect shown as "connect".

// ── Reminder preferences (synced to the push backend) ───────────────────────
const REM_KEY = 'noted:reminderPrefs';
const REM_DEFAULT_TIMES = {
  1: ['20:00'],
  2: ['09:00', '20:00'],
  3: ['09:00', '14:00', '20:00'],
  4: ['09:00', '12:00', '14:00', '20:00'],
};
const REM_DEFAULTS = { enabled: false, count: 1, times: ['20:00'], smartSkip: true };

function reconcileReminderTimes(p) {
  const count = Math.min(4, Math.max(1, p.count || 1));
  const times = (p.times || []).slice(0, count);
  const defs = REM_DEFAULT_TIMES[count];
  while (times.length < count) times.push(defs[times.length] || '20:00');
  return { ...p, count, times };
}
function loadReminderPrefs() {
  try {
    const raw = localStorage.getItem(REM_KEY);
    if (raw) return reconcileReminderTimes({ ...REM_DEFAULTS, ...JSON.parse(raw) });
    if (localStorage.getItem('noted:reminders') === 'on') {
      return reconcileReminderTimes({ ...REM_DEFAULTS, enabled: true });
    }
  } catch (e) { /* ignore */ }
  return { ...REM_DEFAULTS };
}
function saveReminderPrefs(p) { try { localStorage.setItem(REM_KEY, JSON.stringify(p)); } catch (e) {} }

function prettyTime(t) {
  const [h, m] = (t || '20:00').split(':').map(Number);
  const ap = h < 12 ? 'am' : 'pm';
  let hh = h % 12; if (hh === 0) hh = 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`;
}
function localTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London'; }
  catch (e) { return 'Europe/London'; }
}

// A single illustrated step in the iOS "add to Home Screen" walkthrough.
function WalkStep({ n, icon, children, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <div className="tnum" style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--brand-deep-teal-blue)',
        color: 'var(--text-on-brand)', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{n}</div>
      <div style={{ flex: 1, fontSize: 15, lineHeight: 1.45, color: 'var(--text)' }}>{children}</div>
      <span style={{ color: 'var(--text-secondary)', flexShrink: 0, display: 'flex' }}>{icon}</span>
    </div>
  );
}

// Large, accessible time picker (native input → proper mobile pickers).
function TimeField({ value, onChange, label, dark }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input type="time" value={value} aria-label={label} step="300"
      onChange={(e) => { if (e.target.value) onChange(e.target.value); }}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        fontFamily: 'inherit', fontSize: 18, fontWeight: 600, color: 'var(--text)',
        background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
        border: `1.5px solid ${focus ? 'var(--brand-deep-teal-blue)' : 'var(--border-strong)'}`,
        boxShadow: focus ? '0 0 0 3px var(--focus-ring)' : 'none',
        height: 56, padding: '0 14px', minWidth: 138,
        fontVariantNumeric: 'tabular-nums', outline: 'none',
        colorScheme: dark ? 'dark' : 'light',
      }} />
  );
}

// Reminders — master toggle, quantity, per-reminder times, smart skip, and the
// permission / install states for each platform. Talks to window.NotedPWA and
// syncs preferences to the push backend so reminders fire while the app is shut.
function RemindersSection({ showToast, lastLogDate, theme }) {
  const { Card, SectionLabel, ListRow, StatusPanel, Button, Toggle, SegmentedControl } = NB;
  const PWA = typeof window !== 'undefined' ? window.NotedPWA : null;

  const supported = PWA ? PWA.notificationsSupported() : false;
  const standalone = PWA ? PWA.isStandalone() : false;
  const iosSafari = PWA ? PWA.isIOSSafari() : false;
  const ios = PWA ? PWA.isIOS() : false;
  const configured = PWA ? PWA.pushConfigured() : false;

  const [prefs, setPrefs] = React.useState(loadReminderPrefs);
  const [perm, setPerm] = React.useState(() => PWA ? PWA.notificationPermission() : 'unsupported');
  const [installable, setInstallable] = React.useState(() => PWA ? PWA.installable : false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const onInstallable = () => setInstallable(true);
    const onInstalled = () => setInstallable(false);
    window.addEventListener('noted:installable', onInstallable);
    window.addEventListener('noted:installed', onInstalled);
    return () => {
      window.removeEventListener('noted:installable', onInstallable);
      window.removeEventListener('noted:installed', onInstalled);
    };
  }, []);

  const payload = (p) => ({ ...p, timezone: localTimezone(), lastLogDate: lastLogDate || null });

  // Keep the server's smart-skip view fresh as new logs arrive.
  React.useEffect(() => {
    if (prefs.enabled && perm === 'granted' && PWA) PWA.syncReminders(payload(prefs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastLogDate]);

  const persist = (next) => {
    saveReminderPrefs(next);
    if (!PWA) return;
    if (next.enabled && perm === 'granted') PWA.syncReminders(payload(next));
    else if (!next.enabled) PWA.disableReminders();
  };

  const update = (patch) => {
    setPrefs((prev) => {
      const next = reconcileReminderTimes({ ...prev, ...patch });
      persist(next);
      return next;
    });
  };

  // Changing the count loads that count's sensible default times (1 = 8pm,
  // 2 = 9am+8pm, 3 adds 2pm, 4 adds 12pm). Individual times stay editable below.
  const setCount = (count) => {
    setPrefs((prev) => {
      const next = { ...prev, count, times: (REM_DEFAULT_TIMES[count] || ['20:00']).slice() };
      persist(next);
      return next;
    });
  };

  const setTimeAt = (i, val) => {
    setPrefs((prev) => {
      const times = prev.times.slice(); times[i] = val;
      const next = { ...prev, times };
      saveReminderPrefs(next);
      if (next.enabled && perm === 'granted' && PWA) PWA.syncReminders(payload(next));
      return next;
    });
  };

  const granted = perm === 'granted';
  const on = prefs.enabled;

  const toggleMaster = (next) => {
    if (!next) { update({ enabled: false }); showToast && showToast('Reminders turned off.'); return; }
    update({ enabled: true });
    if (granted) showToast && showToast('Reminders are on.');
  };

  const allow = async () => {
    if (!PWA) return;
    setBusy(true);
    const result = await PWA.requestPermission();
    setPerm(PWA.notificationPermission());
    if (result === 'granted') {
      if (!prefs.enabled) update({ enabled: true });
      const r = await PWA.syncReminders(payload({ ...prefs, enabled: true }));
      showToast && showToast(r && r.local ? 'Notifications are on for this device.' : 'Notifications are on.');
    } else if (result === 'denied') {
      showToast && showToast('Notifications are blocked in your settings.');
    }
    setBusy(false);
  };

  const test = async () => {
    if (!PWA) return;
    setBusy(true);
    const r = await PWA.sendTest(payload(prefs));
    setBusy(false);
    showToast && showToast(
      r && r.ok ? (r.server ? 'Sent a test push.' : 'Sent a test notification.')
                : (r && r.message) || 'Turn on notifications first.');
  };

  const install = async () => {
    const outcome = PWA ? await PWA.promptInstall() : 'unavailable';
    if (outcome === 'accepted') showToast && showToast('Adding Noted to your home screen…');
  };

  const masterSubtitle = !on ? 'A gentle nudge at the times you choose'
    : granted ? 'On — we’ll remind you at the times below'
    : 'Turn on notifications below to start';

  // iOS Safari, not yet installed → walkthrough instead of a broken toggle.
  const needsIOSInstall = supported && iosSafari && !standalone;

  return (
    <section>
      <SectionLabel>Reminders</SectionLabel>

      {!supported && (
        <Card>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: 'var(--text-secondary)', marginTop: 1, flexShrink: 0 }}><Ic.Bell size={20} /></span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Reminders aren’t available here</div>
              <div className="meta" style={{ marginTop: 2 }}>This browser can’t show reminder notifications. Try Chrome or Samsung Internet on Android, or Safari on an up-to-date iPhone.</div>
            </div>
          </div>
        </Card>
      )}

      {needsIOSInstall && (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 18px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-sunken)',
              color: 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ic.Bell size={20} /></div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Add Noted to your Home Screen</div>
              <div className="meta" style={{ marginTop: 2 }}>On iPhone, reminders work once Noted is on your Home Screen. It only takes a moment.</div>
            </div>
          </div>
          <div style={{ padding: '6px 18px 18px' }}>
            <WalkStep n={1} icon={<Ic.Share size={18} />}>Tap the <strong>Share</strong> button in Safari’s toolbar.</WalkStep>
            <WalkStep n={2} icon={<Ic.Plus size={18} />}>Scroll down and choose <strong>Add to Home Screen</strong>.</WalkStep>
            <WalkStep n={3} icon={<Ic.CheckCirc size={18} />} last>Open Noted from your Home Screen, then turn on reminders here.</WalkStep>
          </div>
        </Card>
      )}

      {supported && !needsIOSInstall && (
        <React.Fragment>
          <Card padding={0} style={{ padding: '0 16px' }}>
            <ListRow icon={<Ic.Bell size={20} />} title="Remind me to log my symptoms"
              subtitle={masterSubtitle} last
              trailing={<Toggle checked={on} onChange={toggleMaster} label="Remind me to log my symptoms" id="reminders-toggle" />} />
          </Card>

          {on && !granted && perm !== 'denied' && (
            <StatusPanel tone="info" filled icon={Ic.Bell} title="One quick step" style={{ marginTop: 12 }}>
              We’ll send a short reminder at the times you choose. You can change or stop these any time.
              <div style={{ marginTop: 12 }}>
                <Button size="md" onClick={allow} disabled={busy} leadingIcon={<Ic.Bell size={18} />}>Allow notifications</Button>
              </div>
            </StatusPanel>
          )}

          {on && perm === 'denied' && (
            <StatusPanel tone="note" title="Notifications are turned off" style={{ marginTop: 12 }}>
              Noted can’t send reminders until you allow notifications in your {ios ? 'iPhone' : 'device'} settings.
              <div style={{ marginTop: 8, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {ios
                  ? 'Settings → Notifications → Noted → Allow Notifications.'
                  : 'Settings → Apps → Noted → Notifications → Allow. Or tap the lock icon in the address bar.'}
              </div>
            </StatusPanel>
          )}

          {on && granted && (
            <Card style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {!configured && (
                <StatusPanel tone="info" icon={Ic.Info} style={{ margin: '-2px 0 0' }}>
                  Reminders are set up on this device. To deliver them while the app is closed, connect the push backend — see the README.
                </StatusPanel>
              )}

              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>How many reminders a day?</div>
                <SegmentedControl value={String(prefs.count)} onChange={(v) => setCount(Number(v))}
                  options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {prefs.times.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{prefs.count === 1 ? 'Reminder time' : `Reminder ${i + 1}`}</div>
                      <div className="meta tnum">{prettyTime(t)}</div>
                    </div>
                    <TimeField value={t} dark={theme === 'dark'} onChange={(v) => setTimeAt(i, v)} label={`Reminder ${i + 1} time`} />
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6 }}>
                <ListRow icon={<Ic.CheckCirc size={20} />} title="Skip days I’ve already logged"
                  subtitle="No reminder on days you’ve made an entry" last
                  trailing={<Toggle checked={prefs.smartSkip} onChange={(v) => update({ smartSkip: v })} label="Skip days I’ve already logged" />} />
              </div>

              <Button variant="secondary" block size="md" onClick={test} disabled={busy} leadingIcon={<Ic.Bell size={18} />}>
                Send a test notification
              </Button>
            </Card>
          )}

          {!standalone && installable && (
            <Button variant="tertiary" block size="md" style={{ marginTop: 8 }}
              leadingIcon={<Ic.Download size={18} />} onClick={install} disabled={busy}>
              Add Noted to your home screen
            </Button>
          )}
        </React.Fragment>
      )}
    </section>
  );
}

function ProfileScreen({ theme, setTheme, textScale, setTextScale, reduceMotion, setReduceMotion,
  sharing, setSharing, openReport, openClinician, openDoc, openSharing, openData, openEditIdentity, deleteAudioOnTx, setDeleteAudioOnTx, profile, authUser, onSignOut, goHome,
  health, openHealthSync, openHealthImport, showToast, lastLogDate }) {
  const PATIENT = profile || DEMO.PATIENT;
  const { Card, SectionLabel, ListRow, StatusPanel, Button, Toggle } = NB;
  const initials = PATIENT.name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="screen-scroll anim-fade" style={{ paddingBottom: NC.NAV_H + NC.SAFE_BOTTOM + 96 }}>
      <NC.AppBar title="Profile" onHome={goHome} />
      <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Identity */}
        <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="tnum" style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--brand-deep-teal-blue)', color: 'var(--text-on-brand)',
            display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 19, fontWeight: 600 }}>{PATIENT.name}</span>
              {PATIENT.demo && <NC.DemoBadge />}
            </div>
            <div className="meta tnum">{[PATIENT.age, PATIENT.gender, PATIENT.pronouns].filter(Boolean).join(' · ')}</div>
            {authUser && authUser.email && (
              <div className="meta" style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authUser.email}</div>
            )}
          </div>
          <NC.RoundIconButton label="Edit your details" onClick={openEditIdentity}><Ic.Edit size={19} /></NC.RoundIconButton>
        </Card>

        {/* Reminders + install (PWA) */}
        <RemindersSection showToast={showToast} lastLogDate={lastLogDate} theme={theme} />

        {/* Health record */}
        <section>
          <SectionLabel>Your health record</SectionLabel>
          <Card padding={0} style={{ padding: '0 16px' }}>
            <ListRow icon={<Ic.Stethoscope size={20} />} title="Conditions" subtitle={`${PATIENT.conditions.length} recorded`} chevron onClick={openData} />
            <ListRow icon={<Ic.Pill size={20} />} title="Medications" subtitle={`${PATIENT.medications.length} recorded`} chevron onClick={openData} />
            <ListRow icon={<Ic.Alert size={20} />} title="Allergies" subtitle={PATIENT.allergies.length ? PATIENT.allergies.map(a => a.name).join(', ') : 'None recorded'} chevron onClick={openData} last />
          </Card>
          <Button variant="secondary" block size="md" style={{ marginTop: 12 }} leadingIcon={<Ic.Edit size={18} />} onClick={openData}>
            Edit your health record
          </Button>
          <Button variant="tertiary" block size="md" style={{ marginTop: 4 }} leadingIcon={<Ic.Upload size={18} />} onClick={openDoc}>
            Add a document to fill gaps
          </Button>
        </section>

        {/* Sharing & ownership */}
        <section>
          <SectionLabel>Sharing &amp; data</SectionLabel>
          <Card padding={0} style={{ padding: '0 16px' }}>
            <ListRow icon={<Ic.Share size={20} />} title="Share with a professional" subtitle="Make a clinical report to share or print" chevron onClick={openReport} />
            <ListRow icon={<Ic.Stethoscope size={20} />} title="View as a clinician" subtitle="See the profession-specific report views" chevron onClick={openClinician} />
            <ListRow icon={<Ic.Lock size={20} />} title="Who can see sensitive history" subtitle="Decide per professional type" chevron onClick={openSharing} last />
          </Card>
        </section>

        {/* NHS integration — long-term gold standard, shown as connect state */}
        <section>
          <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--info-soft)', color: 'var(--info)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic.Link size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Connect to the NHS App</div>
              <div className="meta">Share through GP Connect when it's available to you.</div>
            </div>
            <NB.Chip style={{ background: 'var(--surface-sunken)' }}>Coming</NB.Chip>
          </Card>
        </section>

        {/* Connected health apps & wearables */}
        <section>
          <SectionLabel>Connected health apps</SectionLabel>
          <Card padding={0} style={{ padding: '0 16px' }}>
            <ListRow icon={<Ic.Heart size={20} />}
              title="Apple Health" iconBg="var(--surface-sunken)"
              subtitle={health.apple.connected ? `Syncing from Apple Watch · last ${health.apple.lastSync}` : 'Tap to connect your Apple Watch'}
              trailing={<NB.Chip leadingDot color={health.apple.connected ? 'var(--improvement)' : 'var(--text-secondary)'}
                style={{ background: 'transparent', border: 0, padding: 0 }}>{health.apple.connected ? 'On' : 'Off'}</NB.Chip>}
              chevron onClick={openHealthSync} />
            <ListRow icon={<Ic.Activity size={20} />}
              title="Samsung Health" iconBg="var(--surface-sunken)"
              subtitle={health.samsung.connected ? `Syncing from Galaxy Watch · last ${health.samsung.lastSync}` : 'Tap to connect your Galaxy Watch'}
              trailing={<NB.Chip leadingDot color={health.samsung.connected ? 'var(--improvement)' : 'var(--text-secondary)'}
                style={{ background: 'transparent', border: 0, padding: 0 }}>{health.samsung.connected ? 'On' : 'Off'}</NB.Chip>}
              chevron onClick={openHealthSync} />
            <ListRow icon={<Ic.Upload size={20} />} title="Import exported data"
              subtitle="Sleep, heart rate, steps, ECG, oxygen, VO₂ max" chevron onClick={openHealthImport} last />
          </Card>
        </section>

        {/* Export */}
        <section>
          <SectionLabel>Your data is yours</SectionLabel>
          <Card padding={0} style={{ padding: '0 16px' }}>
            <ListRow icon={<Ic.Download size={20} />} title="Export your data" subtitle="Download everything as a file" chevron onClick={() => {}} />
            <ListRow icon={<Ic.Mic size={20} />} title="Voice recordings" subtitle="Manage and delete audio" chevron onClick={() => {}} last />
          </Card>
        </section>

        {/* Display & accessibility */}
        <section>
          <SectionLabel>Display &amp; accessibility</SectionLabel>
          <Card padding={0} style={{ padding: '4px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface-sunken)', color: 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {theme === 'dark' ? <Ic.Moon size={20} /> : <Ic.Sun size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Appearance</div>
                <div className="meta">Choose what's easiest on your eyes.</div>
              </div>
            </div>
            <div style={{ padding: '12px 0 14px' }}>
              <NB.SegmentedControl value={theme} onChange={setTheme}
                options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface-sunken)', color: 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>A</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Text size</div>
                <div className="meta tnum">{Math.round(textScale * 100)}% of normal</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '0 0 14px' }}>
              {[{ v: 1, l: 'Normal' }, { v: 1.12, l: 'Large' }, { v: 1.25, l: 'Larger' }].map(o => (
                <NB.ChoicePill key={o.v} selected={Math.abs(textScale - o.v) < 0.01} onClick={() => setTextScale(o.v)} style={{ flex: 1, justifyContent: 'center' }}>{o.l}</NB.ChoicePill>
              ))}
            </div>

            <ListRow title="Reduce motion" subtitle="Turn off animations" last
              icon={<Ic.Activity size={20} />}
              trailing={<Toggle checked={reduceMotion} onChange={setReduceMotion} label="Reduce motion" />} />
          </Card>
        </section>

        {/* Privacy controls */}
        <section>
          <SectionLabel>Privacy</SectionLabel>
          <Card padding={0} style={{ padding: '0 16px' }}>
            <ListRow icon={<Ic.Mic size={20} />} title="Delete audio after transcription" subtitle="Keep only the text from voice entries" last
              trailing={<Toggle checked={deleteAudioOnTx} onChange={setDeleteAudioOnTx} label="Delete audio after transcription" />} />
          </Card>
          <Button variant="tertiary" block size="md" style={{ marginTop: 8, color: 'var(--red-flag)' }} leadingIcon={<Ic.Trash size={18} />} onClick={openData}>
            Delete my account and data
          </Button>
        </section>

        {/* Account */}
        {onSignOut && (
          <section>
            <SectionLabel>Account</SectionLabel>
            <Card padding={0} style={{ padding: '0 16px' }}>
              <ListRow icon={<Ic.LogOut size={20} />} title="Sign out"
                subtitle={authUser && authUser.email ? `Signed in as ${authUser.email}` : 'Sign out of your account'}
                chevron onClick={onSignOut} last />
            </Card>
          </section>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px 0 4px' }}>
          <img src="assets/noted-wordmark.svg" alt="Noted" style={{ height: 26, opacity: 0.5 }} />
          <div className="meta" style={{ textAlign: 'center' }}>A symptom journal. Not a diagnosis tool.</div>
        </div>
      </div>
    </div>
  );
}

// Sheet: granular sharing matrix — sensitive categories × professional types.
function SharingSheet({ open, onClose, sharing, setSharing }) {
  const { SENSITIVE_CATEGORIES, PROFESSIONALS } = DEMO;
  const ICONS = { gp: Ic.Stethoscope, physio: Ic.Bone, psych: Ic.Brain, dietitian: Ic.Utensils };
  return (
    <NC.Sheet open={open} onClose={onClose} title="Who can see what">
      <NB.StatusPanel tone="info" filled icon={Ic.Lock} style={{ marginBottom: 16 }}>
        You choose who sees your sensitive history. These stay hidden in shared reports unless you turn them on here.
      </NB.StatusPanel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SENSITIVE_CATEGORIES.map(cat => (
          <div key={cat.id}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{cat.label}</div>
            <div className="meta" style={{ marginBottom: 10 }}>{cat.detail}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PROFESSIONALS.map(p => {
                const Icon = ICONS[p.id];
                const on = sharing[cat.id][p.id];
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}><Icon size={18} /></span>
                    <span style={{ flex: 1, fontSize: 15 }}>{p.label}</span>
                    <NB.Toggle checked={on} label={`Share ${cat.label} with ${p.label}`}
                      onChange={(v) => setSharing(s => ({ ...s, [cat.id]: { ...s[cat.id], [p.id]: v } }))} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </NC.Sheet>
  );
}

// Sheet: edit identity — name, age, gender, pronouns.
function EditIdentitySheet({ open, onClose, profile, setProfile, onSaved }) {
  const { Field, TextInput, Button, ChoicePill, StatusPanel } = NB;
  const GENDERS = ['Man', 'Woman', 'Non-binary'];
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [selfDescribe, setSelfDescribe] = React.useState(false);
  const [pronouns, setPronouns] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  // Seed working state each time the sheet opens.
  React.useEffect(() => {
    if (!open) return;
    const p = profile || {};
    setName(p.name || '');
    setAge(p.age != null ? String(p.age) : '');
    const known = GENDERS.includes(p.gender);
    setGender(p.gender || '');
    setSelfDescribe(!!p.gender && !known);
    setPronouns(p.pronouns || '');
    setTouched(false);
  }, [open]);

  const nameValid = name.trim().length > 0;
  const ageNum = parseInt(age, 10);
  const ageValid = age === '' || (!Number.isNaN(ageNum) && ageNum >= 0 && ageNum <= 120);
  const canSave = nameValid && ageValid;

  const save = () => {
    setTouched(true);
    if (!canSave) return;
    setProfile(p => ({
      ...p,
      name: name.trim(),
      firstName: name.trim().split(' ')[0],
      age: age === '' ? null : ageNum,
      gender: gender.trim(),
      pronouns: pronouns.trim(),
    }));
    onSaved && onSaved();
    onClose();
  };

  return (
    <NC.Sheet open={open} onClose={onClose} title="Edit your details">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Full name" error={touched && !nameValid ? 'Enter your name.' : undefined}>
          <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ade Bello" autoComplete="name" />
        </Field>

        <Field label="Age" help="In years." error={touched && !ageValid ? 'Enter an age between 0 and 120.' : undefined}>
          <TextInput value={age} onChange={e => setAge(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric" placeholder="e.g. 54" style={{ maxWidth: 140 }} />
        </Field>

        <Field label="Gender" help="How you describe your gender.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GENDERS.map(g => (
              <ChoicePill key={g} selected={!selfDescribe && gender === g}
                onClick={() => { setSelfDescribe(false); setGender(g); }}>{g}</ChoicePill>
            ))}
            <ChoicePill selected={selfDescribe} onClick={() => { setSelfDescribe(true); setGender(GENDERS.includes(gender) ? '' : gender); }}>
              Self-describe
            </ChoicePill>
          </div>
          {selfDescribe && (
            <TextInput value={gender} onChange={e => setGender(e.target.value)} placeholder="Describe your gender" style={{ marginTop: 10 }} />
          )}
        </Field>

        <Field label="Pronouns" optional>
          <TextInput value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="e.g. he/him" style={{ maxWidth: 200 }} />
        </Field>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <Button block onClick={save}>Save changes</Button>
          <Button variant="tertiary" block onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </NC.Sheet>
  );
}

// Field schema for each record category. Codes are clinical and optional.
const RECORD_SCHEMA = {
  conditions: {
    singular: 'condition', title: 'Conditions', icon: 'Stethoscope',
    fields: [
      { key: 'name', label: 'Condition', placeholder: 'e.g. Chronic lower back pain', required: true },
      { key: 'since', label: 'Since', placeholder: 'e.g. 2021', optional: true, maxW: 160 },
      { key: 'code', label: 'Clinical code', placeholder: 'e.g. SNOMED 279039007', optional: true, help: 'Leave blank if you don’t know it.' },
    ],
    sub: (it) => [it.code, it.since && `since ${it.since}`].filter(Boolean).join(' · '),
  },
  medications: {
    singular: 'medication', title: 'Medications', icon: 'Pill',
    fields: [
      { key: 'name', label: 'Medication', placeholder: 'e.g. Naproxen', required: true },
      { key: 'dose', label: 'Dose', placeholder: 'e.g. 500 mg', optional: true, maxW: 160 },
      { key: 'schedule', label: 'When you take it', placeholder: 'e.g. Twice a day with food', optional: true },
      { key: 'code', label: 'Clinical code', placeholder: 'e.g. SNOMED 323402007', optional: true, help: 'Leave blank if you don’t know it.' },
    ],
    sub: (it) => [it.dose, it.schedule].filter(Boolean).join(' · '),
  },
  allergies: {
    singular: 'allergy', title: 'Allergies', icon: 'Alert',
    fields: [
      { key: 'name', label: 'Allergy', placeholder: 'e.g. Penicillin', required: true },
      { key: 'reaction', label: 'Reaction', placeholder: 'e.g. Rash', optional: true },
      { key: 'code', label: 'Clinical code', placeholder: 'e.g. SNOMED 294505008', optional: true, help: 'Leave blank if you don’t know it.' },
    ],
    sub: (it) => [it.reaction && `Reaction: ${it.reaction}`, it.code].filter(Boolean).join(' · '),
  },
};

// Sheet: editable health record — add / edit / remove conditions, meds, allergies.
// Edits commit immediately so nothing is lost.
function RecordSheet({ open, onClose, profile, setProfile, onSaved }) {
  const PATIENT = profile || DEMO.PATIENT;
  const { SectionLabel, Card, Button, Field, TextInput, StatusPanel } = NB;
  const [editor, setEditor] = React.useState(null); // { listKey, index|null, draft }
  const [touched, setTouched] = React.useState(false);

  const openAdd = (listKey) => { setTouched(false); setEditor({ listKey, index: null, draft: {} }); };
  const openEdit = (listKey, index) => { setTouched(false); setEditor({ listKey, index, draft: { ...PATIENT[listKey][index] } }); };
  const closeEditor = () => setEditor(null);

  const removeItem = (listKey, index) => {
    setProfile(p => ({ ...p, [listKey]: p[listKey].filter((_, i) => i !== index) }));
    onSaved && onSaved();
  };

  const schema = editor ? RECORD_SCHEMA[editor.listKey] : null;
  const draftValid = !schema || (editor.draft.name && editor.draft.name.trim().length > 0);

  const saveItem = () => {
    setTouched(true);
    if (!draftValid) return;
    const { listKey, index, draft } = editor;
    const clean = {};
    RECORD_SCHEMA[listKey].fields.forEach(f => { clean[f.key] = (draft[f.key] || '').trim(); });
    setProfile(p => {
      const list = [...(p[listKey] || [])];
      if (index == null) list.push(clean); else list[index] = clean;
      return { ...p, [listKey]: list };
    });
    onSaved && onSaved();
    closeEditor();
  };

  const Section = ({ listKey }) => {
    const cfg = RECORD_SCHEMA[listKey];
    const items = PATIENT[listKey] || [];
    const Icon = Ic[cfg.icon];
    return (
      <div style={{ marginBottom: 22 }}>
        <SectionLabel>{cfg.title}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.length === 0 && (
            <div className="meta" style={{ padding: '4px 2px 8px' }}>None recorded yet.</div>
          )}
          {items.map((it, i) => (
            <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface-sunken)', color: 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{it.name}{it.dose ? <span className="meta"> {it.dose}</span> : null}</div>
                {cfg.sub(it) && <div className="meta tnum" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cfg.sub(it)}</div>}
              </div>
              <button onClick={() => openEdit(listKey, i)} aria-label={`Edit ${it.name}`} className="npress"
                style={{ width: 38, height: 38, borderRadius: 999, border: 0, background: 'var(--surface-sunken)', color: 'var(--text)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Ic.Edit size={17} />
              </button>
              <button onClick={() => removeItem(listKey, i)} aria-label={`Remove ${it.name}`} className="npress"
                style={{ width: 38, height: 38, borderRadius: 999, border: 0, background: 'var(--surface-sunken)', color: 'var(--red-flag)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Ic.Trash size={17} />
              </button>
            </Card>
          ))}
          <Button variant="secondary" block size="md" leadingIcon={<Ic.Plus size={18} />} onClick={() => openAdd(listKey)}>
            Add {cfg.singular}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      <NC.Sheet open={open} onClose={onClose} title="Your health record">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {PATIENT.demo && <NC.DemoBadge />}<NB.SelfReportedNote />
        </div>
        <StatusPanel tone="info" style={{ marginBottom: 18 }}>
          Keep this up to date so your shared reports are accurate. Changes save as you make them.
        </StatusPanel>
        <Section listKey="conditions" />
        <Section listKey="medications" />
        <Section listKey="allergies" />
      </NC.Sheet>

      {/* Item editor — nested sheet on top */}
      <NC.Sheet open={!!editor} onClose={closeEditor}
        title={editor ? `${editor.index == null ? 'Add' : 'Edit'} ${schema.singular}` : ''}>
        {editor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {schema.fields.map(f => (
              <Field key={f.key} label={f.label} help={f.help} optional={f.optional}
                error={f.required && touched && !(editor.draft[f.key] || '').trim() ? `Enter the ${f.label.toLowerCase()}.` : undefined}>
                <TextInput value={editor.draft[f.key] || ''}
                  onChange={e => setEditor(ed => ({ ...ed, draft: { ...ed.draft, [f.key]: e.target.value } }))}
                  placeholder={f.placeholder} style={f.maxW ? { maxWidth: f.maxW } : undefined} />
              </Field>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <Button block onClick={saveItem}>{editor.index == null ? `Add ${schema.singular}` : 'Save changes'}</Button>
              <Button variant="tertiary" block onClick={closeEditor}>Cancel</Button>
            </div>
          </div>
        )}
      </NC.Sheet>
    </React.Fragment>
  );
}

Object.assign(window, { ProfileScreen, SharingSheet, RecordSheet, EditIdentitySheet });
