// phone.jsx — interactive prototype router
// Single iPhone frame that the user can click through.
// Holds nav state, role toggle, and modal stack.

function Phone({ role = 'tech', initialScreen, embedded = false }) {
  const [screen, setScreen] = React.useState(initialScreen || (role === 'tech' ? 'tech-home' : 'dent-home'));
  const [caseView, setCaseView] = React.useState('board');
  const [modal, setModal] = React.useState(null);
  const [shadeImageUrl, setShadeImageUrl] = React.useState(null);
  const [selectedCase, setSelectedCase] = React.useState('C-4821');
  const [selectedService, setSelectedService] = React.useState('s1');
  const [selectedTech, setSelectedTech] = React.useState('t1');
  const [signupRole, setSignupRole] = React.useState(null);

  // When role changes externally, reset home
  React.useEffect(() => {
    setScreen(role === 'tech' ? 'tech-home' : 'dent-home');
  }, [role]);

  const techTabs = [
    { id: 'tech-home', icon: 'cases', label: 'Cases' },
    { id: 'tech-catalog', icon: 'catalog', label: 'Catalog' },
    { id: 'tech-templates', icon: 'template', label: 'Templates' },
    { id: 'tech-profile', icon: 'profile', label: 'Lab' },
  ];
  const dentTabs = [
    { id: 'dent-home', icon: 'home', label: 'Home' },
    { id: 'dent-browse', icon: 'search', label: 'Labs' },
    { id: 'dent-archive', icon: 'archive', label: 'Archive' },
    { id: 'dent-profile', icon: 'profile', label: 'Me' },
  ];
  const tabs = role === 'tech' ? techTabs : dentTabs;
  const activeTab = tabs.find(t => screen.startsWith(t.id.split('-').slice(0, 2).join('-')))?.id || tabs[0].id;
  const onTab = id => setScreen(id);

  // Screens
  let body = null;
  switch (screen) {
    case 'welcome':
      body = <ScrWelcome onContinue={() => setScreen('role')} />;
      break;
    case 'role':
      body = <ScrRole picked={signupRole} onPick={(r, go) => { setSignupRole(r); if (go) setScreen('signup'); }} />;
      break;
    case 'signup':
      body = <ScrSignup role={signupRole} onDone={() => setScreen(signupRole === 'technician' ? 'tech-home' : 'dent-home')} />;
      break;

    case 'tech-home':
      body = <TechHome caseView={caseView} setCaseView={setCaseView}
        onOpenCase={(id) => { setSelectedCase(id); setScreen('tech-case'); }} />;
      break;
    case 'tech-case':
      body = <TechCaseDetail caseId={selectedCase}
        onBack={() => setScreen('tech-home')}
        onOpenChat={() => setScreen('chat-tech')}
        onAdvance={() => alert('Stage advanced (demo)')} />;
      break;
    case 'tech-catalog':
      body = <TechCatalog onOpenService={(id) => { setSelectedService(id); setScreen('tech-workflow'); }} />;
      break;
    case 'tech-workflow':
      body = <TechWorkflowEditor serviceId={selectedService} onBack={() => setScreen('tech-catalog')} />;
      break;
    case 'tech-templates':
      body = <TechTemplates />;
      break;
    case 'tech-profile':
      body = <LabProfileScreen />;
      break;

    case 'dent-home':
      body = <DentistHome
        onOpenCase={(id) => { setSelectedCase(id); setScreen('chat-dent'); }}
        onBrowse={() => setScreen('dent-browse')} />;
      break;
    case 'dent-browse':
      body = <DentistBrowse onOpenTech={(id) => { setSelectedTech(id); setScreen('dent-tech'); }} />;
      break;
    case 'dent-tech':
      body = <DentistTechProfile techId={selectedTech}
        onBack={() => setScreen('dent-browse')}
        onAssign={(sid) => { if (sid) setSelectedService(sid); setScreen('dent-assign'); }} />;
      break;
    case 'dent-assign':
      body = <DentistAssign techId={selectedTech} serviceId={selectedService}
        onBack={() => setScreen('dent-tech')}
        onSent={() => setScreen('chat-dent')} />;
      break;
    case 'dent-archive':
      body = <ArchiveScreen role="dentist" />;
      break;
    case 'dent-profile':
      body = <DentistMeScreen />;
      break;

    case 'chat-tech':
      body = <ChatScreen role="tech" caseId={selectedCase}
        onBack={() => setScreen('tech-case')}
        onOpenShade={(url) => { setShadeImageUrl(url || null); setModal('shade'); }}
        onOpenPay={() => setModal('pay')} />;
      break;
    case 'chat-dent':
      body = <ChatScreen role="dentist" caseId={selectedCase}
        onBack={() => setScreen('dent-home')}
        onOpenShade={(url) => { setShadeImageUrl(url || null); setModal('shade'); }}
        onOpenPay={() => setModal('pay')} />;
      break;
    default:
      body = <div className="scr" />;
  }

  const isChrome = ['welcome', 'role', 'signup'].includes(screen)
    || screen.startsWith('chat-')
    || ['tech-case', 'tech-workflow', 'dent-tech', 'dent-assign'].includes(screen);

  const showTab = !isChrome;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {body}
        {modal === 'shade' && (
          <ShadePicker
            imageUrl={shadeImageUrl}
            onClose={() => { setModal(null); setShadeImageUrl(null); }}
            onSave={(result) => {
              if (window.CHAIRSIDE_SUPABASE?.isConfigured && selectedCase) {
                window.CHAIRSIDE_SUPABASE.updateCaseNotes(selectedCase, { shade: result.best_match })
                  .catch(e => console.error('Save shade:', e));
              }
              setModal(null);
              setShadeImageUrl(null);
            }}
          />
        )}
        {modal === 'pay' && <PaymentConfirm onClose={() => setModal(null)} onConfirm={() => setModal(null)} />}
      </div>
      {showTab && <Tabbar tabs={tabs} active={activeTab} onChange={onTab} />}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', background: showTab ? 'rgba(253,251,246,0.85)' : 'transparent' }} />
    </div>
  );
}

