// Onboarding — create an account (or log in), then progressive profiling.
// We ask for a name before anything clinical, keep account creation to one
// screen, and defer everything non-essential. Persistent "self-reported"
// reassurance throughout. Accounts + profile are stored via NotedAuth (Supabase
// when configured, in-browser mock otherwise).

function Onboarding({ onFinish, onOpenDoc }) {
  // Steps: 'welcome' → 'auth' → 'basics' → 'health' → 'ready'
  const [step, setStep] = React.useState('welcome');

  // Account
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Profile
  const [age, setAge] = React.useState('');
  const [sexBirth, setSexBirth] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [conditions, setConditions] = React.useState('');
  const [meds, setMeds] = React.useState('');
  const [allergies, setAllergies] = React.useState('');
  const [other, setOther] = React.useState('');

  // Auth user (set once an account is created / signed in)
  const [user, setUser] = React.useState(null);

  const { Button, Card, Field, TextInput, Textarea, StatusPanel, SelfReportedNote, Stepper, ChoicePill } = NB;

  // Stepper covers the three profiling screens after the account is made.
  const PROFILE_STEPS = ['basics', 'health', 'ready'];
  const stepIndex = PROFILE_STEPS.indexOf(step);

  const splitList = (s) => s.split(/[\n,]+/).map(x => x.trim()).filter(Boolean).map(name => ({ name }));

  const buildProfile = () => ({
    name: name.trim(),
    firstName: name.trim().split(' ')[0] || name.trim(),
    age: age === '' ? null : parseInt(age, 10),
    gender: gender || '',
    sexAtBirth: sexBirth || '',
    conditions: conditions.trim() ? splitList(conditions) : [],
    medications: meds.trim() ? splitList(meds) : [],
    allergies: allergies.trim() ? splitList(allergies) : [],
    note: other.trim(),
  });

  // Persist + hand back to the app.
  const finish = async () => {
    const profile = buildProfile();
    try { if (user && window.NotedAuth) await NotedAuth.saveProfile(user.id, profile); } catch (e) { /* non-blocking */ }
    onFinish(profile, user);
  };

  // ----- Welcome -----
  if (step === 'welcome') {
    return (
      <div className="anim-fade" style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <div className="screen-scroll" style={{ flex: 1, padding: 'calc(var(--safe-top) + 24px) 24px 0' }}>
          <img src="assets/noted-wordmark.svg" alt="Noted" style={{ height: 30 }} />
          <div style={{ marginTop: 40 }}>
            <h1 style={{ fontSize: 30, lineHeight: 1.2 }}>Your symptoms, heard and recorded.</h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 14, lineHeight: 1.5 }}>
              Log how you feel in under 30 seconds. Noted turns it into a clear one-page summary your clinician can read in a minute.
            </p>
          </div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FeatureLine icon={Ic.Clock} title="Quick to log" body="The common path takes seconds, not minutes." />
            <FeatureLine icon={Ic.Stethoscope} title="Made for consults" body="Captures the detail you forget in a 10-minute appointment." />
            <FeatureLine icon={Ic.Lock} title="Yours to share" body="You choose who sees what, and when." />
          </div>

          <StatusPanel tone="info" style={{ marginTop: 24 }} icon={Ic.ShieldChk}>
            Noted records what you tell it. It is <strong>self-reported and not clinically verified</strong>, and it does not diagnose.
          </StatusPanel>
        </div>
        <div style={{ padding: `16px 24px calc(var(--safe-bottom) + 16px)` }}>
          <Button block onClick={() => setStep('auth')}>Get started</Button>
        </div>
      </div>
    );
  }

  // ----- Auth (sign up / log in) -----
  if (step === 'auth') {
    return (
      <AuthScreen
        name={name} setName={setName}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        onBack={() => setStep('welcome')}
        onSignedUp={(u) => { setUser(u); setStep('basics'); }}
        onLoggedIn={(u) => { onFinish(u.profile ? { ...u.profile } : null, u); }}
      />
    );
  }

  // Shared header for the profiling steps.
  const header = (
    <div style={{ paddingTop: 'var(--safe-top)', paddingBottom: 12, paddingLeft: 12, paddingRight: 12, background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 40, marginBottom: 12 }}>
        <button onClick={() => setStep(stepIndex <= 0 ? 'auth' : PROFILE_STEPS[stepIndex - 1])} aria-label="Back" className="npress"
          style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'transparent', color: 'var(--text)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Ic.ChevL size={26} />
        </button>
        <div style={{ flex: 1 }}><Stepper current={stepIndex} total={PROFILE_STEPS.length} /></div>
        <button onClick={finish} className="nlink" style={{ background: 'none', border: 0, fontSize: 15, cursor: 'pointer', padding: '0 8px' }}>Skip</button>
      </div>
    </div>
  );

  // ----- Basics — name first, then age -----
  if (step === 'basics') {
    return (
      <NC.OverlayScreen header={header}
        footer={<Button block onClick={() => setStep('health')}>Continue</Button>}>
        <div style={{ padding: '8px 24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <h2>A few basics</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>This helps your clinician read your summary correctly.</p>
          </div>
          <Field label="Your name" help="What we'll call you, and what shows on your shared report.">
            <TextInput placeholder="e.g. Jane Smith" value={name} onChange={e => setName(e.target.value)} autoComplete="name" leading={<Ic.User size={20} />} />
          </Field>
          <Field label="Age">
            <TextInput inputMode="numeric" placeholder="e.g. 54" value={age} onChange={e => setAge(e.target.value.replace(/[^0-9]/g, ''))} className="tnum" style={{ maxWidth: 160 }} />
          </Field>
          <Field label="Sex assigned at birth">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Female', 'Male', 'Intersex', 'Prefer not to say'].map(o => (
                <ChoicePill key={o} selected={sexBirth === o} onClick={() => setSexBirth(o)}>{o}</ChoicePill>
              ))}
            </div>
          </Field>
          <Field label="Current sex or gender" help="Use the words that fit you.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Woman', 'Man', 'Non-binary', 'Prefer to self-describe'].map(o => (
                <ChoicePill key={o} selected={gender === o} onClick={() => setGender(o)}>{o}</ChoicePill>
              ))}
            </div>
          </Field>
          <div style={{ display: 'flex', justifyContent: 'center' }}><SelfReportedNote /></div>
        </div>
      </NC.OverlayScreen>
    );
  }

  // ----- Health (with doc upload as headline) -----
  if (step === 'health') {
    return (
      <NC.OverlayScreen header={header}
        footer={<Button block onClick={() => setStep('ready')}>Continue</Button>}>
        <div style={{ padding: '8px 24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <h2>Your health, the easy way</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Add a document and we'll fill this in for you. Or type the basics — you can add the rest later.</p>
          </div>

          {/* Headline: document upload */}
          <button onClick={onOpenDoc} className="npress"
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, border: '1.5px solid var(--brand-deep-teal-blue)',
              borderRadius: 'var(--radius-md)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand-deep-teal-blue)', color: 'var(--text-on-brand)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic.Camera size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Have a letter or prescription?</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>Add a photo or PDF and we'll fill in your profile for you.</div>
            </div>
            <Ic.ChevR size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span className="meta">or type a few</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <Field label="Top ongoing conditions" help="Up to three. You can add more later." optional>
            <Textarea placeholder="e.g. Lower back pain, low mood" value={conditions} onChange={e => setConditions(e.target.value)} rows={2} />
          </Field>
          <Field label="Current medications" optional>
            <Textarea placeholder="e.g. Naproxen, sertraline" value={meds} onChange={e => setMeds(e.target.value)} rows={2} />
          </Field>
          <Field label="Allergies" optional>
            <TextInput placeholder="e.g. Penicillin" value={allergies} onChange={e => setAllergies(e.target.value)} />
          </Field>
          <Field label="Anything else?" help="In your own words." optional>
            <Textarea placeholder="Anything you'd want a clinician to know" value={other} onChange={e => setOther(e.target.value)} rows={2} />
          </Field>

          <StatusPanel tone="note" filled icon={Ic.Info}>
            <strong>You can add the rest later.</strong> Noted will ask small questions over time instead of all at once.
          </StatusPanel>
        </div>
      </NC.OverlayScreen>
    );
  }

  // ----- Ready -----
  return (
    <NC.OverlayScreen header={header}
      footer={<Button block onClick={finish} leadingIcon={<Ic.Plus size={20} />}>Log your first symptom</Button>}>
      <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--improvement-soft)', color: 'var(--improvement)', display: 'grid', placeItems: 'center' }}>
          <Ic.Check size={34} />
        </div>
        <div>
          <h1 style={{ fontSize: 26 }}>{name.trim() ? `You're set up, ${name.trim().split(' ')[0]}` : "You're set up"}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 10, fontSize: 17, lineHeight: 1.5 }}>
            That's the hard part done. Your account keeps everything saved and ready to share. From now on, just log how you feel when it happens.
          </p>
        </div>
        <Card sunken style={{ width: '100%', textAlign: 'left' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>What happens next</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MiniStep n="1" text="Log symptoms as they happen — it takes seconds." />
            <MiniStep n="2" text="Noted spots patterns and tracks your scores over time." />
            <MiniStep n="3" text="Share a one-page report with your clinician when you need to." />
          </div>
        </Card>
        <SelfReportedNote />
      </div>
    </NC.OverlayScreen>
  );
}

