// phone.jsx — interactive prototype router
// Routes between screens, threads userId/userProfile to all screens.
// selectedCase / selectedLab / selectedService are full objects, not IDs.

function Phone({ role = 'tech', userId, userProfile, onSwitchProfile }) {
  const [screen, setScreen] = React.useState(role === 'tech' ? 'tech-home' : 'dent-home');
  const [caseView, setCaseView] = React.useState('board');
  const [modal, setModal] = React.useState(null);
  const [shadeImageUrl, setShadeImageUrl] = React.useState(null);
  const [selectedCase, setSelectedCase] = React.useState(null);   // full case object
  const [selectedLab, setSelectedLab] = React.useState(null);     // full lab object
  const [selectedService, setSelectedService] = React.useState(null); // full service object

  React.useEffect(() => {
    setScreen(role === 'tech' ? 'tech-home' : 'dent-home');
  }, [role]);

  const techTabs = [
    { id: 'tech-home',      icon: 'cases',    label: 'Cases' },
    { id: 'tech-catalog',   icon: 'catalog',  label: 'Catalog' },
    { id: 'tech-templates', icon: 'template', label: 'Templates' },
    { id: 'tech-profile',   icon: 'profile',  label: 'Lab' },
  ];
  const dentTabs = [
    { id: 'dent-home',    icon: 'home',    label: 'Home' },
    { id: 'dent-browse',  icon: 'search',  label: 'Labs' },
    { id: 'dent-archive', icon: 'archive', label: 'Archive' },
    { id: 'dent-profile', icon: 'profile', label: 'Me' },
  ];
  const tabs = role === 'tech' ? techTabs : dentTabs;
  const activeTab = tabs.find(t => screen.startsWith(t.id.split('-').slice(0, 2).join('-')))?.id || tabs[0].id;

  let body = null;
  switch (screen) {
    // ── Tech screens ──────────────────────────────────────────
    case 'tech-home':
      body = (
        <TechHome
          userId={userId}
          userProfile={userProfile}
          caseView={caseView}
          setCaseView={setCaseView}
          onOpenCase={c => { setSelectedCase(c); setScreen('tech-case'); }}
        />
      );
      break;

    case 'tech-case':
      body = (
        <TechCaseDetail
          cas={selectedCase}
          userId={userId}
          onBack={() => setScreen('tech-home')}
          onOpenChat={() => setScreen('chat-tech')}
          onAdvance={updated => setSelectedCase(prev => ({ ...prev, stage: updated.stage }))}
        />
      );
      break;

    case 'tech-catalog':
      body = (
        <TechCatalog
          userId={userId}
          onOpenService={svc => { setSelectedService(svc); setScreen('tech-workflow'); }}
        />
      );
      break;

    case 'tech-workflow':
      body = (
        <TechWorkflowEditor
          service={selectedService}
          onBack={() => setScreen('tech-catalog')}
        />
      );
      break;

    case 'tech-templates':
      body = <TechTemplates />;
      break;

    case 'tech-profile':
      body = (
        <LabProfileScreen
          userId={userId}
          userProfile={userProfile}
          onSwitchProfile={onSwitchProfile}
        />
      );
      break;

    // ── Dentist screens ───────────────────────────────────────
    case 'dent-home':
      body = (
        <DentistHome
          userId={userId}
          userProfile={userProfile}
          onOpenCase={c => { setSelectedCase(c); setScreen('chat-dent'); }}
          onBrowse={() => setScreen('dent-browse')}
        />
      );
      break;

    case 'dent-browse':
      body = (
        <DentistBrowse
          onOpenLab={lab => { setSelectedLab(lab); setScreen('dent-tech'); }}
        />
      );
      break;

    case 'dent-tech':
      body = (
        <DentistTechProfile
          lab={selectedLab}
          onBack={() => setScreen('dent-browse')}
          onAssign={svc => { setSelectedService(svc || null); setScreen('dent-assign'); }}
        />
      );
      break;

    case 'dent-assign':
      body = (
        <DentistAssign
          lab={selectedLab}
          userId={userId}
          initialService={selectedService}
          onBack={() => setScreen('dent-tech')}
          onSent={newCase => { setSelectedCase(newCase); setScreen('chat-dent'); }}
        />
      );
      break;

    case 'dent-archive':
      body = <ArchiveScreen role="dentist" userId={userId} />;
      break;

    case 'dent-profile':
      body = (
        <DentistMeScreen
          userId={userId}
          userProfile={userProfile}
          onSwitchProfile={onSwitchProfile}
        />
      );
      break;

    // ── Chat screens ──────────────────────────────────────────
    case 'chat-tech':
      body = (
        <ChatScreen
          cas={selectedCase}
          role="tech"
          userId={userId}
          onBack={() => setScreen('tech-case')}
          onOpenShade={url => { setShadeImageUrl(url || null); setModal('shade'); }}
          onOpenPay={() => setModal('pay')}
        />
      );
      break;

    case 'chat-dent':
      body = (
        <ChatScreen
          cas={selectedCase}
          role="dentist"
          userId={userId}
          onBack={() => setScreen('dent-home')}
          onOpenShade={url => { setShadeImageUrl(url || null); setModal('shade'); }}
          onOpenPay={() => setModal('pay')}
        />
      );
      break;

    default:
      body = <div className="scr" />;
  }

  const isChrome = screen.startsWith('chat-')
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
            onSave={result => {
              if (selectedCase?.id) {
                window.CHAIRSIDE_SUPABASE.updateCaseNotes(selectedCase.id, { shade: result.best_match })
                  .catch(e => console.error('Save shade:', e));
              }
              setModal(null);
              setShadeImageUrl(null);
            }}
          />
        )}

        {modal === 'pay' && (
          <PaymentConfirm
            cas={selectedCase}
            onClose={() => setModal(null)}
            onConfirm={() => {
              if (selectedCase?.id) {
                const amount = selectedCase.service?.price || 0;
                window.CHAIRSIDE_SUPABASE.updateCasePayment(selectedCase.id, 'paid', amount)
                  .then(updated => {
                    if (updated) setSelectedCase(prev => ({ ...prev, payment_status: 'paid', payment_amount: amount }));
                  })
                  .catch(e => console.error('Confirm payment:', e));
              }
              setModal(null);
            }}
          />
        )}
      </div>
      {showTab && <Tabbar tabs={tabs} active={activeTab} onChange={id => setScreen(id)} />}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', background: showTab ? 'rgba(253,251,246,0.85)' : 'transparent' }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Tech lab profile screen
