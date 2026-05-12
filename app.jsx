// app.jsx — top-level mount for Chairside design canvas
// Lays out artboards on a DesignCanvas with annotations, and mounts
// the live interactive phone on its own artboard.

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "role": "tech",
    "accent": "#b4724a",
    "caseView": "board",
    "showAnnots": true
  }/*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent live
  React.useEffect(() => {
    document.documentElement.style.setProperty('--clay', t.accent);
    // Generate soft tint approx
    document.documentElement.style.setProperty('--clay-soft', tint(t.accent, 0.82));
    document.documentElement.style.setProperty('--clay-line', tint(t.accent, 0.5));
  }, [t.accent]);

  return (
    <>
      <DesignCanvas>
        {/* Cover frame */}
        <DCSection id="cover" title="Chairside" subtitle="DentBridge MVP · investor preview · v0.1">
          <DCArtboard id="cover" label="Cover" width={1280} height={760}>
            <CoverFrame />
          </DCArtboard>
        </DCSection>

        {/* Onboarding */}
        <DCSection id="onboard" title="Onboarding" subtitle="First-run · welcome → role → profile">
          <DCArtboard id="welcome" label="Welcome" width={390} height={844}>
            <PhoneStatic><ScrWelcome onContinue={() => {}} /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="role" label="Role chooser" width={390} height={844}>
            <PhoneStatic><ScrRole picked="technician" onPick={() => {}} /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="profile" label="Lab profile setup" width={390} height={844}>
            <PhoneStatic><ScrSignup role="technician" onDone={() => {}} /></PhoneStatic>
          </DCArtboard>
        </DCSection>

        {/* Technician */}
        <DCSection id="tech" title="Technician · the lab" subtitle="Cases, custom workflows, message templates">
          <DCArtboard id="tech-live" label="◉ Live prototype" width={390} height={844}>
            <Phone role="tech" />
          </DCArtboard>
          <DCArtboard id="tech-board" label="Cases · board" width={390} height={844}>
            <PhoneStatic withTab role="tech"><TechHome caseView="board" setCaseView={() => {}} /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="tech-list" label="Cases · list" width={390} height={844}>
            <PhoneStatic withTab role="tech"><TechHome caseView="list" setCaseView={() => {}} /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="tech-case" label="Case detail" width={390} height={844}>
            <PhoneStatic><TechCaseDetail /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="tech-catalog" label="Service catalog" width={390} height={844}>
            <PhoneStatic withTab role="tech"><TechCatalog /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="tech-workflow" label="Workflow editor" width={390} height={844}>
            <PhoneStatic><TechWorkflowEditor /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="tech-templates" label="Templates library" width={390} height={844}>
            <PhoneStatic withTab role="tech"><TechTemplates /></PhoneStatic>
          </DCArtboard>
        </DCSection>

        {/* Dentist */}
        <DCSection id="dentist" title="Dentist · the clinic" subtitle="Send cases, track progress, message labs">
          <DCArtboard id="dent-home" label="Dashboard" width={390} height={844}>
            <PhoneStatic withTab role="dentist"><DentistHome /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="dent-browse" label="Browse labs" width={390} height={844}>
            <PhoneStatic withTab role="dentist"><DentistBrowse /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="dent-tech" label="Lab profile" width={390} height={844}>
            <PhoneStatic><DentistTechProfile /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="dent-assign" label="Assign case" width={390} height={844}>
            <PhoneStatic><DentistAssign /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="dent-archive" label="Archive" width={390} height={844}>
            <PhoneStatic withTab role="dentist"><ArchiveScreen role="dentist" /></PhoneStatic>
          </DCArtboard>
        </DCSection>

        {/* Chat + AI + Payment */}
        <DCSection id="comms" title="Communication & AI" subtitle="Case chat · shade picker · payment confirmation">
          <DCArtboard id="chat-tech" label="Chat · tech side" width={390} height={844}>
            <PhoneStatic><ChatScreen role="tech" /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="chat-dent" label="Chat · dentist side" width={390} height={844}>
            <PhoneStatic><ChatScreen role="dentist" /></PhoneStatic>
          </DCArtboard>
          <DCArtboard id="shade" label="✦ AI shade picker" width={390} height={844}>
            <PhoneStatic>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <ChatScreen role="tech" />
                <ShadePicker onClose={() => {}} />
              </div>
            </PhoneStatic>
          </DCArtboard>
          <DCArtboard id="pay" label="Payment confirm" width={390} height={844}>
            <PhoneStatic>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <ChatScreen role="tech" />
                <PaymentConfirm onClose={() => {}} onConfirm={() => {}} />
              </div>
            </PhoneStatic>
          </DCArtboard>
        </DCSection>

        {/* Desktop */}
        <DCSection id="desktop" title="Desktop · web app" subtitle="Mobile-first but readable on a 13” screen">
          <DCArtboard id="desk-lab" label="Lab dashboard · web" width={1200} height={760}>
            <DesktopLabDash />
          </DCArtboard>
          <DCArtboard id="desk-dent" label="Dentist browse · web" width={1200} height={760}>
            <DesktopDentistBrowse />
          </DCArtboard>
        </DCSection>

      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent" />
        <TweakColor label="Clay" value={t.accent}
          options={['#b4724a', '#7b6a52', '#5577a3', '#6a8a52', '#a8473a']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Default role on live prototype" />
        <TweakRadio label="Open as" value={t.role}
          options={['tech', 'dentist']}
          onChange={(v) => setTweak('role', v)} />
        <TweakSection label="Display" />
        <TweakToggle label="Show annotations" value={t.showAnnots} onChange={(v) => setTweak('showAnnots', v)} />
      </TweaksPanel>
    </>
  );
}

