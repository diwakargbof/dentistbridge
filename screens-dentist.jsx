// screens-dentist.jsx — Dentist side
// Dashboard, browse technicians, technician profile, assign case flow.

function DentistHome({ onOpenCase, onBrowse, onOpenChat }) {
  const { CASES, SERVICES, TECHS } = window.CHAIRSIDE_DATA;
  // For dentist view, treat 'd1' as me — show her cases
  const me = { name: 'Dr. Anaya Rao', clinic: 'Rao Family Dental' };
  const mine = CASES.filter(c => c.dentist === 'd1');

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <div className="app-hd">
          <div style={{ minWidth: 0 }}>
            <div className="t-eyebrow">Rao Family Dental</div>
            <div className="title" style={{ marginTop: 4 }}>Hi, Anaya</div>
            <div className="sub">{mine.length} cases out · 1 ready for pickup</div>
          </div>
          <div className="row gap-8">
            <button className="btn-icon"><Icon name="bell" /></button>
            <Avatar name="Anaya Rao" size={40} tone="info" />
          </div>
        </div>

        {/* Hero action */}
        <div style={{ padding: '4px 20px 12px' }}>
          <div onClick={onBrowse} className="row-tap" style={{
            background: 'var(--ink)', color: 'var(--bg)',
            borderRadius: 18, padding: 16, display: 'flex', gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="plus" size={22} color="var(--bg)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>Send a new case</div>
              <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 2 }}>Browse labs · pick a service · attach scans</div>
            </div>
            <Icon name="chev-r" size={20} color="var(--bg)" />
          </div>
        </div>

        {/* Active cases */}
        <div className="sub-hd">
          <div className="t-eyebrow">Active · {mine.length}</div>
          <button className="btn btn-xs btn-soft">All cases</button>
        </div>
        <div style={{ padding: '0 20px 14px' }} className="col gap-10">
          {mine.map(c => {
            const svc = window.byId(SERVICES, c.service);
            const t = window.CHAIRSIDE_DATA.TECHS[0]; // Vikram
            const isReady = c.stage === svc.stages.length - 1;
            return (
              <div key={c.id} className="card row-tap" onClick={() => onOpenCase && onOpenCase(c.id)}>
                <div className="row between" style={{ marginBottom: 8 }}>
                  <div className="row gap-8">
                    <Avatar name={t.name} size={32} tone="clay" />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{t.lab}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{t.name}</div>
                    </div>
                  </div>
                  {isReady
                    ? <Pill tone="ok" dot>Ready</Pill>
                    : c.unread > 0 ? <Pill tone="clay">{c.unread} new</Pill> : <span className="t-xs muted">{c.received}</span>
                  }
                </div>
                <div className="hr" style={{ marginBottom: 10 }} />
                <div className="row between" style={{ alignItems: 'baseline', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>{svc.title}</div>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{c.patient}</div>
                  </div>
                  <span className="t-xs" style={{ color: 'var(--ink-3)' }}>{svc.stages[c.stage]}</span>
                </div>
                <StageDots total={svc.stages.length} current={c.stage} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
function DentistBrowse({ onOpenTech }) {
  const { TECHS, SERVICES } = window.CHAIRSIDE_DATA;
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Find a lab" sub="Sorted by turnaround near you" />
        <div style={{ padding: '0 20px 12px' }}>
          <div className="row gap-8" style={{
            height: 44, padding: '0 14px', background: 'var(--surface)',
            border: '1px solid var(--line)', borderRadius: 12,
          }}>
            <Icon name="search" size={18} color="var(--muted)" />
            <span className="muted" style={{ fontSize: 14 }}>Search labs or services…</span>
          </div>
          <div className="row gap-6" style={{ marginTop: 12, overflow: 'auto' }}>
            {['All', 'Crown & bridge', 'Veneers', 'Dentures', 'Night guard'].map((c, i) => (
              <button key={c} className={'pill ' + (i === 0 ? 'pill-ink' : '')} style={{ height: 28, padding: '0 12px', fontSize: 12.5 }}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: '4px 20px 20px' }} className="col gap-12">
          {TECHS.map(t => {
            const services = t.services.map(id => window.byId(SERVICES, id));
            const minPrice = Math.min(...services.map(s => s.price));
            return (
              <div key={t.id} className="card row-tap" onClick={() => onOpenTech && onOpenTech(t.id)}>
                <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
                  <Avatar name={t.name} size={48} tone={t.id === 't1' ? 'clay' : t.id === 't2' ? 'info' : t.id === 't3' ? 'ok' : 'ink'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row between" style={{ alignItems: 'baseline' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.005em' }}>{t.lab}</div>
                      <div className="row gap-3" style={{ color: 'var(--ink-2)', fontSize: 12.5 }}>
                        <Icon name="star" size={12} color="var(--clay)" />
                        <span className="mono" style={{ fontSize: 12 }}>{t.rating}</span>
                      </div>
                    </div>
                    <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>{t.name} · {t.city} · {t.jobs} cases</div>
                    <div className="row gap-6" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                      {services.slice(0, 3).map(s => (
                        <span key={s.id} className="pill" style={{ height: 20, fontSize: 11 }}>{s.title}</span>
                      ))}
                    </div>
                    <div className="row between" style={{ fontSize: 12.5 }}>
                      <span className="muted">
                        <Icon name="clock" size={12} /> {t.turnaround}
                      </span>
                      <span className="mono ink-2" style={{ fontSize: 12.5 }}>from ₹{minPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
function DentistTechProfile({ techId = 't1', onBack, onAssign }) {
  const { TECHS, SERVICES } = window.CHAIRSIDE_DATA;
  const t = window.byId(TECHS, techId);
  const services = t.services.map(id => window.byId(SERVICES, id));
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ paddingBottom: 90 }}>
        <div style={{ padding: '8px 16px 0' }}>
          <button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button>
        </div>

        {/* Hero */}
        <div style={{ padding: '14px 20px 0' }}>
          <Avatar name={t.name} size={56} tone="clay" />
          <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.12, marginTop: 12 }}>{t.lab}</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{t.name} · {t.city}</div>
          <div className="row gap-14" style={{ marginTop: 14, fontSize: 12.5 }}>
            <span className="row gap-4 ink-2"><Icon name="star" size={13} color="var(--clay)" /> {t.rating} · {t.jobs} cases</span>
            <span className="row gap-4 muted"><Icon name="clock" size={13} /> {t.turnaround}</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 14, lineHeight: 1.55 }}>{t.bio}</p>
        </div>

        {/* Services */}
        <div style={{ padding: '24px 20px 0' }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Services · {services.length}</div>
          <div className="col gap-8">
            {services.map(s => (
              <div key={s.id} className="card row-tap" onClick={() => onAssign && onAssign(s.id)}>
                <div className="row between" style={{ alignItems: 'baseline', marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>{s.title}</div>
                  <div className="mono" style={{ fontSize: 13 }}>₹{s.price.toLocaleString('en-IN')}</div>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>{s.desc}</div>
                <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
                  {s.stages.map((st, i) => (
                    <React.Fragment key={st}>
                      <span className="t-xs ink-3">{st}</span>
                      {i < s.stages.length - 1 && <span style={{ color: 'var(--muted-2)', fontSize: 11 }}>›</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent reviews */}
        <div style={{ padding: '24px 20px 28px' }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Recent</div>
          <div className="card-flat" style={{ padding: 14 }}>
            <div className="serif" style={{ fontSize: 17, letterSpacing: '-0.01em', lineHeight: 1.45 }}>
              "Vikram's shade matching is the best in the city. Sent him three difficult anteriors this month."
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>— Dr. Karan Mehta · 2 weeks ago</div>
          </div>
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
        <button className="btn btn-ghost" style={{ flex: 1 }}>Message</button>
        <button className="btn btn-clay" style={{ flex: 1.4 }} onClick={() => onAssign && onAssign()}>
          Send a case <Icon name="arrow-r" size={16} />
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
function DentistAssign({ techId = 't1', serviceId, onBack, onSent }) {
  const { TECHS, SERVICES } = window.CHAIRSIDE_DATA;
  const t = window.byId(TECHS, techId);
  const initialService = serviceId || t.services[0];
  const [selected, setSelected] = React.useState(initialService);
  const services = t.services.map(id => window.byId(SERVICES, id));
  const s = window.byId(SERVICES, selected);

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ paddingBottom: 90 }}>
        <div style={{ padding: '8px 16px 0' }}>
          <button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button>
        </div>

        <div style={{ padding: '12px 20px 0' }}>
          <div className="t-eyebrow">New case to</div>
          <div className="row gap-10" style={{ marginTop: 8, marginBottom: 18 }}>
            <Avatar name={t.name} size={40} tone="clay" />
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 600 }}>{t.lab}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{t.name}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px' }} className="col gap-16">
          <div className="col gap-8">
            <label className="t-xs muted">Service</label>
            <div className="col gap-6">
              {services.map(svc => (
                <div key={svc.id} className="row gap-10 row-tap" onClick={() => setSelected(svc.id)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: selected === svc.id ? 'var(--clay-soft)' : 'var(--surface)',
                    border: '1px solid ' + (selected === svc.id ? 'transparent' : 'var(--line)'),
                  }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: '1.5px solid ' + (selected === svc.id ? 'var(--clay)' : 'var(--line-2)'),
                    background: selected === svc.id ? 'var(--clay)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected === svc.id && <div style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="row between"><div style={{ fontWeight: 600, fontSize: 14.5 }}>{svc.title}</div>
                    <div className="mono" style={{ fontSize: 13 }}>₹{svc.price.toLocaleString('en-IN')}</div></div>
                    <div className="muted" style={{ fontSize: 12 }}>{svc.stages.length} stages · {t.turnaround}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col gap-8">
            <label className="t-xs muted">Patient reference</label>
            <input className="field" placeholder="Patient · tooth / location" defaultValue="Patient · #14 UR1" />
          </div>

          <div className="col gap-8">
            <label className="t-xs muted">Notes to {t.name.split(' ')[0]}</label>
            <textarea className="field" rows={3} defaultValue="Margin is sub-gingival on the distal. Will send a fresh scan if needed." />
          </div>

          <div className="col gap-8">
            <label className="t-xs muted">Attach</label>
            <div className="row gap-8">
              {['IO Scan', 'Shade tab', 'Prep photo'].map(l => (
                <div key={l} className="img-ph row-tap" style={{ height: 76, flex: 1, fontSize: 9.5 }}>{l}</div>
              ))}
              <button className="btn-icon" style={{ width: 76, height: 76, fontSize: 10 }}>
                <Icon name="plus" size={20} />
              </button>
            </div>
          </div>

          <div className="card-flat row between" style={{ padding: 14, marginTop: 4 }}>
            <div>
              <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Total</div>
              <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>₹{s.price.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="t-xs muted">Pay after delivery</div>
              <div className="t-xs ink-3">Screenshot in chat</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 16px calc(10px + 24px)',
        background: 'rgba(243, 239, 232, 0.92)',
        backdropFilter: 'blur(20px) saturate(160%)',
        borderTop: '1px solid var(--line)',
      }}>
        <button className="btn btn-clay btn-block" onClick={onSent}>
          Send case to {t.name.split(' ')[0]}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { DentistHome, DentistBrowse, DentistTechProfile, DentistAssign });
