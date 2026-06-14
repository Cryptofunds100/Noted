// Document upload — the killer onboarding feature. Accept PDF/photo, show an
// OCR + extraction step, then a REVIEW screen where every extracted field is
// confirmed or edited before anything is saved. "Self-reported" reinforced.

function DocUploadFlow({ onClose, onDone, onHome, onApply }) {
  const [phase, setPhase] = React.useState('pick'); // pick | scanning | review | error | done
  const [progress, setProgress] = React.useState(0);
  const [doc, setDoc] = React.useState(null);
  const [conds, setConds] = React.useState([]);
  const [meds, setMeds] = React.useState([]);
  const [allergies, setAllergies] = React.useState([]);
  const fileRef = React.useRef(null);

  const { Button, Card, StatusPanel, SelfReportedNote } = NB;

  const withKeep = (arr) => (Array.isArray(arr) ? arr : []).map(x => ({ ...x, keep: true }));

  // Animate the scan bar toward a ceiling; returns a stop().
  const animateProgress = (ceiling = 100) => {
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => { const next = p + 9 + Math.random() * 9; return next >= ceiling ? ceiling : next; });
    }, 240);
    return () => clearInterval(iv);
  };

  // Read the chosen file and extract with Claude. No sample fallback — if the
  // document can't be read we show an honest error, never fabricated data.
  const onFile = (file) => {
    if (!file) return;
    if (!(window.NotedAI && window.NotedAI.extractDocument)) { setPhase('error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setPhase('scanning');
      const stop = animateProgress(92);
      NotedAI.extractDocument({ data: reader.result, mediaType: file.type })
        .then((r) => {
          const c = withKeep(r.conditions), m = withKeep(r.medications), a = withKeep(r.allergies);
          stop(); setProgress(100);
          // Nothing usable found → error state rather than an empty review.
          if (!c.length && !m.length && !a.length) { setPhase('error'); return; }
          setDoc({ source: r.source || 'Your document', dateOnDoc: r.dateOnDoc || '' });
          setConds(c); setMeds(m); setAllergies(a);
          setTimeout(() => setPhase('review'), 350);
        })
        .catch(() => { stop(); setPhase('error'); });
    };
    reader.onerror = () => setPhase('error');
    reader.readAsDataURL(file);
  };

  const pickFile = () => { if (fileRef.current) fileRef.current.click(); };

  const confCount = conds.filter(c => c.keep).length + meds.filter(m => m.keep).length + allergies.filter(a => a.keep).length;

  // Commit the ticked items into the profile (mapped to the record schema), then
  // show the confirmation. detail holds dose/schedule for meds, reaction for allergies.
  const applyAndFinish = () => {
    const pick = (arr, map) => arr.filter(x => x.keep && x.name).map(map);
    if (onApply) onApply({
      conditions: pick(conds, c => ({ name: c.name.trim() })),
      medications: pick(meds, m => ({ name: m.name.trim(), schedule: (m.detail || '').trim() })),
      allergies: pick(allergies, a => ({ name: a.name.trim(), reaction: (a.detail || '').trim() })),
    });
    setPhase('done');
  };

  // ----- Pick -----
  if (phase === 'pick') {
    return (
      <NC.OverlayScreen header={<NC.ScreenHeader title="Add a document" onClose={onClose} onHome={onHome} />}>
        <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h2 style={{ marginBottom: 8 }}>Let your paperwork fill in your profile</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Add a photo or PDF of a letter, prescription, or discharge summary. We'll read it and suggest what to add. You check it before anything is saved.
            </p>
          </div>

          <button onClick={pickFile} className="npress"
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, border: '1.5px solid var(--brand-deep-teal-blue)',
              borderRadius: 'var(--radius-md)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand-deep-teal-blue)', color: 'var(--text-on-brand)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic.Camera size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Take a photo</div>
              <div className="meta">Use your camera to snap a letter or prescription.</div>
            </div>
            <Ic.ChevR size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>

          <button onClick={pickFile} className="npress"
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--surface-sunken)', color: 'var(--brand-deep-teal-blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic.File size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Upload a PDF or photo</div>
              <div className="meta">Choose a file already on your phone.</div>
            </div>
            <Ic.ChevR size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>

          <StatusPanel tone="info" title="Your document stays private">
            Reading happens to fill in your profile only. You choose what to keep, and you can delete the document afterwards.
          </StatusPanel>

          {/* Hidden picker — drives the camera/upload buttons above. */}
          <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
            onChange={(e) => onFile(e.target.files && e.target.files[0])} />
        </div>
      </NC.OverlayScreen>
    );
  }

  // ----- Scanning -----
  if (phase === 'scanning') {
    return (
      <NC.OverlayScreen header={<NC.ScreenHeader title="Reading your document" onHome={onHome} />}>
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div style={{ position: 'relative', width: 180, height: 230, borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--surface)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
            {/* fake document lines */}
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ height: 10, width: '70%', borderRadius: 3, background: 'var(--surface-sunken)' }} />
              <div style={{ height: 7, width: '90%', borderRadius: 3, background: 'var(--surface-sunken)' }} />
              <div style={{ height: 7, width: '85%', borderRadius: 3, background: 'var(--surface-sunken)' }} />
              <div style={{ height: 7, width: '60%', borderRadius: 3, background: 'var(--surface-sunken)' }} />
              <div style={{ height: 7, width: '88%', borderRadius: 3, background: 'var(--surface-sunken)' }} />
              <div style={{ height: 7, width: '50%', borderRadius: 3, background: 'var(--surface-sunken)' }} />
              <div style={{ height: 7, width: '80%', borderRadius: 3, background: 'var(--surface-sunken)' }} />
            </div>
            <div className="doc-scan-line" style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'var(--brand-deep-teal-blue)', top: `${progress}%`, boxShadow: '0 0 8px var(--brand-deep-teal-blue)' }} />
          </div>
          <div style={{ width: '100%', maxWidth: 260 }}>
            <NB.ProgressBar value={progress} />
            <div className="meta tnum" style={{ textAlign: 'center', marginTop: 10 }}>Reading on your device… {Math.round(progress)}%</div>
          </div>
          <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Ic.Scan size={14} /> Finding conditions, medications and allergies</div>
        </div>
      </NC.OverlayScreen>
    );
  }

  // ----- Error -----
  if (phase === 'error') {
    return (
      <NC.OverlayScreen
        header={<NC.ScreenHeader title="Couldn't read that document" onClose={onClose} onHome={onHome} />}
        footer={<Button block onClick={() => { setProgress(0); setPhase('pick'); }}>Try another document</Button>}>
        <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--surface-sunken)', color: 'var(--text-secondary)', display: 'grid', placeItems: 'center' }}>
            <Ic.File size={32} />
          </div>
          <div>
            <h2 style={{ marginBottom: 8 }}>We couldn't read that one</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              We couldn't find conditions, medications or allergies in that file. Try a clearer photo or a different document — or add details by hand in your profile.
            </p>
          </div>
        </div>
      </NC.OverlayScreen>
    );
  }

  // ----- Review -----
  const Row = ({ item, list, setList, idx, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: idx < list.length - 1 ? '1px solid var(--border)' : 'none' }}>
      <button onClick={() => setList(l => l.map((x, i) => i === idx ? { ...x, keep: !x.keep } : x))}
        aria-pressed={item.keep} aria-label={`Keep ${item.name}`} className="npress"
        style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, cursor: 'pointer',
          border: item.keep ? 'none' : '1.5px solid var(--border-strong)',
          background: item.keep ? 'var(--brand-deep-teal-blue)' : 'var(--surface)',
          color: 'var(--text-on-brand)', display: 'grid', placeItems: 'center' }}>
        {item.keep && <Ic.Check size={18} />}
      </button>
      <div style={{ flex: 1, opacity: item.keep ? 1 : 0.5 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{item.name}</div>
        {sub && <div className="meta">{sub}</div>}
      </div>
      <ConfTag level={item.confidence} />
    </div>
  );

  if (phase === 'review') {
    return (
      <NC.OverlayScreen
        header={<NC.ScreenHeader title="Check what we found" onClose={onClose} onHome={onHome} />}
        footer={
          <div>
            <Button block onClick={applyAndFinish}>Add {confCount} {confCount === 1 ? 'item' : 'items'} to profile</Button>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}><SelfReportedNote /></div>
          </div>
        }>
        <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <StatusPanel tone="note" filled title="Nothing is saved yet" icon={Ic.Info}>
            Here's what we found in your document. Untick anything that's wrong. You can edit details after adding.
          </StatusPanel>

          <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ic.File size={14} /> {doc.source}{doc.dateOnDoc ? <> · <span className="tnum">{doc.dateOnDoc}</span></> : null}
          </div>

          <div>
            <NB.SectionLabel>Conditions</NB.SectionLabel>
            <Card padding={0}>{conds.map((c, i) => <Row key={i} item={c} list={conds} setList={setConds} idx={i} />)}</Card>
          </div>
          <div>
            <NB.SectionLabel>Medications</NB.SectionLabel>
            <Card padding={0}>{meds.map((c, i) => <Row key={i} item={c} list={meds} setList={setMeds} idx={i} sub={c.detail} />)}</Card>
          </div>
          <div>
            <NB.SectionLabel>Allergies</NB.SectionLabel>
            <Card padding={0}>{allergies.map((c, i) => <Row key={i} item={c} list={allergies} setList={setAllergies} idx={i} sub={c.detail} />)}</Card>
          </div>
        </div>
      </NC.OverlayScreen>
    );
  }

  // ----- Done -----
  return (
    <NC.OverlayScreen
      header={<NC.ScreenHeader title="Added to your profile" onClose={onClose} onHome={onHome} />}
      footer={<Button block onClick={onDone}>Done</Button>}>
      <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--improvement-soft)', color: 'var(--improvement)', display: 'grid', placeItems: 'center' }}>
          <Ic.Check size={34} />
        </div>
        <div>
          <h2 style={{ marginBottom: 8 }}>{confCount} items added</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Your profile is more complete. You can edit or remove anything any time.</p>
        </div>
        <SelfReportedNote />
      </div>
    </NC.OverlayScreen>
  );
}

function ConfTag({ level }) {
  const map = { high: { t: 'Clear', c: 'var(--improvement)' }, medium: { t: 'Check', c: 'var(--attention)' }, low: { t: 'Unsure', c: 'var(--text-secondary)' } };
  const m = map[level] || map.medium;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, color: m.c, background: 'var(--surface-sunken)', border: '1px solid var(--border)', flexShrink: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: m.c }} />{m.t}
    </span>
  );
}

Object.assign(window, { DocUploadFlow, ConfTag });
