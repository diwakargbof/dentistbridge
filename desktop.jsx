// desktop.jsx — desktop slice of the lab dashboard + dentist browse
// Two large frames for the canvas; not pixel-perfect web app, just a slice.

function DesktopLabDash() {
  const { CASES, SERVICES, DENTISTS, TECHS } = window.CHAIRSIDE_DATA;
  const buckets = [
    { key: 'received', label: 'Received', match: c => c.stage === 0 },
    { key: 'prep', label: 'In prep', match: c => c.stage === 1 },
    { key: 'production', label: 'Production', match: c => c.stage >= 2 && c.stage <= 3 },
    { key: 'finishing', label: 'Finishing', match: c => c.stage === 4 },
    { key: 'ready', label: 'Ready', match: c => c.stage === 5 },
  ];

  return (
    <div style={{
      width: 1200, height: 760,
      background: 'var(--bg)',
      display: 'grid', gridTemplateColumns: '220px 1fr',
      fontFamily: 'Geist, ui-sans-serif, sans-serif',
      color: 'var(--ink)',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <div style={{
        background: 'var(--surface)', borderRight: '1px solid var(--line)',
        padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div className="row gap-8" style={{ padding: '4px 8px 22px' }}>
          <Logo size={26} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>Chairside</span>
        </div>
        {[
          { icon: 'cases', label: 'Cases', count: 7, active: true },
          { icon: 'catalog', label: 'Catalog', count: 6 },
          { icon: 'template', label: 'Templates', count: 12 },
          { icon: 'archive', label: 'Archive', count: 142 },
          { icon: 'wallet', label: 'Payments' },
          { icon: 'profile', label: 'Lab' },
        ].map(r => (
          <div key={r.label} className="row gap-10 row-tap" style={{
            padding: '8px 10px', borderRadius: 9,
            background: r.active ? 'var(--bg-2)' : 'transparent',
            fontWeight: r.active ? 600 : 500, fontSize: 13.5,
            color: r.active ? 'var(--ink)' : 'var(--ink-2)',
          }}>
            <Icon name={r.icon} size={16} color={r.active ? 'var(--clay)' : 'currentColor'} />
            <span style={{ flex: 1 }}>{r.label}</span>
            {r.count && <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{r.count}</span>}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div className="card-flat" style={{ padding: 12 }}>
          <div className="row gap-8" style={{ marginBottom: 6 }}>
            <Avatar name="Vikram Iyer" size={32} tone="clay" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Iyer Dental Lab</div>
              <div className="muted" style={{ fontSize: 11.5 }}>Vikram Iyer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div className="row between" style={{
          padding: '18px 28px', borderBottom: '1px solid var(--line)',
          background: 'var(--bg)',
        }}>
          <div>
            <div className="t-eyebrow">Wed · May 14, 2026</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.018em', marginTop: 2 }}>Active cases</div>
          </div>
          <div className="row gap-10">
            <div className="row gap-8" style={{
              height: 36, padding: '0 12px', background: 'var(--surface)',
              border: '1px solid var(--line)', borderRadius: 10, minWidth: 220,
            }}>
              <Icon name="search" size={15} color="var(--muted)" />
              <span className="muted" style={{ fontSize: 13 }}>Search cases…</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>⌘K</span>
            </div>
            <button className="btn btn-sm btn-soft"><Icon name="filter" size={14} /> Filter</button>
            <button className="btn btn-sm btn-clay"><Icon name="plus" size={14} /> New case</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '20px 28px 12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Due today', value: '3', tone: 'clay', delta: '+1 vs yesterday' },
            { label: 'In production', value: '5', delta: 'On track' },
            { label: 'Ready to ship', value: '1', tone: 'ok', delta: 'Notify dentist' },
            { label: 'This week', value: '₹38,600', delta: '+12% vs last week' },
          ].map(s => (
            <div key={s.label} className="card" style={{
              background: s.tone === 'clay' ? 'var(--clay-soft)' : s.tone === 'ok' ? 'var(--ok-soft)' : 'var(--surface)',
              borderColor: s.tone ? 'transparent' : 'var(--line)',
              padding: 14,
            }}>
              <div className="t-eyebrow" style={{ color: s.tone === 'clay' ? 'var(--clay-ink)' : s.tone === 'ok' ? '#3f5728' : 'var(--muted)' }}>{s.label}</div>
              <div className="serif" style={{
                fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: 6,
                color: s.tone === 'clay' ? 'var(--clay-ink)' : s.tone === 'ok' ? '#3f5728' : 'var(--ink)',
              }}>{s.value}</div>
              <div className="t-xs" style={{
                marginTop: 6,
                color: s.tone === 'clay' ? 'var(--clay-ink)' : s.tone === 'ok' ? '#3f5728' : 'var(--muted)',
                opacity: 0.8,
              }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Board */}
        <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 12, overflow: 'auto', flex: 1 }}>
          {buckets.map(b => {
            const items = CASES.filter(b.match);
            return (
              <div key={b.key} style={{
                flex: 1, minWidth: 200,
                background: 'var(--surface-2)', borderRadius: 14,
                padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div className="row between" style={{ margin: '2px 4px 4px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{b.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{items.length}</span>
                </div>
                {items.map(c => {
                  const svc = window.byId(SERVICES, c.service);
                  const d = window.byId(DENTISTS, c.dentist);
                  return (
                    <div key={c.id} className="kan-card">
                      <div className="row between" style={{ marginBottom: 6 }}>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{c.id}</span>
                        {c.unread > 0 && <Pill tone="clay">{c.unread}</Pill>}
                      </div>
                      <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{svc.title}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{d.name}</div>
                      <div style={{ marginTop: 8 }}>
                        <StageDots total={svc.stages.length} current={c.stage} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DesktopDentistBrowse() {
  const { TECHS, SERVICES } = window.CHAIRSIDE_DATA;
  return (
    <div style={{
      width: 1200, height: 760, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Geist, ui-sans-serif, sans-serif', color: 'var(--ink)',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div className="row between" style={{
        padding: '16px 28px', borderBottom: '1px solid var(--line)',
      }}>
        <div className="row gap-12">
          <Logo size={26} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>Chairside</span>
          <div className="row gap-4" style={{ marginLeft: 16 }}>
            {['Home', 'Find labs', 'Cases', 'Archive'].map((l, i) => (
              <span key={l} style={{
                padding: '6px 12px', borderRadius: 8,
                background: i === 1 ? 'var(--bg-2)' : 'transparent',
                fontSize: 13, fontWeight: i === 1 ? 600 : 500,
                color: i === 1 ? 'var(--ink)' : 'var(--ink-3)',
              }}>{l}</span>
            ))}
          </div>
        </div>
        <div className="row gap-10">
          <button className="btn-icon"><Icon name="bell" /></button>
          <Avatar name="Anaya Rao" size={32} tone="info" />
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '32px 28px 16px' }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Browse labs</div>
        <div className="serif" style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.022em' }}>
          Find a lab for your next case.
        </div>
        <div className="row gap-10" style={{ marginTop: 18, alignItems: 'center' }}>
          <div className="row gap-8" style={{
            height: 44, padding: '0 16px', background: 'var(--surface)',
            border: '1px solid var(--line)', borderRadius: 12, minWidth: 380,
          }}>
            <Icon name="search" size={16} color="var(--muted)" />
            <span className="muted" style={{ fontSize: 14 }}>Search by service, lab name, or city…</span>
          </div>
          {['All', 'Crown & bridge', 'Veneers', 'Dentures', 'Night guard'].map((c, i) => (
            <button key={c} className={'pill ' + (i === 0 ? 'pill-ink' : '')} style={{ height: 32, padding: '0 14px', fontSize: 13 }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '8px 28px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, overflow: 'auto', flex: 1 }}>
        {TECHS.map(t => {
          const services = t.services.map(id => window.byId(SERVICES, id));
          const minPrice = Math.min(...services.map(s => s.price));
          return (
            <div key={t.id} className="card" style={{ padding: 18 }}>
              <div className="row gap-14" style={{ alignItems: 'flex-start' }}>
                <Avatar name={t.name} size={56} tone={t.id === 't1' ? 'clay' : t.id === 't2' ? 'info' : t.id === 't3' ? 'ok' : 'ink'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row between" style={{ alignItems: 'baseline' }}>
                    <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.008em' }}>{t.lab}</div>
                    <div className="row gap-4">
                      <Icon name="star" size={13} color="var(--clay)" />
                      <span className="mono" style={{ fontSize: 12.5 }}>{t.rating}</span>
                    </div>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
                    {t.name} · {t.city} · {t.jobs} cases · {t.turnaround}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 14 }}>{t.bio}</div>
                  <div className="row gap-6" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
                    {services.map(s => (
                      <span key={s.id} className="pill" style={{ height: 22, fontSize: 11.5 }}>{s.title}</span>
                    ))}
                  </div>
                  <div className="row between">
                    <span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>from ₹{minPrice.toLocaleString('en-IN')}</span>
                    <button className="btn btn-sm btn-clay">View lab <Icon name="arrow-r" size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { DesktopLabDash, DesktopDentistBrowse });
