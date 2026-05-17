// screens-auth.jsx — phone-number login

function LoginScreen() {
  const { login } = useStore();
  const [phone, setPhone] = React.useState('+91');
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  function submit(e) {
    e && e.preventDefault();
    setErr('');
    setBusy(true);
    setTimeout(() => {
      const r = login(phone);
      setBusy(false);
      if (r.ok) {
        // Route by role
        const u = window.BENCH_CONFIG.ALLOWED_USERS[phone.replace(/\s+/g, '')];
        nav(landingFor(u));
      } else {
        setErr(r.error || 'Login failed');
      }
    }, 200);
  }

  function useDemo(p) {
    setPhone(p);
    setTimeout(() => {
      const r = login(p);
      if (r.ok) {
        const u = window.BENCH_CONFIG.ALLOWED_USERS[p];
        nav(landingFor(u));
      } else {
        setErr(r.error);
      }
    }, 50);
  }

  const DEMO = window.BENCH_CONFIG.DEMO_LOGINS || [];

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      background: 'radial-gradient(ellipse 600px 400px at 20% 10%, rgba(180,114,74,0.10), transparent 60%), var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="row gap-10" style={{ marginBottom: 28 }}>
          <Logo size={32} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.012em' }}>Bench</div>
            <div className="muted" style={{ fontSize: 11.5 }}>{window.BENCH_CONFIG.LAB_CONFIG_DEFAULTS.labName}</div>
          </div>
        </div>

        <div className="t-eyebrow" style={{ marginBottom: 12 }}>Sign in</div>
        <h1 className="serif" style={{
          fontSize: 38, lineHeight: 1.05, letterSpacing: '-0.022em',
          margin: 0, marginBottom: 14,
        }}>
          Every case<br />
          <em style={{ color: 'var(--clay-ink)', fontStyle: 'italic' }}>accounted for.</em>
        </h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.5, marginTop: 0, marginBottom: 28 }}>
          Scan in, scan out. Every stage logged with a name and a timestamp.
        </p>

        <form onSubmit={submit}>
          <label className="field-label">Phone number</label>
          <input
            className="field"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 ·····"
            autoFocus
            inputMode="tel"
            style={{ fontFamily: '"Geist Mono", monospace', letterSpacing: '0.02em' }}
          />
          {err && (
            <div style={{
              marginTop: 10, padding: '8px 12px',
              background: 'var(--danger-soft)', border: '1px solid rgba(168,71,58,0.2)',
              borderRadius: 10, color: 'var(--danger-ink)', fontSize: 13,
            }}>{err}</div>
          )}
          <button type="submit" className="btn btn-clay btn-block" style={{ marginTop: 14 }} disabled={busy}>
            {busy ? 'Signing in…' : 'Continue'}
          </button>
        </form>

        {DEMO.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div className="divider-or">demo accounts</div>
            <div className="col gap-6">
              {DEMO.map(d => (
                <button key={d.phone} type="button" className="btn btn-ghost btn-block"
                  onClick={() => useDemo(d.phone)}
                  style={{ justifyContent: 'space-between', height: 42 }}>
                  <span style={{ fontSize: 13.5 }}>{d.label}</span>
                  <span className="mono muted" style={{ fontSize: 11.5 }}>{d.phone}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{
          marginTop: 28, padding: 12,
          background: 'var(--surface-2)', borderRadius: 12,
          fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5,
        }}>
          <div className="row gap-6" style={{ fontWeight: 600, marginBottom: 4, color: 'var(--ink-2)' }}>
            <Icon name="phone" size={13} color="var(--clay)" />
            <span>Phone-list access</span>
          </div>
          Numbers are pre-approved by your lab admin. Add or revoke access in <span className="mono">config.jsx</span>.
        </div>
      </div>
    </div>
  );
}

function landingFor(u) {
  if (!u) return '/login';
  switch (u.role) {
    case 'worker':       return '/scan';
    case 'receptionist': return '/active';
    case 'owner':        return '/board';
    case 'admin':        return '/admin/stages';
    default:             return '/';
  }
}

Object.assign(window, { LoginScreen, landingFor });