// Wraps a screen in an iPhone frame for static artboards
function PhoneStatic({ children, withTab = false, role = 'tech' }) {
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
  // active tab heuristic via React children — simplified by checking display
  const active = tabs[0].id;
  return (
    <IOSDevice width={390} height={844}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </div>
        {withTab && <Tabbar tabs={tabs} active={active} onChange={() => {}} />}
        <div style={{ height: 24, background: withTab ? 'rgba(253,251,246,0.85)' : 'transparent', borderTop: withTab ? '1px solid var(--line)' : 'none' }} />
      </div>
    </IOSDevice>
  );
}

// Cover artboard
function CoverFrame() {
  return (
    <div style={{
      width: '100%', height: '100%', background: 'var(--bg)',
      display: 'grid', gridTemplateColumns: '1.1fr 1fr',
      fontFamily: 'Geist, ui-sans-serif, sans-serif', color: 'var(--ink)',
      overflow: 'hidden',
    }}>
      {/* Left: editorial */}
      <div style={{ padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="row gap-10">
          <Logo size={32} />
          <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.012em' }}>Chairside</span>
          <span className="pill" style={{ marginLeft: 8 }}>MVP · v0.1</span>
        </div>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>For dentists & dental labs</div>
          <div className="serif" style={{ fontSize: 88, lineHeight: 0.98, letterSpacing: '-0.028em' }}>
            Between<br />the chair<br />and the <em style={{ color: 'var(--clay-ink)', fontStyle: 'italic' }}>bench.</em>
          </div>
          <div style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 24, maxWidth: 460, lineHeight: 1.5 }}>
            Crisp case-by-case workflow tracking, shared between dentists and the labs that make their crowns, bridges, and dentures real.
          </div>
        </div>
        <div className="row gap-20" style={{ fontSize: 12 }}>
          <Pillar n="01" label="Custom workflows" sub="Each service its own stages" />
          <Pillar n="02" label="Stage-bound templates" sub="Auto-send the right note" />
          <Pillar n="03" label="In-chat payment" sub="Screenshot → confirm → close" />
          <Pillar n="04" label="AI shade picker" sub="VITA Classical from any photo" />
        </div>
      </div>

      {/* Right: phone display */}
      <div style={{
        background: 'var(--bg-2)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: '8% -8% 8% 8%',
          background: 'radial-gradient(ellipse at center, var(--clay-soft) 0%, transparent 70%)',
          opacity: 0.7,
        }} />
        <div style={{ position: 'relative', transform: 'translateY(0) rotate(-2deg)' }}>
          <PhoneStatic><TechCaseDetail /></PhoneStatic>
        </div>
        <div style={{ position: 'absolute', right: 56, bottom: 56, transform: 'rotate(3deg)', transformOrigin: 'bottom right' }}>
          <div style={{ transform: 'scale(0.78)', transformOrigin: 'bottom right' }}>
            <PhoneStatic><ChatScreen role="tech" /></PhoneStatic>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pillar({ n, label, sub }) {
  return (
    <div style={{ flex: 1, borderTop: '1px solid var(--ink)', paddingTop: 10 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--clay-ink)' }}>{n}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{label}</div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// Tint helper — converts hex to a softened blend with cream
function tint(hex, amt = 0.8) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const bg = [241, 225, 208]; // cream tint base
  const mix = (a, b) => Math.round(a * (1 - amt) + b * amt);
  const c = [mix(r, bg[0]), mix(g, bg[1]), mix(b, bg[2])];
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
