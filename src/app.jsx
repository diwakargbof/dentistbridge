import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Auth from './components/auth/Auth.jsx';
import { TabBar, Spinner, Logo } from './components/ui/index.jsx';

// ── Dentist app ───────────────────────────────────────────────
import DentistDashboard from './components/dentist/Dashboard.jsx';
import BrowseLabs       from './components/dentist/BrowseLabs.jsx';
import NewCase          from './components/dentist/NewCase.jsx';
import DentistArchive   from './components/dentist/Archive.jsx';

// ── Technician app ────────────────────────────────────────────
import TechDashboard from './components/tech/Dashboard.jsx';
import TechNewCase   from './components/tech/NewCase.jsx';
import Services      from './components/tech/Services.jsx';
import Templates     from './components/tech/Templates.jsx';
import TechArchive   from './components/tech/Archive.jsx';

// ── Shared ────────────────────────────────────────────────────
import Chat    from './components/shared/Chat.jsx';
import Profile from './components/shared/Profile.jsx';

// ── Desktop breakpoint ─────────────────────────────────────────
function useIsDesktop() {
  const [v, set] = useState(() => window.matchMedia('(min-width: 900px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const h = e => set(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return v;
}

// ── Dentist navigator ─────────────────────────────────────────
function DentistApp() {
  const [tab, setTab]     = useState('home');
  const [stack, setStack] = useState([]); // [{ screen, props }]

  const push = (screen, props = {}) => setStack(s => [...s, { screen, props }]);
  const pop  = () => setStack(s => s.slice(0, -1));

  const current = stack[stack.length - 1];

  if (current) {
    const { screen, props } = current;
    if (screen === 'chat')    return <Chat initialCase={props.case} onBack={pop} role="dentist" />;
    if (screen === 'lab')     return <BrowseLabs onBack={pop} onSelectLab={lab => push('new-case', { lab })} />;
    if (screen === 'new-case') return <NewCase lab={props.lab} onBack={pop} onCreated={c => { pop(); pop(); push('chat', { case: c }); }} />;
    if (screen === 'archive') return <DentistArchive onBack={pop} onOpenCase={c => push('chat', { case: c })} />;
  }

  const tabs = [
    { id: 'home',    label: 'Cases',    icon: 'inbox' },
    { id: 'browse',  label: 'Browse',   icon: 'search' },
    { id: 'profile', label: 'Profile',  icon: 'user' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'home'    && <DentistDashboard onOpenCase={c => push('chat', { case: c })} onBrowse={() => push('lab')} onOpenArchive={() => push('archive')} />}
        {tab === 'browse'  && <BrowseLabs onBack={() => setTab('home')} onSelectLab={lab => push('new-case', { lab })} />}
        {tab === 'profile' && <Profile />}
      </div>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}

// ── Technician navigator ──────────────────────────────────────
function TechApp() {
  const [tab, setTab]     = useState('home');
  const [stack, setStack] = useState([]);

  const push = (screen, props = {}) => setStack(s => [...s, { screen, props }]);
  const pop  = () => setStack(s => s.slice(0, -1));

  const current = stack[stack.length - 1];

  if (current) {
    const { screen, props } = current;
    if (screen === 'chat')     return <Chat initialCase={props.case} onBack={pop} role="tech" />;
    if (screen === 'archive')  return <TechArchive onBack={pop} onOpenCase={c => push('chat', { case: c })} />;
    if (screen === 'new-case') return <TechNewCase onBack={pop} onCreated={c => { pop(); push('chat', { case: c }); }} />;
  }

  const tabs = [
    { id: 'home',      label: 'Cases',     icon: 'inbox' },
    { id: 'catalog',   label: 'Catalog',   icon: 'briefcase' },
    { id: 'templates', label: 'Templates', icon: 'zap' },
    { id: 'profile',   label: 'Profile',   icon: 'user' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'home'      && <TechDashboard onOpenCase={c => push('chat', { case: c })} onOpenCatalog={() => setTab('catalog')} onOpenArchive={() => push('archive')} onNewCase={() => push('new-case')} />}
        {tab === 'catalog'   && <Services />}
        {tab === 'templates' && <Templates />}
        {tab === 'profile'   && <Profile />}
      </div>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}

// ── Desktop layout ────────────────────────────────────────────
function DesktopLayout({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 0 0 1px var(--line), 0 0 60px rgba(28,22,18,0.07)', background: 'var(--bg)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// ── Mobile layout ─────────────────────────────────────────────
function MobileLayout({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────
function Root() {
  const { profile, loading } = useAuth();
  const isDesktop = useIsDesktop();

  const Wrapper = isDesktop ? DesktopLayout : MobileLayout;

  if (loading) {
    return (
      <Wrapper>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Logo size={40} />
          <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Chairside</div>
          <div style={{ marginTop: 8 }}>
            <Spinner />
          </div>
        </div>
      </Wrapper>
    );
  }

  if (!profile) {
    return (
      <Wrapper>
        <Auth />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {profile.role === 'technician' ? <TechApp /> : <DentistApp />}
    </Wrapper>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
);
