// screens-tech.jsx — Technician (lab) side of Chairside
// Dashboard (Kanban + list), Case detail, Service catalog, Workflow editor,
// Message templates library.

function TechHome({ caseView, setCaseView, onOpenCase, onOpenCatalog, unread = 3 }) {
  const { TECHS, SERVICES, CASES, DENTISTS } = window.CHAIRSIDE_DATA;
  const me = TECHS[0];
  const active = CASES.filter(c => c.stage < window.byId(SERVICES, c.service).stages.length - 1);
  const today = active.length;

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <div className="app-hd">
          <div style={{ minWidth: 0 }}>
            <div className="t-eyebrow">Iyer Dental Lab</div>
            <div className="title" style={{ marginTop: 4 }}>Cases</div>
            <div className="sub">{today} active · 2 awaiting payment · 1 ready</div>
          </div>
          <div className="row gap-8">
            <button className="btn-icon"><Icon name="bell" /></button>
            <Avatar name={me.name} size={40} tone="clay" />
          </div>
        </div>

        {/* Insights strip */}
        <div style={{ padding: '4px 20px 14px' }}>
          <div className="row gap-8" style={{ overflow: 'auto' }}>
            <Stat label="Due today" value="3" tone="clay" />
            <Stat label="In production" value="5" />
            <Stat label="Ready to ship" value="1" tone="ok" />
            <Stat label="This week" value="₹38.6k" />
          </div>
        </div>

        {/* View switcher */}
        <div className="sub-hd">
          <div className="seg">
            <button className={caseView === 'board' ? 'on' : ''} onClick={() => setCaseView('board')}>Board</button>
            <button className={caseView === 'list' ? 'on' : ''} onClick={() => setCaseView('list')}>List</button>
          </div>
          <button className="btn btn-xs btn-soft"><Icon name="filter" size={13} />Filter</button>
        </div>

        {caseView === 'board'
          ? <CaseBoard onOpenCase={onOpenCase} />
          : <CaseList onOpenCase={onOpenCase} />
        }
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="tile" style={{
      flex: '0 0 auto', minWidth: 110, padding: '10px 12px',
      background: tone === 'clay' ? 'var(--clay-soft)' :
                  tone === 'ok' ? 'var(--ok-soft)' : 'var(--surface)',
      borderColor: tone ? 'transparent' : 'var(--line)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
      <div className="serif" style={{ fontSize: 26, lineHeight: 1.1, marginTop: 4, letterSpacing: '-0.02em', color: tone === 'clay' ? 'var(--clay-ink)' : tone === 'ok' ? '#3f5728' : 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function CaseBoard({ onOpenCase }) {
  const { CASES, SERVICES, DENTISTS } = window.CHAIRSIDE_DATA;
  // Group by canonical stage buckets across all services
  const buckets = [
    { key: 'received', label: 'Received', match: c => c.stage === 0 },
    { key: 'prep', label: 'In prep', match: c => c.stage === 1 },
    { key: 'production', label: 'Production', match: c => c.stage >= 2 && c.stage <= 3 },
    { key: 'finishing', label: 'Finishing', match: c => c.stage === 4 },
    { key: 'ready', label: 'Ready', match: c => c.stage === 5 },
  ];

  return (
    <div className="kan-scroll" style={{ display: 'flex', gap: 10, padding: '0 20px 20px', overflowX: 'auto' }}>
      {buckets.map(b => {
        const items = CASES.filter(b.match);
        return (
          <div key={b.key} className="kan-col">
            <h4>
              <span>{b.label}</span>
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{items.length}</span>
            </h4>
            {items.map(c => {
              const svc = window.byId(SERVICES, c.service);
              const d = window.byId(DENTISTS, c.dentist);
              return (
                <div key={c.id} className="kan-card row-tap" onClick={() => onOpenCase && onOpenCase(c.id)}>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{c.id}</span>
                    {c.unread > 0 && <span className="pill pill-clay" style={{ height: 18, fontSize: 10.5 }}>{c.unread} new</span>}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 13.5, marginBottom: 2, letterSpacing: '-0.005em' }}>{svc.title}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{d.name.replace('Dr. ', 'Dr. ')}</div>
                  <div style={{ marginTop: 8 }}>
                    <StageDots total={svc.stages.length} current={c.stage} />
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div style={{ padding: 12, color: 'var(--muted-2)', fontSize: 12, textAlign: 'center' }}>Empty</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CaseList({ onOpenCase }) {
  const { CASES, SERVICES, DENTISTS } = window.CHAIRSIDE_DATA;
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div className="col gap-8">
        {CASES.map(c => {
          const svc = window.byId(SERVICES, c.service);
          const d = window.byId(DENTISTS, c.dentist);
          return (
            <div key={c.id} className="card row-tap" style={{ padding: 14 }} onClick={() => onOpenCase && onOpenCase(c.id)}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <div className="row gap-8">
                  <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{c.id}</span>
                  {c.pinned && <Icon name="pin" size={13} color="var(--clay)" />}
                </div>
                <div className="row gap-6">
                  {c.unread > 0 && <Pill tone="clay">{c.unread} new</Pill>}
                  <span className="t-xs muted">{c.received}</span>
                </div>
              </div>
              <div className="row between" style={{ alignItems: 'flex-end' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{svc.title}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{d.name} · {c.patient}</div>
                </div>
                <span className="t-xs" style={{ color: 'var(--ink-3)' }}>{svc.stages[c.stage]}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <StageDots total={svc.stages.length} current={c.stage} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Case detail (tech view)
// ──────────────────────────────────────────────────────────────
function TechCaseDetail({ caseId = 'C-4821', onBack, onOpenChat, advance, onAdvance }) {
  const { CASES, SERVICES, DENTISTS } = window.CHAIRSIDE_DATA;
  const c = CASES.find(x => x.id === caseId) || CASES[0];
  const svc = window.byId(SERVICES, c.service);
  const d = window.byId(DENTISTS, c.dentist);

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ paddingBottom: 90 }}>
        <div style={{ padding: '8px 16px 0' }}>
          <button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button>
        </div>

        <div style={{ padding: '12px 20px 0' }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>{c.id}</span>
            <Pill tone="clay" dot>{svc.stages[c.stage]}</Pill>
          </div>
          <div className="serif" style={{ fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{svc.title}</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{c.patient} · received {c.received}</div>
        </div>

        {/* Dentist row */}
        <div style={{ padding: '14px 20px 0' }}>
          <div className="card-flat row gap-12">
            <Avatar name={d.name} size={40} tone="info" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{d.name}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{d.clinic} · {d.city}</div>
            </div>
            <button className="btn-icon" onClick={onOpenChat}><Icon name="message" size={18} /></button>
          </div>
        </div>

        {/* Workflow */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Workflow</div>
          <div className="card" style={{ padding: 0 }}>
            {svc.stages.map((s, i) => {
              const state = i < c.stage ? 'done' : i === c.stage ? 'curr' : 'todo';
              return (
                <div key={s} className="row gap-12" style={{
                  padding: '12px 14px',
                  borderBottom: i < svc.stages.length - 1 ? '1px solid var(--line)' : '0',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: '1.5px solid ' + (state === 'todo' ? 'var(--line-2)' : 'var(--ink)'),
                    background: state === 'done' ? 'var(--ink)' : state === 'curr' ? 'var(--clay)' : 'transparent',
                    color: state === 'todo' ? 'transparent' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    borderColor: state === 'curr' ? 'var(--clay)' : state === 'done' ? 'var(--ink)' : 'var(--line-2)',
                  }}>
                    {state === 'done' && <Icon name="check" size={13} color="#fff" strokeWidth={2.5} />}
                    {state === 'curr' && <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: state === 'todo' ? 400 : 500, fontSize: 14.5, color: state === 'todo' ? 'var(--muted)' : 'var(--ink)' }}>{s}</div>
                    {state === 'done' && <div className="t-xs muted">Auto-message sent</div>}
                    {state === 'curr' && <div className="t-xs" style={{ color: 'var(--clay-ink)' }}>Current stage</div>}
                  </div>
                  {state === 'curr' && (
                    <button className="btn btn-xs btn-soft" onClick={onAdvance}>
                      Advance <Icon name="arrow-r" size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Attachments */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="t-eyebrow">Attachments · 3</div>
            <span className="t-xs muted">From dentist</span>
          </div>
          <div className="row gap-8" style={{ overflow: 'auto' }}>
            {['Scan export', 'Shade tab', 'Prep photo'].map(l => (
              <div key={l} style={{ width: 100, flex: '0 0 auto' }}>
                <ImagePh label={l} h={100} />
              </div>
            ))}
          </div>
        </div>

        {/* Payment status */}
        <div style={{ padding: '20px 20px 24px' }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Payment</div>
          <div className="card row gap-12">
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--warn-soft)', color: '#6b4d12',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="wallet" size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>₹{svc.price.toLocaleString('en-IN')} pending</div>
              <div className="muted" style={{ fontSize: 12.5 }}>Awaiting screenshot from Dr. Rao</div>
            </div>
            <button className="btn btn-xs btn-soft">Remind</button>
          </div>
        </div>
      </div>

      {/* Sticky action */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 16px calc(10px + 24px)',
        background: 'rgba(243, 239, 232, 0.92)',
        backdropFilter: 'blur(20px) saturate(160%)',
        borderTop: '1px solid var(--line)',
        display: 'flex', gap: 8,
      }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onOpenChat}>
          <Icon name="message" size={16} /> Message
        </button>
        <button className="btn btn-clay" style={{ flex: 1.4 }} onClick={onAdvance}>
          Advance stage <Icon name="arrow-r" size={16} />
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Service catalog (list)
// ──────────────────────────────────────────────────────────────
function TechCatalog({ onOpenService }) {
  const { SERVICES } = window.CHAIRSIDE_DATA;
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Catalog" sub="6 services live · drag to reorder" action={
          <button className="btn btn-sm btn-clay"><Icon name="plus" size={14} />New</button>
        } />

        <div style={{ padding: '4px 20px 20px' }} className="col gap-10">
          {SERVICES.map(s => (
            <div key={s.id} className="card row-tap" onClick={() => onOpenService && onOpenService(s.id)}>
              <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
                <ImagePh label="" h={56} style={{ width: 56, flexShrink: 0, borderRadius: 10 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row between" style={{ alignItems: 'baseline' }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.005em' }}>{s.title}</div>
                    <div className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>₹{s.price.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2, marginRight: 8 }}>{s.desc}</div>
                  <div className="row gap-6" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                    {s.stages.slice(0, 4).map((st, i) => (
                      <React.Fragment key={st}>
                        <span className="pill" style={{ height: 19, fontSize: 10.5, padding: '0 7px' }}>{st}</span>
                        {i < Math.min(3, s.stages.length - 1) && <span style={{ color: 'var(--muted-2)', fontSize: 11 }}>›</span>}
                      </React.Fragment>
                    ))}
                    {s.stages.length > 4 && <span className="t-xs muted">+{s.stages.length - 4}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Workflow editor (drag-stage + checkpoint message template)
// ──────────────────────────────────────────────────────────────
function TechWorkflowEditor({ serviceId = 's1', onBack }) {
  const { SERVICES } = window.CHAIRSIDE_DATA;
  const s = window.byId(SERVICES, serviceId);
  const TEMPLATES = {
    'Received': 'Got it — case received and queued for prep. We\'ll be in touch shortly.',
    'Prepped': 'Prep complete. Moving to design now.',
    'Designed': 'Designed and locked. Heading to mill.',
    'Milled': 'Milled successfully. Onto glazing today.',
    'Glazed': 'Glazed and inspected. Photos coming up.',
    'Ready': 'Ready for collection — let me know about pickup.',
  };
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ paddingBottom: 90 }}>
        <div style={{ padding: '8px 16px 0' }}>
          <button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button>
        </div>
        <div style={{ padding: '12px 20px 16px' }}>
          <div className="t-eyebrow">Editing workflow</div>
          <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 4 }}>{s.title}</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
            Each stage can auto-send a message when reached.
          </div>
        </div>

        <div style={{ padding: '0 20px' }} className="col gap-10">
          {s.stages.map((stg, i) => (
            <div key={stg} className="card" style={{ padding: 12 }}>
              <div className="row gap-10" style={{ marginBottom: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'var(--bg-2)', color: 'var(--ink-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: 12,
                }}>{i + 1}</div>
                <input className="field" defaultValue={stg} style={{ height: 36, flex: 1, fontSize: 14.5 }} />
                <button className="btn-icon" style={{ width: 32, height: 32 }}><Icon name="dot-menu" size={16} /></button>
              </div>
              <div style={{
                background: 'var(--surface-2)', borderRadius: 10, padding: '8px 10px',
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <Icon name="sparkle" size={14} color="var(--clay)" />
                <div style={{ flex: 1 }}>
                  <div className="t-xs" style={{ color: 'var(--clay-ink)', fontWeight: 600, marginBottom: 2 }}>Auto-message</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>{TEMPLATES[stg] || 'No template yet — tap to add.'}</div>
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost btn-block" style={{ marginTop: 4 }}>
            <Icon name="plus" size={16} /> Add stage
          </button>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 16px calc(10px + 24px)',
        background: 'rgba(243, 239, 232, 0.92)',
        backdropFilter: 'blur(20px) saturate(160%)',
        borderTop: '1px solid var(--line)',
        display: 'flex', gap: 8,
      }}>
        <button className="btn btn-ghost" style={{ flex: 1 }}>Discard</button>
        <button className="btn btn-clay" style={{ flex: 1.4 }}>Save workflow</button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Message template library
// ──────────────────────────────────────────────────────────────
function TechTemplates() {
  const TEMPLATES = [
    { name: 'Shade request · Zirconia', stage: 'Designed · Zirconia Crown', body: 'Heads-up: I\'ll need a shade tab photo against the prep before designing. Daylight if possible.' },
    { name: 'Pickup ready · Standard', stage: 'Ready · Any service', body: 'Case is ready for pickup. Open 10am–7pm Mon–Sat.' },
    { name: 'Margin re-scan', stage: 'Received · Crowns', body: 'Margin looks unclear on the distal — could you send a fresh scan or PVS impression?' },
    { name: 'Mill queue update', stage: 'Designed', body: 'Designed and locked. You\'re in tomorrow\'s mill queue.' },
    { name: 'Glaze checkpoint', stage: 'Glazed', body: 'Glazed. Sending a photo for sign-off before final polish.' },
  ];
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Templates" sub="Crisp, repeatable. Mapped to stages." action={
          <button className="btn btn-sm btn-clay"><Icon name="plus" size={14} />New</button>
        } />

        <div style={{ padding: '4px 20px 20px' }} className="col gap-10">
          {TEMPLATES.map(t => (
            <div key={t.name} className="card row-tap">
              <div className="row between" style={{ marginBottom: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{t.name}</div>
                <Icon name="dot-menu" size={16} color="var(--muted)" />
              </div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t.stage}</div>
              <div style={{
                fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45,
                background: 'var(--surface-2)', padding: '8px 10px', borderRadius: 8,
              }}>{t.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TechHome, TechCaseDetail, TechCatalog, TechWorkflowEditor, TechTemplates, CaseBoard, CaseList });
