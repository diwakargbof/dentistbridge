// app.jsx — root app entry point
// On wide viewports (≥900px): shows desktop layout (DesktopLabDash / DesktopDentistBrowse).
// On narrow viewports: shows AppFrame + Phone shell.
// Profile picker (A = Doctor, B = Tech) replaces login flow in both cases.

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(
    () => window.matchMedia('(min-width: 900px)').matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
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

function ProfilePicker({ onPick, signingIn, error }) {
  return (
    <div className="scr">
      <div className="scr-body" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Logo size={52} />
          <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.025em', marginTop: 16, lineHeight: 1.1 }}>Chairside</div>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>Pick a profile to continue</div>
        </div>

        <div className="col gap-10">
          <button
            className="card row-tap"
            style={{
              padding: 20, width: '100%', textAlign: 'left',
              background: signingIn === 'a' ? 'var(--surface-2)' : 'var(--surface)',
            }}
            onClick={() => onPick('a')}
            disabled={!!signingIn}
          >
            <div className="row gap-14" style={{ alignItems: 'center' }}>
              <Avatar name="A" size={44} tone="info" />
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.005em' }}>
                  {signingIn === 'a' ? 'Signing in…' : 'Profile A'}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Doctor · Dentist view</div>
              </div>
            </div>
          </button>

          <button
            className="card row-tap"
            style={{
              padding: 20, width: '100%', textAlign: 'left',
              background: signingIn === 'b' ? 'var(--surface-2)' : 'var(--surface)',
            }}
            onClick={() => onPick('b')}
            disabled={!!signingIn}
          >
            <div className="row gap-14" style={{ alignItems: 'center' }}>
              <Avatar name="B" size={44} tone="clay" />
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.005em' }}>
                  {signingIn === 'b' ? 'Signing in…' : 'Profile B'}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Technician · Lab view</div>
              </div>
            </div>
          </button>

          {error && (
            <div style={{
              fontSize: 13, textAlign: 'center', marginTop: 4,
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--warn-soft)', color: '#6b4d12',
            }}>{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { session, profile, loading, isConfigured } = window.CHAIRSIDE_SUPABASE.useAuth();
  const [localRole, setLocalRole] = React.useState(null);
  const [signingIn, setSigningIn] = React.useState(null);
  const [error, setError] = React.useState(null);
  const isDesktop = useIsDesktop();

  async function handlePick(which) {
    const cfg      = window.CHAIRSIDE_CONFIG || {};
    const email    = which === 'a' ? cfg.profileAEmail    : cfg.profileBEmail;
    const password = which === 'a' ? cfg.profileAPassword : cfg.profileBPassword;

    if (isConfigured && email && password) {
      setSigningIn(which);
      setError(null);
      try {
        await window.CHAIRSIDE_SUPABASE.signIn(email, password);
        // session update triggers re-render via useAuth
      } catch (e) {
        setError(e.message || 'Sign-in failed — check your profile credentials in .env.');
        setLocalRole(which === 'a' ? 'dentist' : 'tech');
      } finally {
        setSigningIn(null);
      }
    } else {
      setLocalRole(which === 'a' ? 'dentist' : 'tech');
    }
  }

  if (loading) {
    return (
      <AppFrame>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={36} />
        </div>
      </AppFrame>
    );
  }

  const isAuthenticated = (session && profile) || localRole;

  if (isAuthenticated) {
    const role   = (session && profile)
      ? (profile.role === 'technician' ? 'tech' : 'dentist')
      : localRole;
    const userId = session?.user?.id || null;

    const handleSwitch = () => {
      if (session) window.CHAIRSIDE_SUPABASE.signOut().catch(console.error);
      else setLocalRole(null);
    };

    if (isDesktop) {
      return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--bg)' }}>
          {role === 'tech' ? (
            <DesktopLabDash
              userId={userId}
              userProfile={profile}
              onSwitchProfile={handleSwitch}
            />
          ) : (
            <DesktopDentistBrowse
              userId={userId}
              userProfile={profile}
              onSwitchProfile={handleSwitch}
            />
          )}
        </div>
      );
    }

    return (
      <AppFrame>
        <Phone
          role={role}
          userId={userId}
          userProfile={profile}
          onSwitchProfile={handleSwitch}
        />
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <ProfilePicker onPick={handlePick} signingIn={signingIn} error={error} />
    </AppFrame>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
