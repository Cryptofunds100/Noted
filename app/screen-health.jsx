// Health platform connection + data import. Lets Noted link to Apple Health
// and Samsung Health (live sync), or take a one-off data export uploaded by the
// patient. Both routes feed the same wearable metrics into the record.

const HEALTH_BRAND = {
  apple:   { icon: 'Heart', tint: 'var(--red-flag)' },
  samsung: { icon: 'Activity', tint: 'var(--info)' },
};

// Small platform row used in the sync sheet.
function SourceRow({ srcId, state, onToggle, lastSyncLabel }) {
  const src = DEMO.HEALTH_SOURCES[srcId];
  const brand = HEALTH_BRAND[srcId];
  const Icon = Ic[brand.icon];
  const connected = state.connected;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16,
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, display: 'grid', placeItems: 'center',
        background: 'var(--surface-sunken)', color: brand.tint }}>
        <Icon size={24} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{src.name}</div>
        <div className="meta tnum">
          {connected
            ? `Syncing from ${src.device}${lastSyncLabel ? ` \u00b7 ${lastSyncLabel}` : ''}`
            : `Connect your ${src.device}`}
        </div>
      </div>
      <NB.Button variant={connected ? 'secondary' : 'primary'} size="sm" onClick={onToggle}>
        {connected ? 'Disconnect' : 'Connect'}
      </NB.Button>
    </div>
  );
}

// Sheet: connect / sync Apple Health + Samsung Health.
function HealthSyncSheet({ open, onClose, health, setHealth, onImport, showToast }) {
  const { StatusPanel, SectionLabel, Button, Chip } = NB;

  const toggle = (srcId) => {
    setHealth(h => {
      const was = h[srcId].connected;
      const next = { ...h, [srcId]: { connected: !was, lastSync: !was ? 'Just now' : null } };
      return next;
    });
    const name = DEMO.HEALTH_SOURCES[srcId].name;
    showToast(health[srcId].connected ? `${name} disconnected.` : `Connected to ${name}.`);
  };

  return (
    <NC.Sheet open={open} onClose={onClose} title="Connect a health app">
      <StatusPanel tone="info" filled icon={Ic.Link} style={{ marginBottom: 16 }}>
        Link your watch so sleep, heart rate and activity fill in on their own. You stay in control — disconnect any time.
      </StatusPanel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SourceRow srcId="apple" state={health.apple} lastSyncLabel={health.apple.lastSync} onToggle={() => toggle('apple')} />
        <SourceRow srcId="samsung" state={health.samsung} lastSyncLabel={health.samsung.lastSync} onToggle={() => toggle('samsung')} />
      </div>

      <div style={{ marginTop: 22 }}>
        <SectionLabel>What syncs across</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DEMO.HEALTH_METRICS.map(m => (
            <Chip key={m.id} leadingDot color="var(--brand-deep-teal-blue)">{m.label}</Chip>
          ))}
        </div>
      </div>

      <StatusPanel tone="note" style={{ marginTop: 20 }}>
        Noted reads this data to help spot patterns. It's never shared without you choosing to share it.
      </StatusPanel>

      <Button variant="tertiary" block size="md" style={{ marginTop: 12 }} leadingIcon={<Ic.Upload size={18} />} onClick={onImport}>
        Import from a file instead
      </Button>
    </NC.Sheet>
  );
}

