// Voice entry — fast-entry aid. After speech, ALWAYS show the parsed structured
// output for review before saving — never silently commit. On-device indicator
// + a visible "delete audio after transcription" control are mandatory.

function useSpeech() {
  const ref = React.useRef(null);
  const [supported] = React.useState(() =>
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
  const start = (onResult, onEnd) => {
    if (!supported) return false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = 'en-GB'; r.interimResults = true; r.continuous = true;
    r.onresult = (e) => {
      let txt = '';
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      onResult(txt);
    };
    r.onend = () => onEnd && onEnd();
    r.onerror = () => onEnd && onEnd();
    ref.current = r;
    try { r.start(); return true; } catch { return false; }
  };
  const stop = () => { try { ref.current && ref.current.stop(); } catch {} };
  return { supported, start, stop };
}

// Naive parser: pull a severity number and match a known symptom + character.
function parseTranscript(text) {
  const t = (text || '').toLowerCase();
  const sevMatch = t.match(/(\b(?:10|[0-9])\b)\s*(?:out of|\/)\s*10/) || t.match(/severity\s*(\b(?:10|[0-9])\b)/);
  let severity = sevMatch ? parseInt(sevMatch[1], 10) : null;
  if (severity != null) severity = Math.max(1, Math.min(10, severity));
  const sym = DEMO.COMMON_SYMPTOMS.find(s => t.includes(s.name.toLowerCase()))
    || (t.includes('back') ? { name: 'Lower back pain', code: 'SNOMED 279039007' } : null)
    || (t.includes('knee') ? { name: 'Knee pain', code: 'SNOMED 30989003' } : null)
    || (t.includes('head') ? { name: 'Headache', code: 'SNOMED 25064002' } : null);
  const character = DEMO.CHARACTERS.filter(c => t.includes(c.toLowerCase()));
  return { name: sym ? sym.name : null, code: sym ? sym.code : null, severity, character, note: text };
}

function VoiceSheet({ open, onClose, onApply, context = 'symptom' }) {
  const { supported, start, stop } = useSpeech();
  const [phase, setPhase] = React.useState('idle'); // idle | recording | processing | review
  const [text, setText] = React.useState('');
  const [parsed, setParsed] = React.useState(null);
  const [deleteAudio, setDeleteAudio] = React.useState(true);
  const scriptedRef = React.useRef(null);
  // Refs mirror state so the speech-recognition onEnd callback (created once,
  // at begin time) doesn't act on a stale closure.
  const phaseRef = React.useRef('idle');
  const textRef = React.useRef('');
  React.useEffect(() => { phaseRef.current = phase; }, [phase]);
  React.useEffect(() => { textRef.current = text; }, [text]);

  React.useEffect(() => {
    if (!open) { setPhase('idle'); setText(''); setParsed(null); stop(); clearTimeout(scriptedRef.current); }
  }, [open]);

  const begin = () => {
    setText(''); setParsed(null);
    const live = start(
      (t) => setText(t),
      () => { if (phaseRef.current === 'recording') finish(); }
    );
    // No speech recognition on this device — degrade honestly, never fabricate a
    // transcript. The user can type their symptom instead.
    if (!live) { setPhase('idle'); return; }
    setPhase('recording');
  };

  const finish = () => {
    stop();
    clearTimeout(scriptedRef.current);
    const captured = (textRef.current || '').trim();
    if (!captured) { setPhase('idle'); return; }
    setText(captured);
    setPhase('processing');
    const showLocal = () => { setParsed(parseTranscript(captured)); setPhase('review'); };
    // Structure the transcript with Claude when available; fall back to the
    // on-device parser. Only the text is sent — never the audio.
    if (window.NotedAI && window.NotedAI.parseVoice) {
      NotedAI.parseVoice(captured, context)
        .then((r) => {
          setParsed({
            name: r.name || null,
            code: r.code || null,
            severity: (r.severity === 0 || r.severity) ? r.severity : null,
            character: Array.isArray(r.character) ? r.character : [],
            onset: r.onset || '', duration: r.duration || '', bodyRegion: r.bodyRegion || '',
            triggers: Array.isArray(r.triggers) ? r.triggers : [],
            note: r.note || captured,
          });
          setPhase('review');
        })
        .catch(() => setTimeout(showLocal, 200));
    } else {
      setTimeout(showLocal, 900);
    }
  };

  const { Button, Card, StatusPanel, Toggle } = NB;

  return (
    <NC.Sheet open={open} onClose={onClose} title="Voice entry">
      {phase === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0 4px' }}>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
            Describe your symptom in your own words. We'll turn it into fields you can check and fix before saving.
          </div>
          {supported && (
            <button onClick={begin} aria-label="Start recording"
              style={{ width: 80, height: 80, borderRadius: 999, border: '2px solid var(--brand-deep-teal-blue)',
                background: 'var(--surface)', color: 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Ic.Mic size={34} />
            </button>
          )}
          <div className="meta" style={{ textAlign: 'center' }}>
            {supported ? 'Uses your device microphone.' : 'Voice entry needs a microphone, which isn\'t available on this device. You can type your symptom instead.'}
          </div>
        </div>
      )}

      {phase === 'recording' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0 4px' }}>
          <div className="voice-pulse" style={{ width: 80, height: 80, borderRadius: 999, border: '2px solid var(--brand-deep-teal-blue)',
            background: 'var(--brand-deep-teal-blue)', color: 'var(--text-on-brand)', display: 'grid', placeItems: 'center' }}>
            <Ic.Mic size={34} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Listening…</div>
          <Card sunken style={{ width: '100%', minHeight: 80, fontSize: 16, lineHeight: 1.5, color: text ? 'var(--text)' : 'var(--text-secondary)' }}>
            {text || 'Start speaking…'}
          </Card>
          <Button block onClick={finish}>Stop and review</Button>
        </div>
      )}

      {phase === 'processing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 0' }}>
          <div className="voice-spin" style={{ width: 40, height: 40, borderRadius: 999, border: '3px solid var(--border)', borderTopColor: 'var(--brand-deep-teal-blue)' }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>Turning your words into fields…</div>
          <div className="meta">Only the text is processed — not your audio.</div>
        </div>
      )}

      {phase === 'review' && parsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StatusPanel tone="info" filled title="Check this before saving">
            We turned your words into the fields below. Edit anything that's not right — nothing is saved yet.
          </StatusPanel>

          <Card sunken style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text)' }}>
            <div className="meta" style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>What you said</div>
            "{parsed.note}"
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ParsedRow label="Symptom" value={parsed.name || 'Not detected — add manually'} ok={!!parsed.name} />
            <ParsedRow label="Severity" value={parsed.severity != null ? `${parsed.severity}/10` : 'Not detected'} ok={parsed.severity != null} />
            <ParsedRow label="Character" value={parsed.character.length ? parsed.character.join(', ') : 'None detected'} ok={parsed.character.length > 0} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Delete audio after transcription</div>
              <div className="meta">Recommended. Keeps only the text.</div>
            </div>
            <Toggle checked={deleteAudio} onChange={setDeleteAudio} label="Delete audio after transcription" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" size="md" onClick={begin}>Redo</Button>
            <Button block onClick={() => onApply(parsed)}>Use these details</Button>
          </div>
        </div>
      )}
    </NC.Sheet>
  );
}

function ParsedRow({ label, value, ok }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
      <span style={{ color: ok ? 'var(--improvement)' : 'var(--text-secondary)', display: 'flex' }}>
        {ok ? <Ic.CheckCirc size={18} /> : <Ic.Info size={18} />}
      </span>
      <div style={{ flex: 1 }}>
        <div className="meta" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: ok ? 'var(--text)' : 'var(--text-secondary)' }}>{value}</div>
      </div>
    </div>
  );
}

Object.assign(window, { VoiceSheet, useSpeech, parseTranscript });
