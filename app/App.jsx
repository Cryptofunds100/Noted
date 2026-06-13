// Noted — root app. Tab routing + overlay/flow stack + theme + toast.
// Mounted inside the iOS frame's screen slot.

const { useState, useEffect, useCallback } = React;

function NotedApp() {
  // --- Global app state ---
  const [theme, setThemeState] = useState('light');
  const [textScale, setTextScale] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [deleteAudioOnTx, setDeleteAudioOnTx] = useState(true);

  const [onboarded, setOnboarded] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [bootChecked, setBootChecked] = useState(false);
  const [tab, setTab] = useState('today');
  const [overlay, setOverlay] = useState(null); // { type, props }
  const [sheet, setSheet] = useState(null);      // { type, props }
  const [toast, setToast] = useState(null);

  const [logs, setLogs] = useState(DEMO.LOGS);
  const [checkinDone, setCheckinDone] = useState(false);
  const [redFlagActive, setRedFlagActive] = useState(false);
  const [redFlag, setRedFlag] = useState(null); // payload for modal
  const [sharing, setSharing] = useState(DEMO.DEFAULT_SHARING);
  const [profile, setProfile] = useState(DEMO.PATIENT);
  const [health, setHealth] = useState(DEMO.HEALTH_DEFAULT);

  // Which wearable currently feeds passive data into the check-in.
  const sleepSource = health.apple.connected
    ? DEMO.HEALTH_SOURCES.apple
    : health.samsung.connected
      ? DEMO.HEALTH_SOURCES.samsung
      : null;

  // --- Restore an existing session on load ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await NotedAuth.getSession();
        if (alive && s) {
          setAuthUser(s);
          if (s.profile) setProfile(p => ({ ...p, ...s.profile }));
          // Load this user's saved entries; keep the demo seed if they have none yet.
          const saved = await NotedAuth.listEntries(s.id).catch(() => []);
          if (alive && saved && saved.length) setLogs(saved);
          setOnboarded(true);
          setTab('today');
        }
      } catch (e) { /* offline / not configured — fall through to onboarding */ }
      if (alive) setBootChecked(true);
    })();
    return () => { alive = false; };
  }, []);

  // --- Theme + a11y application ---
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.setProperty('--app-text-scale', textScale);
  }, [textScale]);
  useEffect(() => {
    document.documentElement.classList.toggle('force-reduce-motion', reduceMotion);
  }, [reduceMotion]);
  // Keep the OS status-bar / theme colour in step with the in-app theme.
  useEffect(() => {
    const color = theme === 'dark' ? '#0F1A24' : '#F8F7F4';
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', color));
  }, [theme]);

  // --- Persist the user's information to their account whenever it changes ---
  // Debounced + idempotent (upsert), so every edit path — onboarding, the
  // record/identity sheets, document upload — syncs without extra wiring.
  useEffect(() => {
    if (!authUser || !authUser.id) return;
    const t = setTimeout(() => { NotedAuth.saveProfile(authUser.id, profile).catch(() => {}); }, 500);
    return () => clearTimeout(t);
  }, [profile, authUser]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 2600);
  }, []);

  // --- Flow helpers ---
  const openLog = (existing) => setOverlay({ type: 'log', props: { initial: existing } });
  const openProm = (key) => setOverlay({ type: 'prom', props: { promKey: key } });
  const openReport = (initialView = 'patient') => setOverlay({ type: 'report', props: { initialView } });
  const openCheckin = () => setOverlay({ type: 'checkin' });
  const openDoc = () => setOverlay({ type: 'doc' });
  const closeOverlay = () => setOverlay(null);

  // Return to home (Today) from anywhere — clears any open flow/sheet first.
  const goHome = () => { setOverlay(null); setSheet(null); setTab('today'); };

  // Show the modal now, and arm the persistent banner on Today so the prompt
  // is still visible if the user dismisses the modal without acting.
  const triggerRedFlag = (payload) => { setRedFlag(payload); setRedFlagActive(true); };
  const logRedFlag = () => {
    setRedFlag(null);
    setRedFlagActive(false);
    if (overlay && (overlay.type === 'log' || overlay.type === 'prom')) closeOverlay();
    showToast('Added to your urgent-symptom record');
  };

  // Fire-and-forget persistence of an entry under the signed-in user.
  const persistEntry = (entry) => {
    if (authUser && authUser.id) NotedAuth.saveEntry(authUser.id, entry).catch(() => {});
  };

  const saveLog = (entry) => {
    setLogs(l => [entry, ...l]);
    persistEntry({ kind: 'log', ...entry });
    closeOverlay();
    // demo: re-arm the red-flag prompt on Today for chest-pain style entries handled in flow
    showToast('Logged. Your clinician will see this on your next share.');
  };

  const saveCheckin = () => {
    setCheckinDone(true);
    persistEntry({ kind: 'checkin', id: 'checkin-' + DEMO.TODAY_KEY, date: DEMO.TODAY_LABEL, dateKey: DEMO.TODAY_KEY });
    closeOverlay();
    showToast('Check-in saved for today.');
  };
  const completeProm = (key, score) => {
    persistEntry({ kind: 'prom', id: 'prom-' + key + '-' + DEMO.TODAY_KEY, key, score, date: DEMO.TODAY_LABEL, dateKey: DEMO.TODAY_KEY });
    closeOverlay();
    showToast(`${DEMO.PROMS[key].name} saved to your record.`);
  };

  const logsToday = logs.filter(l => l.dateKey === DEMO.TODAY_KEY);

  // --- Finish onboarding: merge collected profile + remember the auth user ---
  const finishOnboarding = async (collected, user) => {
    if (user) {
      setAuthUser(user);
      // A returning user signing in may already have saved entries — load them.
      try {
        const saved = await NotedAuth.listEntries(user.id);
        if (saved && saved.length) setLogs(saved);
      } catch (e) { /* offline / not configured */ }
    }
    if (collected) setProfile(p => ({ ...p, ...collected }));
    setOnboarded(true);
    setTab('today');
  };

  const signOut = async () => {
    try { await NotedAuth.signOut(); } catch (e) { /* ignore */ }
    setAuthUser(null);
    setProfile(DEMO.PATIENT);
    setOnboarded(false);
    setTab('today');
  };

  // --- PWA deep links: manifest shortcuts (?action=) + notification taps ---
  useEffect(() => {
    if (!bootChecked || !onboarded) return;
    const run = (action) => {
      if (action === 'log') openLog();
      else if (action === 'checkin') openCheckin();
    };
    if (window.NotedPWA && window.NotedPWA.initialAction) {
      run(window.NotedPWA.initialAction);
      window.NotedPWA.clearInitialAction();
    }
    const onAction = (e) => run(e.detail && e.detail.action);
    window.addEventListener('noted:action', onAction);
    return () => window.removeEventListener('noted:action', onAction);
  }, [bootChecked, onboarded]);

  // --- Splash while we check for an existing session (avoids onboarding flash) ---
  if (!bootChecked) {
    return (
      <DeviceFrame dark={theme === 'dark'}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
          <img src="assets/noted-wordmark.svg" alt="Noted" style={{ height: 30, opacity: 0.85 }} />
        </div>
      </DeviceFrame>
    );
  }

  // --- Onboarding gate ---
  if (!onboarded) {
    return (
      <DeviceFrame dark={theme === 'dark'}>
        <Onboarding onFinish={finishOnboarding} onOpenDoc={openDoc} />
        {overlay && overlay.type === 'doc' && (
          <DocUploadFlow onClose={closeOverlay} onDone={() => { closeOverlay(); showToast('Profile updated from your document.'); }} />
        )}
      </DeviceFrame>
    );
  }

  // --- Tab content ---
  const renderTab = () => {
    switch (tab) {
      case 'today':
        return <TodayScreen go={setTab} openLog={openLog} openProm={openProm} openReport={() => openReport()}
          openCheckin={openCheckin} checkinDone={checkinDone} logsToday={logsToday}
          redFlagActive={redFlagActive} openRedFlag={() => setRedFlag({ name: 'Chest tightness spreading to your arm' })} />;
      case 'log':
        return <LogLandingScreen logs={logs} openLog={openLog} openVoiceJournal={() => setSheet({ type: 'voiceJournal' })} goHome={goHome} />;
      case 'insights':
        return <InsightsScreen openProm={openProm} openReport={() => openReport()}
          openRedFlagLog={() => setSheet({ type: 'redflaglog' })} logs={logs} goHome={goHome} />;
      case 'profile':
        return <ProfileScreen theme={theme} setTheme={setThemeState} textScale={textScale} setTextScale={setTextScale}
          reduceMotion={reduceMotion} setReduceMotion={setReduceMotion}
          deleteAudioOnTx={deleteAudioOnTx} setDeleteAudioOnTx={setDeleteAudioOnTx}
          sharing={sharing} setSharing={setSharing}
          profile={profile} authUser={authUser} onSignOut={signOut} showToast={showToast}
          lastLogDate={logs && logs.length ? logs[0].dateKey : null}
          openReport={() => openReport()} openClinician={() => openReport('physio')} openDoc={openDoc}
          openSharing={() => setSheet({ type: 'sharing' })} openData={() => setSheet({ type: 'record' })}
          openEditIdentity={() => setSheet({ type: 'editIdentity' })} goHome={goHome}
          health={health}
          openHealthSync={() => setSheet({ type: 'healthSync' })}
          openHealthImport={() => setSheet({ type: 'healthImport' })} />;
      default: return null;
    }
  };

  return (
    <DeviceFrame dark={theme === 'dark'}>
      {/* Tab surface */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <div key={tab} style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{renderTab()}</div>
      </div>

      {/* FAB — available from every tab (hidden on Log tab where it'd duplicate) */}
      {tab !== 'log' && <NC.FAB onClick={() => openLog()} />}

      {/* Bottom nav */}
      <NC.BottomNav active={tab} onChange={setTab} />

      {/* Overlays (full-screen flows) */}
      {overlay && overlay.type === 'log' &&
        <LogFlow initial={overlay.props.initial} onClose={closeOverlay} onSave={saveLog} onRedFlag={triggerRedFlag} onHome={goHome} />}
      {overlay && overlay.type === 'prom' &&
        <PromFlow promKey={overlay.props.promKey} onClose={closeOverlay} onComplete={completeProm} onRedFlag={triggerRedFlag} onHome={goHome} />}
      {overlay && overlay.type === 'checkin' &&
        <CheckinFlow onClose={closeOverlay} onSave={saveCheckin} onHome={goHome} sleepSource={sleepSource} />}
      {overlay && overlay.type === 'doc' &&
        <DocUploadFlow onClose={closeOverlay} onHome={goHome} onDone={() => { closeOverlay(); showToast('Profile updated from your document.'); }} />}
      {overlay && overlay.type === 'report' &&
        <ReportFlow onClose={closeOverlay} initialView={overlay.props.initialView} onPrint={() => window.print()} onHome={goHome}
          logs={logs} profile={profile} />}

      {/* Sheets */}
      <SharingSheet open={sheet && sheet.type === 'sharing'} onClose={() => setSheet(null)} sharing={sharing} setSharing={setSharing} />
      <RecordSheet open={sheet && sheet.type === 'record'} onClose={() => setSheet(null)}
        profile={profile} setProfile={setProfile} onSaved={() => showToast('Health record updated.')} />
      <EditIdentitySheet open={sheet && sheet.type === 'editIdentity'} onClose={() => setSheet(null)}
        profile={profile} setProfile={setProfile} onSaved={() => showToast('Profile updated.')} />
      <HealthSyncSheet open={sheet && sheet.type === 'healthSync'} onClose={() => setSheet(null)}
        health={health} setHealth={setHealth} showToast={showToast}
        onImport={() => setSheet({ type: 'healthImport' })} />
      <ImportHealthSheet open={sheet && sheet.type === 'healthImport'} onClose={() => setSheet(null)}
        defaultSource={health.samsung.connected && !health.apple.connected ? 'samsung' : 'apple'}
        health={health} setHealth={setHealth}
        onDone={(n, name) => showToast(`Imported ${n} ${n === 1 ? 'data type' : 'data types'} from ${name}.`)} />
      <RedFlagLogSheet open={sheet && sheet.type === 'redflaglog'} onClose={() => setSheet(null)} />
      <VoiceSheet open={sheet && sheet.type === 'voiceJournal'} onClose={() => setSheet(null)}
        context="journal" onApply={() => { setSheet(null); showToast('Journal note saved.'); }} />

      {/* Red-flag safety modal — above everything */}
      <RedFlagModal open={!!redFlag} payload={redFlag} onClose={() => setRedFlag(null)} onLog={logRedFlag} />

      {/* Toast */}
      <NC.Toast toast={toast} />
    </DeviceFrame>
  );
}

