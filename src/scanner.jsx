// scanner.jsx — html5-qrcode wrapper as a React component
// Opens camera, scans any barcode, returns text via onScan().
// Falls back to manual entry if camera fails or unavailable.

function Scanner({ onScan, onClose, helperText }) {
  const containerId = React.useId().replace(/[^a-z0-9]/gi, '') + '-scanner';
  const [err, setErr] = React.useState('');
  const [starting, setStarting] = React.useState(true);
  const [manual, setManual] = React.useState('');
  const [showManual, setShowManual] = React.useState(false);
  const instanceRef = React.useRef(null);

  React.useEffect(() => {
    if (!window.Html5Qrcode) {
      setErr('Scanner library not loaded. Use manual entry.');
      setShowManual(true);
      setStarting(false);
      return;
    }

    const ele = document.getElementById(containerId);
    if (!ele) return;

    const html5QrCode = new window.Html5Qrcode(containerId, { verbose: false });
    instanceRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: (vw, vh) => {
        const side = Math.min(vw, vh) * 0.75;
        return { width: side, height: side * 0.45 };
      },
      aspectRatio: 1,
    };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        try { html5QrCode.stop().catch(() => {}); } catch {}
        onScan(decodedText);
      },
      (_msg) => {
        // ignore per-frame failures
      }
    ).then(() => {
      setStarting(false);
    }).catch((e) => {
      console.warn('Scanner start failed', e);
      setErr('Could not start camera. Use manual entry.');
      setShowManual(true);
      setStarting(false);
    });

    return () => {
      try {
        const inst = instanceRef.current;
        if (inst && inst.getState && inst.getState() === 2) {
          inst.stop().then(() => inst.clear()).catch(() => {});
        } else if (inst && inst.clear) {
          inst.clear();
        }
      } catch {}
    };
  }, [containerId]);

  function submitManual(e) {
    e && e.preventDefault();
    if (manual.trim()) onScan(manual.trim().toUpperCase());
  }

  return (
    <div className="overlay">
      <div className="topbar">
        <button className="btn-icon" onClick={onClose}><Icon name="x" size={18} /></button>
        <div style={{ flex: 1, fontWeight: 600 }}>Scan case barcode</div>
      </div>

      <div style={{
        flex: 1, position: 'relative',
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div id={containerId} style={{
          width: '100%', height: '100%',
          display: showManual ? 'none' : 'block',
        }} />

        {starting && (
          <div style={{ position: 'absolute', color: '#fff', fontSize: 14, textAlign: 'center' }}>
            <Icon name="scan" size={32} color="#fff" />
            <div style={{ marginTop: 10 }}>Starting camera…</div>
          </div>
        )}

        {/* Frame overlay */}
        {!showManual && !starting && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', left: '12%', right: '12%',
              top: '50%', transform: 'translateY(-50%)',
              aspectRatio: '2.2', maxHeight: '40%',
              border: '0',
            }}>
              {['tl', 'tr', 'bl', 'br'].map(c => {
                const base = { position: 'absolute', width: 36, height: 36, border: '4px solid var(--clay)' };
                const m = {
                  tl: { top: -4, left: -4, borderRight: 0, borderBottom: 0 },
                  tr: { top: -4, right: -4, borderLeft: 0, borderBottom: 0 },
                  bl: { bottom: -4, left: -4, borderRight: 0, borderTop: 0 },
                  br: { bottom: -4, right: -4, borderLeft: 0, borderTop: 0 },
                };
                return <div key={c} style={{ ...base, ...m[c] }} />;
              })}
            </div>
          </div>
        )}

        {showManual && (
          <form onSubmit={submitManual} style={{
            width: '100%', maxWidth: 360, padding: 20,
            background: 'var(--bg)', borderRadius: 16,
            color: 'var(--ink)',
          }}>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>Manual entry</div>
            <div className="serif" style={{ fontSize: 22, marginBottom: 14 }}>Enter case ID</div>
            <input
              className="field"
              autoFocus
              value={manual}
              onChange={e => setManual(e.target.value)}
              placeholder="DL-20260517-0001"
              style={{ fontFamily: '"Geist Mono", monospace' }}
            />
            <button type="submit" className="btn btn-clay btn-block" style={{ marginTop: 12 }} disabled={!manual.trim()}>
              Open case
            </button>
          </form>
        )}
      </div>

      <div style={{
        padding: '14px 16px calc(14px + env(safe-area-inset-bottom))',
        background: 'var(--bg)', borderTop: '1px solid var(--line)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{ flex: 1 }}>
          {err
            ? <div style={{ fontSize: 12.5, color: 'var(--danger)' }}>{err}</div>
            : <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{helperText || 'Hold the barcode steady inside the frame.'}</div>
          }
        </div>
        <button className="btn btn-soft btn-sm" onClick={() => setShowManual(s => !s)}>
          {showManual ? 'Use camera' : 'Enter manually'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Scanner });