// ──────────────────────────────────────────────────────────────
function LabProfileScreen({ userId, userProfile, onSwitchProfile }) {
  const myLab = window.CHAIRSIDE_SUPABASE.useMyLab(userId);
  const services = myLab?.services || [];

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Lab" />
        <div style={{ padding: '0 20px 20px' }} className="col gap-14">
          <div className="card row gap-12" style={{ alignItems: 'flex-start' }}>
            <Avatar name={userProfile?.full_name || 'Lab'} size={56} tone="clay" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{myLab?.name || (userId ? '…' : '—')}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {userProfile?.full_name || '—'}{myLab?.city ? ` · ${myLab.city}` : ''}
              </div>
              <div className="row gap-8" style={{ marginTop: 8 }}>
                {myLab?.verified && <Pill tone="ok" dot>Verified</Pill>}
                {myLab?.rating > 0 && <Pill>{myLab.rating}★</Pill>}
              </div>
            </div>
          </div>

          <SectionList title="Workspace" rows={[
            { icon: 'workflow', label: 'Services & workflows', sub: `${services.length} services` },
            { icon: 'template', label: 'Message templates' },
            { icon: 'archive', label: 'Archive' },
          ]} />

          <SectionList title="Settings" rows={[
            { icon: 'wallet', label: 'Payments & UPI' },
            { icon: 'bell', label: 'Notifications' },
          ]} />

          <button className="btn btn-ghost btn-block" style={{ marginTop: 4 }} onClick={onSwitchProfile}>
            Switch profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Dentist "Me" screen
// ──────────────────────────────────────────────────────────────
function DentistMeScreen({ userId, userProfile, onSwitchProfile }) {
  const myClinic = window.CHAIRSIDE_SUPABASE.useMyClinic(userId);

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Me" />
        <div style={{ padding: '0 20px 20px' }} className="col gap-14">
          <div className="card row gap-12" style={{ alignItems: 'flex-start' }}>
            <Avatar name={userProfile?.full_name || 'Doctor'} size={56} tone="info" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{userProfile?.full_name || '—'}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {myClinic?.name || '—'}{(myClinic?.city || userProfile?.city) ? ` · ${myClinic?.city || userProfile?.city}` : ''}
              </div>
            </div>
          </div>

          <SectionList title="Workspace" rows={[
            { icon: 'archive', label: 'Case archive' },
            { icon: 'lab', label: 'Saved labs' },
            { icon: 'wallet', label: 'Payment history' },
          ]} />

          <SectionList title="Settings" rows={[
            { icon: 'bell', label: 'Notifications' },
            { icon: 'profile', label: 'Clinic profile' },
          ]} />

          <button className="btn btn-ghost btn-block" style={{ marginTop: 4 }} onClick={onSwitchProfile}>
            Switch profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Archive screen (real data from Supabase)
// ──────────────────────────────────────────────────────────────
function ArchiveScreen({ role, userId }) {
  const [archivedCases, setArchivedCases] = React.useState(null);

  React.useEffect(() => {
    if (!userId) { setArchivedCases([]); return; }
    const supabaseRole = role === 'tech' ? 'technician' : 'dentist';
    window.CHAIRSIDE_SUPABASE.fetchArchivedCases(supabaseRole, userId)
      .then(data => setArchivedCases(data ?? []));
  }, [role, userId]);

  // Group by counterpart
  const groups = React.useMemo(() => {
    if (!archivedCases) return null;
    const map = {};
    archivedCases.forEach(c => {
      const key = role === 'tech' ? (c.dentist?.full_name || 'Unknown') : (c.lab?.name || 'Unknown');
      if (!map[key]) map[key] = [];
      map[key].push(`${c.service?.title || 'Service'} · ${c.patient_ref || '—'}`);
    });
    return map;
  }, [archivedCases, role]);

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Archive" sub="Closed cases" />
        {archivedCases === null ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : archivedCases.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 6 }}>No archived cases yet</div>
            <div style={{ color: 'var(--muted-2)', fontSize: 12 }}>Completed cases will appear here.</div>
          </div>
        ) : (
          <div style={{ padding: '0 20px 20px' }} className="col gap-16">
            {Object.entries(groups).map(([name, items]) => (
              <div key={name}>
                <div className="row between" style={{ marginBottom: 8 }}>
                  <div className="row gap-8">
                    <Avatar name={name} size={32} tone="clay" />
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{name}</div>
                  </div>
                  <span className="t-xs muted">{items.length}</span>
                </div>
                <div className="card" style={{ padding: 0 }}>
                  {items.map((it, i) => (
                    <div key={i} className="row gap-10 row-tap" style={{ padding: '12px 14px', borderBottom: i < items.length - 1 ? '1px solid var(--line)' : '0' }}>
                      <Icon name="check-circle" size={16} color="var(--ok)" />
                      <span style={{ flex: 1, fontSize: 13.5 }}>{it}</span>
                      <span className="t-xs muted">paid</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Shared sub-components
// ──────────────────────────────────────────────────────────────
function SectionList({ title, rows }) {
  return (
    <div>
      <div className="t-eyebrow" style={{ marginLeft: 2, marginBottom: 8 }}>{title}</div>
      <div className="card" style={{ padding: 0 }}>
        {rows.map((r, i) => (
          <div key={r.label} className="row gap-12 row-tap" style={{ padding: '14px 14px', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : '0' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface-2)', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

Object.assign(window, { Phone, LabProfileScreen, DentistMeScreen, ArchiveScreen, SectionList });