// Log tab landing — entry points to the full log + voice journal + recent history.
function LogLandingScreen({ logs, openLog, openVoiceJournal, goHome }) {
  const { Card, SectionLabel, Button, SelfReportedNote, UrgentLine } = NB;
  return (
    <div className="screen-scroll anim-fade" style={{ paddingBottom: NC.NAV_H + NC.SAFE_BOTTOM + 40 }}>
      <NC.AppBar title="Log" subtitle="Quick to add, easy to fix later" onHome={goHome} />
      <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Primary log */}
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <button onClick={() => openLog()} className="npress"
            style={{ width: '100%', textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand-deep-teal-blue)', color: 'var(--text-on-brand)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic.Plus size={26} strokeWidth={2.25} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Log a symptom</div>
              <div className="meta">Severity, where it is, what it feels like.</div>
            </div>
            <Ic.ChevR size={22} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </Card>

        {/* Voice journal */}
        <Card interactive onClick={openVoiceJournal} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, border: '2px solid var(--brand-deep-teal-blue)', color: 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Ic.Mic size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>End-of-day voice note</div>
            <div className="meta">Speak freely. We turn it into notes you can check.</div>
          </div>
          <Ic.ChevR size={20} style={{ color: 'var(--text-secondary)' }} />
        </Card>

        {/* Recent */}
        <div>
          <SectionLabel>Recent logs</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.slice(0, 6).map(l => <LogCard key={l.id} log={l} onClick={() => openLog(l)} showDate />)}
          </div>
        </div>

        <UrgentLine style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}

window.NotedApp = NotedApp;
