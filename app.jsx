// app.jsx — real app entry point
// Auth gate → role detection → Phone router.
// No design canvas. Supabase-off = demo mode (tech view, mock data).

function AppFrame({ children }) {
  return (
    <div className="app-frame-outer">
      <div className="app-frame-inner">
        {children}
      </div>
    </div>
  );
}

function App() {
  const { session, profile, loading, isConfigured } = window.CHAIRSIDE_SUPABASE.useAuth();
  const [authScreen, setAuthScreen] = React.useState('welcome');
  const [signupRole, setSignupRole] = React.useState(null);

  if (loading) {
    return (
      <AppFrame>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={36} />
        </div>
      </AppFrame>
    );
  }

  // Demo mode: Supabase not configured. Show the app with mock data, no auth.
  if (!isConfigured) {
    return (
      <AppFrame>
        <Phone role="tech" />
      </AppFrame>
    );
  }

  if (!session) {
    let content;
    switch (authScreen) {
      case 'role':
        content = (
          <ScrRole
            picked={signupRole}
            onPick={(r, go) => {
              setSignupRole(r);
              if (go) setAuthScreen('signup');
            }}
          />
        );
        break;
      case 'signup':
        content = (
          <ScrSignup
            role={signupRole}
            onDone={() => {}}
            onBack={() => setAuthScreen('role')}
            onLogin={() => setAuthScreen('login')}
          />
        );
        break;
      case 'login':
        content = (
          <ScrLogin
            onBack={() => setAuthScreen('welcome')}
            onDone={() => {}}
          />
        );
        break;
      default:
        content = (
          <ScrWelcome
            onContinue={() => setAuthScreen('role')}
            onLogin={() => setAuthScreen('login')}
          />
        );
    }
    return <AppFrame>{content}</AppFrame>;
  }

  // Logged in — render role-appropriate app.
  const appRole = profile?.role === 'technician' ? 'tech' : 'dentist';
  return (
    <AppFrame>
      <Phone role={appRole} />
    </AppFrame>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