// Lightweight stubs for tabs not separately fleshed out
function LabProfileScreen() {
  const me = window.CHAIRSIDE_DATA.TECHS[0];
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Lab" />
        <div style={{ padding: '0 20px 20px' }} className="col gap-14">
          <div className="card row gap-12" style={{ alignItems: 'flex-start' }}>
            <Avatar name={me.name} size={56} tone="clay" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{me.lab}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{me.name} · {me.city}</div>
              <div className="row gap-8" style={{ marginTop: 8 }}>
                <Pill tone="ok" dot>Verified</Pill>
                <Pill>{me.rating}★</Pill>
              </div>
            </div>
          </div>
          <SectionList title="Workspace" rows={[
            { icon: 'workflow', label: 'Services & workflows', sub: '6 services' },
            { icon: 'template', label: 'Message templates', sub: '12 templates' },
            { icon: 'archive', label: 'Archive', sub: '142 closed cases' },
          ]} />
          <SectionList title="Settings" rows={[
            { icon: 'wallet', label: 'Payments & UPI' },
            { icon: 'bell', label: 'Notifications' },
          ]} />
          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 4 }}
            onClick={() => window.CHAIRSIDE_SUPABASE?.signOut().catch(console.error)}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function DentistMeScreen() {
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Me" />
        <div style={{ padding: '0 20px 20px' }} className="col gap-14">
          <div className="card row gap-12" style={{ alignItems: 'flex-start' }}>
            <Avatar name="Anaya Rao" size={56} tone="info" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Dr. Anaya Rao</div>
              <div className="muted" style={{ fontSize: 12.5 }}>Rao Family Dental · Mumbai</div>
            </div>
          </div>
          <SectionList title="Workspace" rows={[
            { icon: 'archive', label: 'Case archive', sub: '38 past cases' },
            { icon: 'lab', label: 'Saved labs', sub: '4 favorites' },
            { icon: 'wallet', label: 'Payment history' },
          ]} />
          <SectionList title="Settings" rows={[
            { icon: 'bell', label: 'Notifications' },
            { icon: 'profile', label: 'Clinic profile' },
          ]} />
          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 4 }}
            onClick={() => window.CHAIRSIDE_SUPABASE?.signOut().catch(console.error)}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionList({ title, rows }) {
  return (
    <div>
      <div className="t-eyebrow" style={{ marginLeft: 2, marginBottom: 8 }}>{title}</div>
      <div className="card" style={{ padding: 0 }}>
        {rows.map((r, i) => (
          <div key={r.label} className="row gap-12 row-tap" style={{
            padding: '14px 14px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : '0',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'var(--surface-2)', color: 'var(--ink-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={r.icon} size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</div>
              {r.sub && <div className="muted" style={{ fontSize: 12 }}>{r.sub}</div>}
            </div>
            <Icon name="chev-r" size={16} color="var(--muted)" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchiveScreen({ role }) {
  const { CASES, SERVICES, DENTISTS, TECHS } = window.CHAIRSIDE_DATA;
  // Mock archived cases grouped
  const groups = role === 'dentist'
    ? [{ name: 'Iyer Dental Lab', items: ['Zirconia Crown · #16', 'Zirconia Crown · #25', 'Bridge · #34–36'] },
       { name: 'Bombay Dental Studio', items: ['Porcelain Veneer · UR1', 'Porcelain Veneer · UR2'] }]
    : [{ name: 'Dr. Anaya Rao', items: ['Zirconia Crown · #14', 'Night Guard', 'Zirconia Crown · #25'] },
       { name: 'Dr. Karan Mehta', items: ['Bridge · #34–36', 'E.max Onlay · #36'] }];
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Archive" sub="Past cases, grouped." />
        <div style={{ padding: '0 20px 20px' }} className="col gap-16">
          {groups.map(g => (
            <div key={g.name}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <div className="row gap-8">
                  <Avatar name={g.name} size={32} tone="clay" />
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{g.name}</div>
                </div>
                <span className="t-xs muted">{g.items.length}</span>
              </div>
              <div className="card" style={{ padding: 0 }}>
                {g.items.map((it, i) => (
                  <div key={it} className="row gap-10 row-tap" style={{
                    padding: '12px 14px',
                    borderBottom: i < g.items.length - 1 ? '1px solid var(--line)' : '0',
                  }}>
                    <Icon name="check-circle" size={16} color="var(--ok)" />
                    <span style={{ flex: 1, fontSize: 13.5 }}>{it}</span>
                    <span className="t-xs muted">paid</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Phone, LabProfileScreen, DentistMeScreen, ArchiveScreen, SectionList });