// Sheet: upload an exported Apple Health / Samsung Health file and pick which
// metrics to bring in. Parsing is simulated for the prototype.
function ImportHealthSheet({ open, onClose, defaultSource = 'apple', health, setHealth, onDone }) {
  const { StatusPanel, SectionLabel, Button, SegmentedControl } = NB;
  const [source, setSource] = React.useState(defaultSource);
  const [file, setFile] = React.useState(null); // { name }
  const [picked, setPicked] = React.useState(() => DEMO.HEALTH_METRICS.map(m => m.id));
  const [importing, setImporting] = React.useState(false);
  const fileRef = React.useRef(null);

  // Reset working state each time the sheet opens.
  React.useEffect(() => {
    if (!open) return;
    setSource(defaultSource);
    setFile(null);
    setPicked(DEMO.HEALTH_METRICS.map(m => m.id));
    setImporting(false);
  }, [open]);

  const src = DEMO.HEALTH_SOURCES[source];
  const togglePick = (id) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile({ name: f.name });
  };

  const runImport = () => {
    if (!file || picked.length === 0) return;
    setImporting(true);
    setTimeout(() => {
      const stamp = { source, file: file.name, metrics: picked.slice(), at: notedTodayLabel() };
      setHealth(h => ({ ...h, imports: [stamp, ...(h.imports || [])] }));
      setImporting(false);
      onDone(picked.length, src.name);
      onClose();
    }, 1100);
  };

  return (
    <NC.Sheet open={open} onClose={onClose} title="Import health data">
      <StatusPanel tone="info" style={{ marginBottom: 16 }}>
        Already have an export from your phone? Upload it here and choose what to bring in. Nothing leaves your device until you share a report.
      </StatusPanel>

      <SectionLabel>Where is it from?</SectionLabel>
      <SegmentedControl value={source} onChange={setSource}
        options={[{ value: 'apple', label: 'Apple Health' }, { value: 'samsung', label: 'Samsung Health' }]} />

      <div className="meta" style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <Ic.Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>On your phone: {src.exportHint}. The file is usually called <span className="tnum">{src.exportName}</span>.</span>
      </div>

      {/* Drop zone / file picker */}
      <div style={{ marginTop: 16 }}>
        <input ref={fileRef} type="file" accept=".zip,.xml,.csv,.json" onChange={onFile} style={{ display: 'none' }} aria-hidden="true" />
        <button onClick={() => fileRef.current && fileRef.current.click()} className="npress"
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 18, cursor: 'pointer',
            background: file ? 'var(--improvement-soft)' : 'var(--surface-sunken)',
            border: `1.5px ${file ? 'solid' : 'dashed'} ${file ? 'var(--improvement)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, display: 'grid', placeItems: 'center',
            background: 'var(--surface)', color: file ? 'var(--improvement)' : 'var(--brand-deep-teal-blue)' }}>
            {file ? <Ic.CheckCirc size={24} /> : <Ic.Upload size={24} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{file ? 'File ready to import' : 'Choose an export file'}</div>
            <div className="meta tnum" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file ? file.name : 'ZIP, XML, CSV or JSON'}
            </div>
          </div>
          {file && <span style={{ color: 'var(--text-secondary)' }}><Ic.Edit size={18} /></span>}
        </button>
      </div>

      {/* Metric checklist */}
      <div style={{ marginTop: 20 }}>
        <SectionLabel trailing={
          <button onClick={() => setPicked(picked.length === DEMO.HEALTH_METRICS.length ? [] : DEMO.HEALTH_METRICS.map(m => m.id))}
            className="npress" style={{ border: 0, background: 'transparent', color: 'var(--brand-deep-teal-blue)', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            {picked.length === DEMO.HEALTH_METRICS.length ? 'Clear all' : 'Select all'}
          </button>
        }>What to bring in</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DEMO.HEALTH_METRICS.map(m => {
            const Icon = Ic[m.icon];
            const on = picked.includes(m.id);
            return (
              <button key={m.id} onClick={() => togglePick(m.id)} aria-pressed={on} className="npress"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                  background: 'var(--surface)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit',
                  border: on ? '1.5px solid var(--brand-deep-teal-blue)' : '1.5px solid var(--border)' }}>
                <span style={{ color: on ? 'var(--brand-deep-teal-blue)' : 'var(--text-secondary)', flexShrink: 0 }}><Icon size={20} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{m.label}</div>
                </div>
                <span style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center',
                  background: on ? 'var(--brand-deep-teal-blue)' : 'transparent', color: 'var(--text-on-brand)',
                  border: on ? '0' : '1.5px solid var(--border-strong)' }}>
                  {on && <Ic.Check size={16} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Button block disabled={!file || picked.length === 0 || importing}
          leadingIcon={importing ? null : <Ic.Download size={18} />} onClick={runImport}>
          {importing ? 'Importing\u2026' : `Import ${picked.length} ${picked.length === 1 ? 'type' : 'types'}`}
        </Button>
        <div className="meta" style={{ textAlign: 'center', marginTop: 10 }}>
          Imported data is labelled by source and date so your clinician knows where it came from.
        </div>
      </div>
    </NC.Sheet>
  );
}

Object.assign(window, { HealthSyncSheet, ImportHealthSheet });
