// desktop.jsx — full-viewport desktop layout for Chairside
// Shown on wide viewports (≥900px) instead of the phone shell.
// Uses real Supabase hooks; degrades gracefully to empty states when unconfigured.

function DesktopLabDash({ userId, userProfile, onSwitchProfile }) {
  const supabase = window.CHAIRSIDE_SUPABASE;
  const cases    = supabase.useCases('technician', userId);
  const myLab    = supabase.useMyLab(userId);

  const caseList  = cases || [];
  const labName   = myLab?.name   || (userId ? '…' : 'Your Lab');
  const ownerName = userProfile?.full_name || '—';

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  const buckets = [
    { key: 'received',   label: 'Received',   match: c => c.stage === 0 },
    { key: 'prep',       label: 'In prep',    match: c => c.stage === 1 },
    { key: 'production', label: 'Production', match: c => c.stage >= 2 && c.stage <= 3 },
    { key: 'finishing',  label: 'Finishing',  match: c => c.stage === 4 },
    { key: 'ready',      label: 'Ready',      match: c => c.stage === 5 },
  ];

  const inProd     = caseList.filter(c => c.stage >= 1 && c.stage <= 3).length;
  const readyCount = caseList.filter(c => c.stage === 5).length;
  const services   = myLab?.services || [];

  const stats = [
    { label: 'Active cases',   value: String(caseList.length), tone: caseList.length > 0 ? 'clay' : null },
    { label: 'In production',  value: String(inProd) },
    { label: 'Ready to ship',  value: String(readyCount), tone: readyCount > 0 ? 'ok' : null },
    { label: 'Services',       value: String(services.length) },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bg)',
      display: 'grid', gridTemplateColumns: '220px 1fr',
      fontFamily: 'Geist, ui-sans-serif, sans-serif',
      color: 'var(--ink)',
      overflow: 'hidden',
    }}>

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)', borderRight: '1px solid var(--line)',
        padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: 4,
        overflow: 'hidden',
      }}>
        <div className="row gap-8" style={{ padding: '4px 8px 22px' }}>
          <Logo size={26} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>Chairside</span>
        </div>

        {[
          { icon: 'cases',    label: 'Cases',     count: caseList.length || null, active: true },
          { icon: 'catalog',  label: 'Catalog',   count: services.length || null },
          { icon: 'template', label: 'Templates' },
          { icon: 'archive',  label: 'Archive' },
          { icon: 'wallet',   label: 'Payments' },
          { icon: 'profile',  label: 'Lab' },
        ].map(r => (
          <div key={r.label} className="row gap-10 row-tap" style={{
            padding: '8px 10px', borderRadius: 9,
            background: r.active ? 'var(--bg-2)' : 'transparent',
            fontWeight: r.active ? 600 : 500, fontSize: 13.5,
            color: r.active ? 'var(--ink)' : 'var(--ink-2)',
          }}>
            <Icon name={r.icon} size={16} color={r.active ? 'var(--clay)' : 'currentColor'} />
            <span style={{ flex: 1 }}>{r.label}</span>
            {r.count != null && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{r.count}</span>
            )}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <div className="card-flat" style={{ padding: 12 }}>
          <div className="row gap-8" style={{ marginBottom: 8 }}>
            <Avatar name={ownerName} size={32} tone="clay" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labName}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>{ownerName}</div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-ghost btn-block"
            onClick={onSwitchProfile}
            style={{ fontSize: 12.5 }}
          >
            Switch profile
          </button>
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Topbar */}
        <div className="row between" style={{
          padding: '18px 28px', borderBottom: '1px solid var(--line)',
          background: 'var(--bg)', flexShrink: 0,
        }}>
          <div>
            <div className="t-eyebrow">{dateStr}</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.018em', marginTop: 2 }}>Active cases</div>
          </div>
          <div className="row gap-10">
            <div className="row gap-8" style={{
              height: 36, padding: '0 12px', background: 'var(--surface)',
              border: '1px solid var(--line)', borderRadius: 10, minWidth: 220,
            }}>
              <Icon name="search" size={15} color="var(--muted)" />
              <span className="muted" style={{ fontSize: 13 }}>Search cases…</span>
            </div>
            <button className="btn btn-sm btn-soft"><Icon name="filter" size={14} /> Filter</button>
            <button className="btn btn-sm btn-clay"><Icon name="plus" size={14} /> New case</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '20px 28px 12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flexShrink: 0 }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{
              background: s.tone === 'clay' ? 'var(--clay-soft)' : s.tone === 'ok' ? 'var(--ok-soft)' : 'var(--surface)',
              borderColor: s.tone ? 'transparent' : 'var(--line)',
              padding: 14,
            }}>
              <div className="t-eyebrow" style={{
                color: s.tone === 'clay' ? 'var(--clay-ink)' : s.tone === 'ok' ? '#3f5728' : 'var(--muted)',
              }}>{s.label}</div>
              <div className="serif" style={{
                fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: 6,
                color: s.tone === 'clay' ? 'var(--clay-ink)' : s.tone === 'ok' ? '#3f5728' : 'var(--ink)',
              }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Board */}
        {cases === null ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Loading…
          </div>
        ) : caseList.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 6 }}>No active cases</div>
              <div style={{ color: 'var(--muted-2)', fontSize: 13 }}>Cases assigned to your lab will appear here.</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 12, overflow: 'auto', flex: 1 }}>
            {buckets.map(b => {
              const items = caseList.filter(b.match);
              return (
                <div key={b.key} style={{
                  flex: 1, minWidth: 160,
                  background: 'var(--surface-2)', borderRadius: 14,
                  padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div className="row between" style={{ margin: '2px 4px 4px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)' }}>{b.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{items.length}</span>
                  </div>
                  {items.map(c => (
                    <div key={c.id} className="kan-card" style={{ cursor: 'pointer' }}>
                      <div style={{ marginBottom: 4 }}>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{c.id}</span>
                      </div>
                      <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{c.service?.title || '—'}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{c.dentist?.full_name || '—'}</div>
                      {c.patient_ref && (
                        <div style={{ marginTop: 6 }}>
                          <span className="pill" style={{ fontSize: 11 }}>{c.patient_ref}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopDentistBrowse({ userId, userProfile, onSwitchProfile }) {
  const supabase  = window.CHAIRSIDE_SUPABASE;
  const labs      = supabase.useLabs();
  const ownerName = userProfile?.full_name || 'You';
  const labList   = labs || [];
  const tones     = ['clay', 'info', 'ok', 'ink'];

  return (
    <div style={{
      width: '100%', height: '100%', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Geist, ui-sans-serif, sans-serif', color: 'var(--ink)',
      overflow: 'hidden',
    }}>

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="row between" style={{
        padding: '16px 28px', borderBottom: '1px solid var(--line)', flexShrink: 0,
      }}>
        <div className="row gap-12">
          <Logo size={26} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>Chairside</span>
          <div className="row gap-4" style={{ marginLeft: 16 }}>
            {['Home', 'Find labs', 'Cases', 'Archive'].map((l, i) => (
              <span key={l} className="row-tap" style={{
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                background: i === 1 ? 'var(--bg-2)' : 'transparent',
                fontSize: 13, fontWeight: i === 1 ? 600 : 500,
                color: i === 1 ? 'var(--ink)' : 'var(--ink-3)',
              }}>{l}</span>
            ))}
          </div>
        </div>
        <div className="row gap-10">
          <button className="btn-icon"><Icon name="bell" /></button>
          <Avatar name={ownerName} size={32} tone="info" />
          <button className="btn btn-sm btn-ghost" onClick={onSwitchProfile}>Switch profile</button>
        </div>
      </div>

      {/* ── Hero / Search ─────────────────────────────────────── */}
      <div style={{ padding: '28px 28px 16px', flexShrink: 0 }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Browse labs</div>
        <div className="serif" style={{ fontSize: 38, lineHeight: 1.05, letterSpacing: '-0.022em' }}>
          Find a lab for your next case.
        </div>
        <div className="row gap-10" style={{ marginTop: 18, flexWrap: 'wrap' }}>
          <div className="row gap-8" style={{
            height: 44, padding: '0 16px', background: 'var(--surface)',
            border: '1px solid var(--line)', borderRadius: 12, minWidth: 340,
          }}>
            <Icon name="search" size={16} color="var(--muted)" />
            <span className="muted" style={{ fontSize: 14 }}>Search by service, lab name, or city…</span>
          </div>
          {['All', 'Crown & bridge', 'Veneers', 'Dentures', 'Night guard'].map((c, i) => (
            <button key={c} className={'pill ' + (i === 0 ? 'pill-ink' : '')}
              style={{ height: 32, padding: '0 14px', fontSize: 13, cursor: 'pointer', border: 'none' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lab grid ──────────────────────────────────────────── */}
      {labs === null ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Loading labs…
        </div>
      ) : labList.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 6 }}>No labs found</div>
            <div style={{ color: 'var(--muted-2)', fontSize: 13 }}>Labs will appear here once they set up a profile.</div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '8px 28px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: 16,
          overflow: 'auto',
          flex: 1,
        }}>
          {labList.map((lab, i) => {
            const services = lab.services || [];
            const prices   = services.map(s => s.price).filter(p => p > 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : null;
            return (
              <div key={lab.id} className="card" style={{ padding: 18 }}>
                <div className="row gap-14" style={{ alignItems: 'flex-start' }}>
                  <Avatar name={lab.owner?.full_name || lab.name} size={52} tone={tones[i % tones.length]} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row between" style={{ alignItems: 'baseline', gap: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.008em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lab.name}</div>
                      {lab.rating > 0 && (
                        <div className="row gap-4" style={{ flexShrink: 0 }}>
                          <Icon name="star" size={13} color="var(--clay)" />
                          <span className="mono" style={{ fontSize: 12.5 }}>{lab.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
                      {lab.owner?.full_name || '—'}{lab.city ? ` · ${lab.city}` : ''}
                    </div>
                    <div className="row gap-6" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
                      {services.slice(0, 4).map(s => (
                        <span key={s.id} className="pill" style={{ height: 22, fontSize: 11.5 }}>{s.title}</span>
                      ))}
                      {services.length > 4 && (
                        <span className="pill" style={{ height: 22, fontSize: 11.5 }}>+{services.length - 4} more</span>
                      )}
                      {services.length === 0 && (
                        <span className="muted" style={{ fontSize: 12 }}>No services listed</span>
                      )}
                    </div>
                    <div className="row between">
                      {minPrice !== null ? (
                        <span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                          from ₹{minPrice.toLocaleString('en-IN')}
                        </span>
                      ) : <span />}
                      <button className="btn btn-sm btn-clay">View lab <Icon name="arrow-r" size={13} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DesktopLabDash, DesktopDentistBrowse });
