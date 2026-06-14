// Log — the <30-second symptom log. Front-load the common path; context fields
// expand on one tap and never block saving. Smart defaults from last entries.

function SymptomSearchSheet({ open, onClose, onPick }) {
  const [q, setQ] = React.useState('');
  const list = DEMO.COMMON_SYMPTOMS.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  const freeText = q.trim().length > 1 && !list.some(s => s.name.toLowerCase() === q.toLowerCase());
  return (
    <NC.Sheet open={open} onClose={onClose} title="What's the symptom?">
      <NB.TextInput autoFocus placeholder="Search symptoms" value={q} onChange={e => setQ(e.target.value)}
        leading={<Ic.Search size={20} />} aria-label="Search symptoms" />
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
        {list.map(s => (
          <button key={s.code} onClick={() => onPick(s)} className="npress"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              padding: '14px 4px', minHeight: 56, border: 0, borderBottom: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{s.name}</div>
              <div className="meta tnum">{s.code}</div>
            </div>
            <Ic.Plus size={20} />
          </button>
        ))}
        {freeText && (
          <button onClick={() => onPick({ name: q.trim(), code: 'Free text — not coded' })} className="npress"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 4px', minHeight: 56,
              border: 0, background: 'transparent', color: 'var(--brand-deep-teal-blue)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontWeight: 600 }}>
            <Ic.Plus size={20} /> Add "{q.trim()}"
          </button>
        )}
      </div>
      <div className="meta" style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
        <Ic.Info size={14} /> Names follow the SNOMED CT clinical list. You can add your own words too.
      </div>
    </NC.Sheet>
  );
}