// ----- Account screen: sign up / log in -----------------------------------
function AuthScreen({ name, setName, email, setEmail, password, setPassword, onBack, onSignedUp, onLoggedIn }) {
  const { Button, Field, TextInput, SegmentedControl, StatusPanel, SelfReportedNote } = NB;
  const [mode, setMode] = React.useState('signup'); // 'signup' | 'login'
  const [showPw, setShowPw] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const pwValid = password.length >= 6;
  const nameValid = name.trim().length > 0;
  const canSubmit = mode === 'signup'
    ? (nameValid && emailValid && pwValid)
    : (emailValid && password.length > 0);

  const submit = async () => {
    setTouched(true);
    setError('');
    if (!canSubmit) return;
    setBusy(true);
    try {
      if (mode === 'signup') {
        const u = await NotedAuth.signUp({ email: email.trim(), password, name: name.trim() });
        onSignedUp(u);
      } else {
        const u = await NotedAuth.signIn({ email: email.trim(), password });
        onLoggedIn(u);
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); setTouched(false); };

  const pwTrailing = (
    <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} className="npress"
      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: 999, border: 0, background: 'transparent', color: 'var(--text-secondary)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
      {showPw ? <Ic.EyeOff size={20} /> : <Ic.Eye size={20} />}
    </button>
  );

  return (
    <div className="anim-fade" style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ paddingTop: 'var(--safe-top)', paddingBottom: 4, paddingLeft: 12, paddingRight: 12 }}>
        <button onClick={onBack} aria-label="Back" className="npress"
          style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'transparent', color: 'var(--text)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Ic.ChevL size={26} />
        </button>
      </div>

      <div className="screen-scroll" style={{ flex: 1, padding: '4px 24px 0' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 27, lineHeight: 1.2 }}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
            {mode === 'signup'
              ? 'An account keeps your symptom history saved and ready to share with your clinician.'
              : 'Log in to pick up where you left off.'}
          </p>
        </div>

        <SegmentedControl
          value={mode}
          onChange={switchMode}
          options={[{ value: 'signup', label: 'Sign up' }, { value: 'login', label: 'Log in' }]}
          style={{ marginBottom: 22 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {mode === 'signup' && (
            <Field label="Your name" error={touched && !nameValid ? 'Enter your name.' : undefined}>
              <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Smith"
                autoComplete="name" leading={<Ic.User size={20} />} />
            </Field>
          )}

          <Field label="Email" error={touched && !emailValid ? 'Enter a valid email address.' : undefined}>
            <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              autoComplete="email" inputMode="email" leading={<Ic.User size={20} />} />
          </Field>

          <Field label="Password"
            help={mode === 'signup' ? 'At least 6 characters.' : undefined}
            error={touched && mode === 'signup' && !pwValid ? 'Use at least 6 characters.' : undefined}>
            <div style={{ position: 'relative' }}>
              <TextInput type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password' : 'Your password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                leading={<Ic.Lock size={20} />} style={{ paddingRight: 48 }} />
              {pwTrailing}
            </div>
          </Field>

          {error && (
            <StatusPanel tone="important" filled icon={Ic.Alert}>{error}</StatusPanel>
          )}
        </div>
      </div>

      <div style={{ padding: `16px 24px calc(var(--safe-bottom) + 16px)`, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button block onClick={submit} disabled={busy}
          trailingIcon={busy ? <Spinner /> : undefined}>
          {busy ? (mode === 'signup' ? 'Creating account…' : 'Logging in…') : (mode === 'signup' ? 'Create account' : 'Log in')}
        </Button>
        <div style={{ display: 'flex', justifyContent: 'center' }}><SelfReportedNote /></div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span aria-hidden="true" style={{
      width: 18, height: 18, borderRadius: 999, display: 'inline-block',
      border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
      animation: 'noted-spin 0.7s linear infinite',
    }} />
  );
}

// One-time keyframes for the spinner (respects reduced motion via the app's force class).
(function () {
  if (document.getElementById('noted-onboard-style')) return;
  const s = document.createElement('style');
  s.id = 'noted-onboard-style';
  s.textContent = '@keyframes noted-spin { to { transform: rotate(360deg); } } .force-reduce-motion [style*="noted-spin"] { animation: none !important; }';
  document.head.appendChild(s);
})();

function FeatureLine({ icon: Icon, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--surface-sunken)', color: 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.45 }}>{body}</div>
      </div>
    </div>
  );
}

function MiniStep({ n, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span className="tnum" style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--brand-deep-teal-blue)', color: 'var(--text-on-brand)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{n}</span>
      <span style={{ fontSize: 15, lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

Object.assign(window, { Onboarding, AuthScreen, Spinner, FeatureLine, MiniStep });
