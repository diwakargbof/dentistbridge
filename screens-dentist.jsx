// screens-dentist.jsx — Dentist side
// All data from Supabase. Real case creation.

function DentistHome({ userId, userProfile, onOpenCase, onBrowse }) {
  const { useCases } = window.CHAIRSIDE_SUPABASE;
  const cases = useCases('dentist', userId);

  const firstName = userProfile?.full_name?.split(' ')[0] || 'Doctor';
  const active = cases || [];
  const ready = active.filter(c => c.service && c.stage === (c.service.stages?.length || 1) - 1);

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <div className="app-hd">
          <div style={{ minWidth: 0 }}>
            <div className="t-eyebrow">{userProfile?.full_name || 'Doctor'}</div>
            <div className="title" style={{ marginTop: 4 }}>Hi, {firstName}</div>
            <div className="sub">
              {cases === null ? 'Loading…' : `${active.length} cases out · ${ready.length} ready for pickup`}
            </div>
          </div>
          <div className="row gap-8">
            <button className="btn-icon"><Icon name="bell" /></button>
            <Avatar name={userProfile?.full_name || 'D'} size={40} tone="info" />
          </div>
        </div>

        {/* Hero action */}
        <div style={{ padding: '4px 20px 12px' }}>
          <div onClick={onBrowse} className="row-tap" style={{
            background: 'var(--ink)', color: 'var(--bg)',
            borderRadius: 18, padding: 16, display: 'flex', gap: 12,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <div className="t-eyebrow">Active · {cases === null ? '…' : active.length}</div>
          <button className="btn btn-xs btn-soft">All cases</button>
        </div>

        {cases === null ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading cases…</div>
        ) : active.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 6 }}>No active cases</div>
            <div style={{ color: 'var(--muted-2)', fontSize: 12 }}>Tap "Send a new case" to get started.</div>
          </div>
        ) : (
          <div style={{ padding: '0 20px 14px' }} className="col gap-10">
            {active.map(c => {
              const svc = c.service || {};
              const stages = svc.stages || [];
              const labName = c.lab?.name || 'Lab';
              const techName = c.lab?.owner?.full_name || labName;
              const isReady = stages.length > 0 && c.stage === stages.length - 1;
              return (
                <div key={c.id} className="card row-tap" onClick={() => onOpenCase && onOpenCase(c)}>
                  <div className="row between" style={{ marginBottom: 8 }}>
                    <div className="row gap-8">
                      <Avatar name={techName} size={32} tone="clay" />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{labName}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>{techName !== labName ? techName : ''}</div>
                      </div>
                    </div>
                    {isReady
                      ? <Pill tone="ok" dot>Ready</Pill>
                      : <span className="t-xs muted">{new Date(c.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    }
                  </div>
                  <div className="hr" style={{ marginBottom: 10 }} />
                  <div className="row between" style={{ alignItems: 'baseline', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>{svc.title || '—'}</div>
                      <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{c.patient_ref || '—'}</div>
                    </div>
                    <span className="t-xs" style={{ color: 'var(--ink-3)' }}>{stages[c.stage] || '—'}</span>
                  </div>
                  <StageDots total={stages.length || 1} current={c.stage || 0} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
function DentistBrowse({ onOpenLab }) {
  const { useLabs } = window.CHAIRSIDE_SUPABASE;
  const labs = useLabs();

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <ScreenHeader title="Find a lab" sub="Sorted by rating" />
        <div style={{ padding: '0 20px 12px' }}>
          <div className="row gap-8" style={{ height: 44, padding: '0 14px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12 }}>
            <Icon name="search" size={18} color="var(--muted)" />
            <span className="muted" style={{ fontSize: 14 }}>Search labs or services…</span>
          </div>
          <div className="row gap-6" style={{ marginTop: 12, overflow: 'auto' }}>
            {['All', 'Crown & bridge', 'Veneers', 'Dentures', 'Night guard'].map((c, i) => (
              <button key={c} className={'pill ' + (i === 0 ? 'pill-ink' : '')} style={{ height: 28, padding: '0 12px', fontSize: 12.5 }}>{c}</button>
            ))}
          </div>
        </div>

        {labs === null ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading labs…</div>
        ) : labs.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 6 }}>No labs found</div>
            <div style={{ color: 'var(--muted-2)', fontSize: 12 }}>Labs will appear here once they register.</div>
          </div>
        ) : (
          <div style={{ padding: '4px 20px 20px' }} className="col gap-12">
            {labs.map((lab, idx) => {
              const services = lab.services || [];
              const minPrice = services.length > 0 ? Math.min(...services.map(s => s.price || 0)) : null;
              const tones = ['clay', 'info', 'ok', 'ink'];
              return (
                <div key={lab.id} className="card row-tap" onClick={() => onOpenLab && onOpenLab(lab)}>
                  <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
                    <Avatar name={lab.owner?.full_name || lab.name} size={48} tone={tones[idx % tones.length]} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row between" style={{ alignItems: 'baseline' }}>
                        <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.005em' }}>{lab.name}</div>
                        {lab.rating > 0 && (
                          <div className="row gap-3" style={{ color: 'var(--ink-2)', fontSize: 12.5 }}>
                            <Icon name="star" size={12} color="var(--clay)" />
                            <span className="mono" style={{ fontSize: 12 }}>{lab.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>
                        {lab.owner?.full_name ? `${lab.owner.full_name} · ` : ''}{lab.city}{lab.jobs_count ? ` · ${lab.jobs_count} cases` : ''}
                      </div>
                      {services.length > 0 && (
                        <div className="row gap-6" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                          {services.slice(0, 3).map(s => (
                            <span key={s.id} className="pill" style={{ height: 20, fontSize: 11 }}>{s.title}</span>
                          ))}
                        </div>
                      )}
                      <div className="row between" style={{ fontSize: 12.5 }}>
                        <span className="muted">
                          {lab.turnaround && <><Icon name="clock" size={12} /> {lab.turnaround}</>}
                        </span>
                        {minPrice !== null && (
                          <span className="mono ink-2" style={{ fontSize: 12.5 }}>from ₹{minPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
function DentistTechProfile({ lab, onBack, onAssign }) {
  if (!lab) {
    return (
      <div className="scr">
        <div className="scr-body scr-pad-top">
          <div style={{ padding: '8px 16px 0' }}><button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button></div>
          <div style={{ padding: 20, color: 'var(--muted)', fontSize: 13 }}>Lab not found.</div>
        </div>
      </div>
    );
  }

  const services = lab.services || [];
  const techName = lab.owner?.full_name || lab.name;

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ paddingBottom: 90 }}>
        <div style={{ padding: '8px 16px 0' }}>
          <button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button>
        </div>

        {/* Hero */}
        <div style={{ padding: '14px 20px 0' }}>
          <Avatar name={techName} size={56} tone="clay" />
          <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.12, marginTop: 12 }}>{lab.name}</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{techName} · {lab.city}</div>
          <div className="row gap-14" style={{ marginTop: 14, fontSize: 12.5 }}>
            {lab.rating > 0 && <span className="row gap-4 ink-2"><Icon name="star" size={13} color="var(--clay)" /> {lab.rating}{lab.jobs_count ? ` · ${lab.jobs_count} cases` : ''}</span>}
            {lab.turnaround && <span className="row gap-4 muted"><Icon name="clock" size={13} /> {lab.turnaround}</span>}
          </div>
          {lab.bio && <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 14, lineHeight: 1.55 }}>{lab.bio}</p>}
        </div>

        {/* Services */}
        <div style={{ padding: '24px 20px 0' }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Services · {services.length}</div>
          {services.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No services listed yet.</div>
          ) : (
            <div className="col gap-8">
              {services.map(s => (
                <div key={s.id} className="card row-tap" onClick={() => onAssign && onAssign(s)}>
                  <div className="row between" style={{ alignItems: 'baseline', marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>{s.title}</div>
                    <div className="mono" style={{ fontSize: 13 }}>₹{(s.price || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>{s.description || s.desc || ''}</div>
                  <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
                    {(s.stages || []).map((st, i) => (
                      <React.Fragment key={st}>
                        <span className="t-xs ink-3">{st}</span>
                        {i < (s.stages || []).length - 1 && <span style={{ color: 'var(--muted-2)', fontSize: 11 }}>›</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px calc(10px + 24px)', background: 'rgba(243, 239, 232, 0.92)', backdropFilter: 'blur(20px) saturate(160%)', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }}>Message</button>
        <button className="btn btn-clay" style={{ flex: 1.4 }} onClick={() => onAssign && onAssign(services[0] || null)}>
          Send a case <Icon name="arrow-r" size={16} />
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
function DentistAssign({ lab, userId, initialService, onBack, onSent }) {
  const services = lab?.services || [];
  const [selected, setSelected] = React.useState(initialService || services[0] || null);
  const [patientRef, setPatientRef] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState(null);

  if (!lab) {
    return (
      <div className="scr">
        <div className="scr-body scr-pad-top">
          <div style={{ padding: '8px 16px 0' }}><button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button></div>
          <div style={{ padding: 20, color: 'var(--muted)', fontSize: 13 }}>Lab not found.</div>
        </div>
      </div>
    );
  }

  async function handleSend() {
    if (!selected || !userId) return;
    setSending(true);
    setError(null);
    try {
      const newCase = await window.CHAIRSIDE_SUPABASE.createCase({
        lab_id: lab.id,
        dentist_id: userId,
        service_id: selected.id,
        patient_ref: patientRef.trim() || null,
        notes: notes.trim() || null,
      });
      // Augment with embedded objects so chat screen can render immediately
      onSent && onSent({ ...newCase, service: selected, lab });
    } catch (e) {
      setError(e.message || 'Failed to send case. Try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ paddingBottom: 90 }}>
        <div style={{ padding: '8px 16px 0' }}>
          <button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button>
        </div>

        <div style={{ padding: '12px 20px 0' }}>
          <div className="t-eyebrow">New case to</div>
          <div className="row gap-10" style={{ marginTop: 8, marginBottom: 18 }}>
            <Avatar name={lab.owner?.full_name || lab.name} size={40} tone="clay" />
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 600 }}>{lab.name}</div>
              {lab.owner?.full_name && <div className="muted" style={{ fontSize: 12.5 }}>{lab.owner.full_name}</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px' }} className="col gap-16">
          {/* Service picker */}
          <div className="col gap-8">
            <label className="t-xs muted">Service</label>
            {services.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>This lab has no services listed yet.</div>
            ) : (
              <div className="col gap-6">
                {services.map(svc => (
                  <div key={svc.id} className="row gap-10 row-tap" onClick={() => setSelected(svc)}
                    style={{
                      padding: 12, borderRadius: 12,
                      background: selected?.id === svc.id ? 'var(--clay-soft)' : 'var(--surface)',
                      border: '1px solid ' + (selected?.id === svc.id ? 'transparent' : 'var(--line)'),
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: '1.5px solid ' + (selected?.id === svc.id ? 'var(--clay)' : 'var(--line-2)'),
                      background: selected?.id === svc.id ? 'var(--clay)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected?.id === svc.id && <div style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="row between">
                        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{svc.title}</div>
                        <div className="mono" style={{ fontSize: 13 }}>₹{(svc.price || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className="muted" style={{ fontSize: 12 }}>{(svc.stages || []).length} stages{lab.turnaround ? ` · ${lab.turnaround}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col gap-8">
            <label className="t-xs muted">Patient reference</label>
            <input className="field" placeholder="Patient · tooth / location" value={patientRef} onChange={e => setPatientRef(e.target.value)} />
          </div>

          <div className="col gap-8">
            <label className="t-xs muted">Notes to lab</label>
            <textarea className="field" rows={3} placeholder="Any special instructions…" value={notes} onChange={e => setNotes(e.target.value)} />
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

          {selected && (
            <div className="card-flat row between" style={{ padding: 14, marginTop: 4 }}>
              <div>
                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Total</div>
                <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>₹{(selected.price || 0).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="t-xs muted">Pay after delivery</div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--warn-soft)', color: '#6b4d12', fontSize: 13.5 }}>{error}</div>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px calc(10px + 24px)', background: 'rgba(243, 239, 232, 0.92)', backdropFilter: 'blur(20px) saturate(160%)', borderTop: '1px solid var(--line)' }}>
        <button
          className="btn btn-clay btn-block"
          onClick={handleSend}
          disabled={sending || !selected || !userId}
        >
          {sending ? 'Sending…' : `Send case to ${lab.owner?.full_name?.split(' ')[0] || 'lab'}`}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { DentistHome, DentistBrowse, DentistTechProfile, DentistAssign });