// Multi-select chip group with a free-text "Other" option. Custom entries are
// stored alongside presets in the same value array and render as removable pills.
function ChipMultiSelect({ presets, value, onChange, placeholder = 'Type your own' }) {
  const { ChoicePill, TextInput, Button } = NB;
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const custom = value.filter(v => !presets.includes(v));
  const toggle = (v) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  const addCustom = () => {
    const t = draft.trim();
    if (t && !value.some(v => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setDraft('');
    setAdding(false);
  };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {presets.map(t => <ChoicePill key={t} selected={value.includes(t)} onClick={() => toggle(t)}>{t}</ChoicePill>)}
        {custom.map(t => (
          <ChoicePill key={t} selected onClick={() => toggle(t)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{t}<Ic.Close size={14} /></span>
          </ChoicePill>
        ))}
        <ChoicePill selected={false} onClick={() => setAdding(a => !a)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic.Plus size={16} /> Other</span>
        </ChoicePill>
      </div>
      {adding && (
        <div className="anim-fade" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <TextInput autoFocus placeholder={placeholder} value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            style={{ flex: 1, height: 48 }} aria-label={placeholder} />
          <Button variant="secondary" size="md" onClick={addCustom} disabled={!draft.trim()}>Add</Button>
        </div>
      )}
    </div>
  );
}

function LogFlow({ initial, onClose, onSave, onRedFlag, onHome }) {
  const seed = initial || {};
  const [symptom, setSymptom] = React.useState(seed.name ? { name: seed.name, code: seed.code } : null);
  const [severity, setSeverity] = React.useState(seed.severity || 5);
  const [markers, setMarkers] = React.useState(seed.markers || []);
  const [character, setCharacter] = React.useState(seed.character || []);
  const [onset, setOnset] = React.useState(seed.onset || 'On waking');
  const [duration, setDuration] = React.useState(seed.duration || 'Ongoing');
  const [time, setTime] = React.useState(seed.time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const [note, setNote] = React.useState(seed.note || '');
  const [showContext, setShowContext] = React.useState(false);
  const [ctxTriggers, setCtxTriggers] = React.useState((seed.context && seed.context.triggers) || []);
  const [ctxRelieving, setCtxRelieving] = React.useState((seed.context && seed.context.relieving) || []);
  const [ctxMood, setCtxMood] = React.useState((seed.context && seed.context.mood) || null);
  const [searchOpen, setSearchOpen] = React.useState(!seed.name);
  const [voiceOpen, setVoiceOpen] = React.useState(false);

  const { Button, Card, Field, SectionLabel, ChoicePill, Chip, StatusPanel, SelfReportedNote } = NB;

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  // Red-flag rule check on save.
  const isRedFlag = symptom && /chest|thunderclap|suicid|crushing/i.test((symptom.name + ' ' + note).toLowerCase()) && severity >= 7;

  const applyVoice = (p) => {
    if (p.name) setSymptom({ name: p.name, code: p.code || 'Free text — not coded' });
    if (p.severity != null) setSeverity(p.severity);
    if (p.character && p.character.length) setCharacter(prev => Array.from(new Set([...prev, ...p.character])));
    if (p.note) setNote(prev => prev ? prev : p.note);
    setVoiceOpen(false);
  };

  const save = () => {
    if (isRedFlag) { onRedFlag({ name: symptom.name, severity }); return; }
    onSave({
      // Editing keeps the original id + date; a new log is stamped with the real
      // current day so each log is saved under the day it was actually made.
      id: seed.id || ('log-' + Date.now()),
      name: symptom.name, code: symptom.code, severity, time,
      date: seed.date || notedTodayLabel(), dateKey: seed.dateKey || notedTodayKey(),
      onset, duration, character, note, markers,
      context: { triggers: ctxTriggers, relieving: ctxRelieving, mood: ctxMood },
    });
  };

  const TRIGGERS = ['Poor sleep', 'Stress', 'Lifting', 'Standing', 'Sitting', 'Cold weather', 'Screen time', 'Food'];
  const RELIEVING = ['Rest', 'Heat', 'Ice', 'Walking', 'Medication', 'Stretching', 'Lying down'];

  return (
    <NC.OverlayScreen
      header={<NC.ScreenHeader title="Log a symptom" onClose={onClose} onHome={onHome}
        trailing={<NC.RoundIconButton label="Voice entry" onClick={() => setVoiceOpen(true)}><Ic.Mic size={20} /></NC.RoundIconButton>} />}
      footer={
        <div>
          {isRedFlag && (
            <div className="meta" style={{ color: 'var(--red-flag)', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Ic.Alert size={14} /> This needs a safety check before saving.
            </div>
          )}
          <Button block disabled={!symptom} onClick={save}>
            {isRedFlag ? 'Continue' : 'Save log'}
          </Button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}><SelfReportedNote /></div>
        </div>
      }>
      <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Symptom */}
        <Field label="Symptom" help={symptom ? symptom.code : 'Search the clinical list or add your own words.'}>
          <button onClick={() => setSearchOpen(true)} className="npress"
            style={{ height: 56, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface)', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <span style={{ fontSize: 17, color: symptom ? 'var(--text)' : 'var(--text-secondary)', fontWeight: symptom ? 500 : 400 }}>
              {symptom ? symptom.name : 'Choose a symptom'}
            </span>
            <Ic.ChevR size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </Field>

        {/* Severity */}
        <Field label="Severity" help="How bad is it right now, from 1 to 10?">
          <SeveritySlider value={severity} onChange={setSeverity} />
        </Field>

        {/* Onset & duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="When did it start?">
            <NativeSelect value={onset} onChange={setOnset}
              options={['On waking', 'Morning', 'Afternoon', 'Evening', 'Overnight', 'Suddenly', 'Gradually']} />
          </Field>
          <Field label="How long?">
            <NativeSelect value={duration} onChange={setDuration}
              options={['Still going', 'A few minutes', 'About an hour', 'A few hours', 'Most of the day', 'Ongoing']} />
          </Field>
        </div>

        {/* Location — body map */}
        <Field label="Where is it?" help="Tap the body to mark the spot. Skip if it doesn't apply.">
          <BodyMap markers={markers} onChange={setMarkers} severity={severity} />
        </Field>

        {/* Character */}
        <Field label="What does it feel like?" optional>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DEMO.CHARACTERS.map(c => (
              <ChoicePill key={c} selected={character.includes(c)} onClick={() => toggle(character, setCharacter, c)}>{c}</ChoicePill>
            ))}
          </div>
        </Field>

        {/* Timestamp */}
        <Field label="Time" help="Filled in for you. Tap to change.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 48, padding: '0 14px',
              border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-sm)' }}>
              <Ic.Clock size={18} style={{ color: 'var(--text-secondary)' }} />
              <input type="time" value={time} onChange={e => setTime(e.target.value)} aria-label="Time"
                className="tnum" style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 17, color: 'var(--text)', outline: 'none' }} />
            </div>
            <span className="meta tnum">{seed.date || notedTodayLabel()}</span>
          </div>
        </Field>

        {/* Context — optional, one tap to expand */}
        <Card padding={0} sunken style={{ overflow: 'hidden' }}>
          <button onClick={() => setShowContext(v => !v)} aria-expanded={showContext}
            className="npress" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 16,
              border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <Ic.Sliders size={20} style={{ color: 'var(--brand-deep-teal-blue)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Add context</div>
              <div className="meta">Triggers, what helps, mood. Optional.</div>
            </div>
            <span style={{ color: 'var(--text-secondary)', transform: showContext ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base) var(--ease)' }}>
              <Ic.ChevD size={20} />
            </span>
          </button>
          {showContext && (
            <div className="anim-fade" style={{ padding: '4px 16px 18px', display: 'flex', flexDirection: 'column', gap: 18, borderTop: '1px solid var(--border)' }}>
              <div style={{ marginTop: 14 }}>
                <SectionLabel>Possible triggers</SectionLabel>
                <ChipMultiSelect presets={TRIGGERS} value={ctxTriggers} onChange={setCtxTriggers} placeholder="What might have triggered it?" />
              </div>
              <div>
                <SectionLabel>What helped</SectionLabel>
                <ChipMultiSelect presets={RELIEVING} value={ctxRelieving} onChange={setCtxRelieving} placeholder="What else helped?" />
              </div>
              <div>
                <SectionLabel>Mood &amp; stress right now</SectionLabel>
                <ScalePicker value={ctxMood} onChange={setCtxMood}
                  options={[{ value: 1, label: 'Very low' }, { value: 2, label: 'Low' }, { value: 3, label: 'Okay' }, { value: 4, label: 'Good' }, { value: 5, label: 'Very good' }]} />
              </div>
            </div>
          )}
        </Card>

        {/* Note */}
        <Field label="Anything else?" optional>
          <NB.Textarea placeholder="Add a short note in your own words" value={note} onChange={e => setNote(e.target.value)} rows={3} />
        </Field>
      </div>

      <SymptomSearchSheet open={searchOpen} onClose={() => setSearchOpen(false)}
        onPick={(s) => { setSymptom(s); setSearchOpen(false); }} />
      <VoiceSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} onApply={applyVoice} context="symptom" />
    </NC.OverlayScreen>
  );
}

// Lightweight styled select.
function NativeSelect({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', height: 48, padding: '0 38px 0 14px', appearance: 'none', WebkitAppearance: 'none',
          background: 'var(--surface)', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
          fontFamily: 'inherit', fontSize: 16, color: 'var(--text)', cursor: 'pointer', outline: 'none' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
        <Ic.ChevD size={18} />
      </span>
    </div>
  );
}

Object.assign(window, { LogFlow, SymptomSearchSheet, NativeSelect });
