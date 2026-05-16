// app.jsx — root app entry point
// Phone-number login: 8919744177 → technician, 9440134493 → dentist.
// Session persisted in localStorage. Supabase optional (real data when configured).

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(
    () => window.matchMedia('(min-width: 900px)').matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const handler = e => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

// ── Static phone → profile mapping ───────────────────────────
const PHONE_PROFILES = {
  '8919744177': { id: 'static-tech-vikram', role: 'technician', full_name: 'Vikram Iyer',   phone: '8919744177', city: 'Mumbai' },
  '9440134493': { id: 'static-dent-anaya',  role: 'dentist',    full_name: 'Dr. Anaya Rao', phone: '9440134493', city: 'Mumbai' },
};

function loadSession() {
  try { const s = localStorage.getItem('cs_session'); return s ? JSON.parse(s) : null; }
  catch (_) { return null; }
}
function saveSession(p) { try { localStorage.setItem('cs_session', JSON.stringify(p)); } catch (_) {} }
function clearSession()  { try { localStorage.removeItem('cs_session'); }               catch (_) {} }

// ── Shells ────────────────────────────────────────────────────
function DesktopShell({ children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)', overflow: 'hidden',
      fontFamily: 'Geist, ui-sans-serif, sans-serif', color: 'var(--ink)',
    }}>
      {children}
    </div>
  );
}

function AppFrame({ children }) {
  return (
    <div className="app-frame-outer">
      <div className="app-frame-inner">
        {children}
      </div>
    </div>
  );
}

// ── Phone login – mobile ──────────────────────────────────────
function PhoneLogin({ onLogin, error }) {
  const [phone, setPhone] = React.useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(phone.replace(/\D/g, ''));
  }

  return (
    <div className="scr">
      <div className="scr-body" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Logo size={52} />
          <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.025em', marginTop: 16, lineHeight: 1.1 }}>
            Chairside
          </div>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>Between the chair and the bench.</div>
        </div>

        <form onSubmit={handleSubmit} className="col gap-12">
          <div className="col gap-6">
            <label className="t-xs muted" style={{ marginLeft: 2 }}>Mobile number</label>
            <input
              className="field"
              type="tel"
              inputMode="numeric"
              placeholder="Enter your phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <div style={{
              fontSize: 13, padding: '10px 14px', borderRadius: 10,
              background: 'var(--warn-soft)', color: '#6b4d12',
            }}>{error}</div>
          )}
          <button className="btn btn-clay btn-block" type="submit" disabled={!phone.trim()}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Phone login – desktop ─────────────────────────────────────
function DesktopPhoneLogin({ onLogin, error }) {
  const [phone, setPhone] = React.useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(phone.replace(/\D/g, ''));
  }

  return (
    <DesktopShell>
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 40px',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, maxWidth: 820, width: '100%', alignItems: 'center',
        }}>
          {/* Left: branding */}
          <div>
            <Logo size={52} />
            <div className="serif" style={{ fontSize: 52, letterSpacing: '-0.028em', marginTop: 20, lineHeight: 1.04 }}>
              Chairside
            </div>
            <div style={{ fontSize: 16, color: 'var(--ink-3)', marginTop: 14, lineHeight: 1.65, maxWidth: 320 }}>
              Between the chair and the bench. Case-by-case workflow tracking for dental labs and dentists.
            </div>
          </div>

          {/* Right: form */}
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 20 }}>Sign in</div>
            <form onSubmit={handleSubmit} className="col gap-12">
              <div className="col gap-8">
                <label className="t-xs muted" style={{ marginLeft: 2 }}>Mobile number</label>
                <input
                  className="field"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoFocus
                  style={{ fontSize: 16 }}
                />
              </div>
              {error && (
                <div style={{
                  fontSize: 13, padding: '10px 14px', borderRadius: 10,
                  background: 'var(--warn-soft)', color: '#6b4d12',
                }}>{error}</div>
              )}
              <button className="btn btn-clay btn-block" type="submit" disabled={!phone.trim()}>
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ── Root app ──────────────────────────────────────────────────
function App() {
  const [profile, setProfile] = React.useState(() => loadSession());
  const [error, setError]     = React.useState(null);
  const isDesktop             = useIsDesktop();

  function handleLogin(phone) {
    const p = PHONE_PROFILES[phone];
    if (!p) {
      setError('Phone number not recognised. Please try again.');
      return;
    }
    setError(null);
    saveSession(p);
    setProfile(p);
  }

  function handleSwitch() {
    clearSession();
    setProfile(null);
    setError(null);
  }

  if (profile) {
    const role = profile.role === 'technician' ? 'tech' : 'dentist';

    if (isDesktop) {
      return (
        <DesktopShell>
          {role === 'tech'
            ? <DesktopLabDash       userId={profile.id} userProfile={profile} onSwitchProfile={handleSwitch} />
            : <DesktopDentistBrowse userId={profile.id} userProfile={profile} onSwitchProfile={handleSwitch} />
          }
        </DesktopShell>
      );
    }

    return (
      <AppFrame>
        <Phone role={role} userId={profile.id} userProfile={profile} onSwitchProfile={handleSwitch} />
      </AppFrame>
    );
  }

  if (isDesktop) return <DesktopPhoneLogin onLogin={handleLogin} error={error} />;
  return (
    <AppFrame>
      <PhoneLogin onLogin={handleLogin} error={error} />
    </AppFrame>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
