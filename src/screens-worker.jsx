// screens-worker.jsx — worker scan flow, queue, history, profile

function WorkerScanHome() {
  const { sel, dispatch } = useStore();
  const me = sel.user;
  const myStage = sel.stageById(me.stageId);
  const [scanning, setScanning] = React.useState(false);
  const [notFound, setNotFound] = React.useState(null);
  const [wrongStage, setWrongStage] = React.useState(null); // { c, currentStageName }
  const [justDone, setJustDone] = React.useState(null);     // { c, nextStage }

  const myQueue = sel.casesForStage(me.stageId);
  const myToday = sel.casesByWorker(me.id)
    .filter(a => Date.now() - a.at < 86400000)
    .slice(0, 4);

  function clearAlerts() {
    setNotFound(null); setWrongStage(null);
  }

  function handleScan(text) {
    setScanning(false);
    clearAlerts();
    setJustDone(null);

    const id = text.trim().toUpperCase();
    const c = sel.caseById(id);

    if (!c) { setNotFound(id); return; }

    const myStageIdx = sel.stages.findIndex(s => s.id === me.stageId);

    // Case not at this worker's station
    if (c.currentStageIdx !== myStageIdx) {
      const currentStageName = c.currentStageIdx < 0
        ? 'Reception (not started)'
        : c.currentStageIdx >= sel.stages.length
          ? 'Done (awaiting dispatch)'
          : sel.stages[c.currentStageIdx]?.name || 'another stage';
      setWrongStage({ c, currentStageName });
      return;
    }

    // Case isn't active (on hold, cancelled, etc.)
    if (c.status !== 'active') {
      setWrongStage({ c, currentStageName: c.status });
      return;
    }

    // ✓ Auto-complete this stage
    dispatch({ type: 'COMPLETE_STAGE', payload: { caseId: c.id, actor: me, stageId: me.stageId } });
    const nextStage = sel.stages[myStageIdx + 1] || null;
    setJustDone({ c, nextStage });
  }

  // Success confirmation card shown after scan
  if (justDone) {
    const { c, nextStage } = justDone;
    return (
      <Shell title={false}>
        <div className="pg" style={{ paddingTop: 40, paddingBottom: 40 }}>
          {/* Big success state */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 40,
              background: 'var(--ok-soft)', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="check-circle" size={40} color="var(--ok)" />
            </div>
            <div className="t-eyebrow" style={{ color: 'var(--ok-ink)', marginBottom: 6 }}>
              {myStage?.name} complete
            </div>
            <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {c.patient}
            </div>
            <div className="mono muted" style={{ fontSize: 13, marginTop: 6 }}>
              {c.id}
            </div>
          </div>

          {/* Case summary */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="t-eyebrow">Case</span>
              <span className="pill">{sel.caseTypeName(c.caseType)}</span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{c.dentistName}</div>
            {nextStage ? (
              <div className="row gap-8" style={{ marginTop: 10, padding: '8px 10px', background: 'var(--clay-soft)', borderRadius: 8 }}>
                <Icon name="arrow-r" size={14} color="var(--clay-ink)" />
                <span style={{ fontSize: 13, color: 'var(--clay-ink)', fontWeight: 500 }}>
                  Next: {nextStage.name} station notified
                </span>
              </div>
            ) : (
              <div className="row gap-8" style={{ marginTop: 10, padding: '8px 10px', background: 'var(--ok-soft)', borderRadius: 8 }}>
                <Icon name="truck" size={14} color="var(--ok-ink)" />
                <span style={{ fontSize: 13, color: 'var(--ok-ink)', fontWeight: 500 }}>
                  All stages done · Reception notified for dispatch
                </span>
              </div>
            )}
          </div>

          <div className="col gap-10">
            <button
              className="btn btn-clay btn-lg btn-block"
              onClick={() => { setJustDone(null); clearAlerts(); }}
            >
              <Icon name="scan" size={18} />
              Scan next case
            </button>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => { setJustDone(null); nav('/case/' + c.id); }}
            >
              View case details
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-eyebrow">{myStage?.name || 'Worker'} station</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Hi, {me.name.split(' ')[0]}</div>
        </div>
        <Avatar name={me.name} size={40} tone="clay" />
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        {/* Primary CTA — scan */}
        <button className="scan-cta" onClick={() => { clearAlerts(); setScanning(true); }}>
          <div className="scan-frame">
            <Icon name="barcode" size={42} color="#fff" />
          </div>
          <div className="label">Scan a case</div>
          <div className="sub">Scanning marks your stage complete instantly</div>
        </button>

        {/* Error: not found */}
        {notFound && (
          <div className="card" style={{ marginTop: 14, background: 'var(--danger-soft)', border: 'none' }}>
            <div className="row gap-8" style={{ marginBottom: 4, color: 'var(--danger-ink)' }}>
              <Icon name="warning" size={16} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Case not found</span>
            </div>
            <div style={{ color: 'var(--danger-ink)', fontSize: 13 }}>
              <span className="mono">{notFound}</span> doesn't match any case. Ask reception to check the label.
            </div>
            <button className="btn btn-xs btn-ghost" style={{ marginTop: 10 }} onClick={clearAlerts}>Dismiss</button>
          </div>
        )}

        {/* Error: wrong stage */}
        {wrongStage && (
          <div className="card" style={{ marginTop: 14, background: 'var(--warn-soft)', border: 'none' }}>
            <div className="row gap-8" style={{ marginBottom: 4, color: 'var(--warn-ink)' }}>
              <Icon name="warning" size={16} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Not at your station</span>
            </div>
            <div style={{ color: 'var(--warn-ink)', fontSize: 13, marginBottom: 10 }}>
              <span style={{ fontWeight: 600 }}>{wrongStage.c.patient}</span> ({wrongStage.c.id}) is currently at{' '}
              <span style={{ fontWeight: 600 }}>{wrongStage.currentStageName}</span>. You are assigned to{' '}
              <span style={{ fontWeight: 600 }}>{myStage?.name}</span>.
            </div>
            <div className="row gap-8">
              <button className="btn btn-xs btn-ghost" onClick={clearAlerts}>Dismiss</button>
              <button className="btn btn-xs btn-soft" onClick={() => { clearAlerts(); nav('/case/' + wrongStage.c.id); }}>View case</button>
            </div>
          </div>
        )}

        {/* My queue */}
        <div className="row between" style={{ marginTop: 22, marginBottom: 10, alignItems: 'baseline' }}>
          <div className="t-eyebrow">At {myStage?.name} · {myQueue.length}</div>
          {myQueue.length > 0 && <Link to="/queue" className="t-xs" style={{ color: 'var(--clay-ink)', textDecoration: 'none' }}>See all →</Link>}
        </div>
        {myQueue.length === 0 ? (
          <Empty icon="check-circle" title="Inbox empty" sub={`No cases waiting at ${myStage?.name}.`} />
        ) : (
          <div className="col gap-8">
            {myQueue.slice(0, 4).map(c => <QueueCard key={c.id} c={c} />)}
          </div>
        )}

        {/* My today */}
        {myToday.length > 0 && (
          <>
            <div className="t-eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>You finished today</div>
            <div className="col gap-6">
              {myToday.map(a => {
                const c = a.c;
                return (
                  <Link key={a.id} to={'/case/' + c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card row gap-12 row-tap">
                      <Icon name="check-circle" size={18} color="var(--ok)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500 }} className="truncate">{c.patient}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          <span className="mono">{c.id}</span> · {sel.caseTypeName(c.caseType)}
                        </div>
                      </div>
                      <span className="t-xs muted">{formatTime(a.at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {scanning && (
        <Scanner
          onScan={handleScan}
          onClose={() => setScanning(false)}
          helperText={`Scan to mark ${myStage?.name} complete.`}
        />
      )}
    </Shell>
  );
}

function QueueCard({ c }) {
  const { sel } = useStore();
  const d = dueRel(c);
  const u = sel.urgency(c.urgency);
  return (
    <Link to={'/case/' + c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card row-tap" style={{
        borderLeft: u?.tone === 'emergency' ? '4px solid var(--danger)' :
                    u?.tone === 'district' ? '4px solid var(--warn)' : undefined,
      }}>
        <div className="row between" style={{ marginBottom: 6 }}>
          <span className="case-id muted" style={{ fontSize: 12 }}>{c.id}</span>
          {u && u.tone !== 'normal' && (
            <span className={'urg urg-' + u.tone} style={{ height: 20, padding: '0 8px', fontSize: 10.5 }}>
              {u.name}
            </span>
          )}
        </div>
        <div className="row between" style={{ alignItems: 'baseline' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }} className="truncate">{c.patient}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }} className="truncate">
              {sel.caseTypeName(c.caseType)} · {c.units} unit{c.units > 1 ? 's' : ''}
            </div>
          </div>
          {d && (
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: d.overdue ? 'var(--danger)' : d.soon ? 'var(--warn-ink)' : 'var(--muted)',
            }}>{d.label}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Worker queue (all cases at my stage) ────────────────
function WorkerQueueScreen() {
  const { sel } = useStore();
  const me = sel.user;
  const myStage = sel.stageById(me.stageId);
  const myQueue = sel.casesForStage(me.stageId)
    .sort((a, b) => {
      const ua = sel.urgency(a.urgency)?.slaHours || 168;
      const ub = sel.urgency(b.urgency)?.slaHours || 168;
      if (ua !== ub) return ua - ub;
      return (a.dueDate || 0) - (b.dueDate || 0);
    });

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">My queue</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>{myStage?.name} · {myQueue.length}</div>
        </div>
      </header>
      <div className="pg" style={{ paddingTop: 8 }}>
        {myQueue.length === 0 ? (
          <Empty icon="check-circle" title="Inbox empty" sub={`No cases waiting at ${myStage?.name}.`} />
        ) : (
          <div className="col gap-8">
            {myQueue.map(c => <QueueCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </Shell>
  );
}

// ─── Worker history ──────────────────────────────────────
function WorkerHistoryScreen() {
  const { sel } = useStore();
  const me = sel.user;
  const all = sel.casesByWorker(me.id).sort((a, b) => b.at - a.at);

  const buckets = [
    { name: 'Today',     match: a => Date.now() - a.at < 86400000 },
    { name: 'This week', match: a => Date.now() - a.at < 7 * 86400000 && Date.now() - a.at >= 86400000 },
    { name: 'Earlier',   match: a => Date.now() - a.at >= 7 * 86400000 },
  ];

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Your work</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>History · {all.length}</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        {all.length === 0 ? (
          <Empty icon="history" title="No history yet" sub="Stages you complete will show up here." />
        ) : (
          buckets.map(b => {
            const items = all.filter(b.match);
            if (items.length === 0) return null;
            return (
              <div key={b.name} style={{ marginBottom: 18 }}>
                <div className="t-eyebrow" style={{ marginBottom: 8 }}>{b.name} · {items.length}</div>
                <div className="card" style={{ padding: 0 }}>
                  {items.map((a, i) => {
                    const c = a.c;
                    return (
                      <Link key={a.id} to={'/case/' + c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="row gap-12 row-tap" style={{
                          padding: '12px 14px',
                          borderBottom: i < items.length - 1 ? '1px solid var(--line)' : '0',
                        }}>
                          <Icon name="check-circle" size={18} color="var(--ok)" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500 }} className="truncate">{c.patient}</div>
                            <div className="muted" style={{ fontSize: 11.5 }}>
                              <span className="mono">{c.id}</span> · {sel.caseTypeName(c.caseType)}
                            </div>
                          </div>
                          <span className="t-xs muted">{relTime(a.at)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Shell>
  );
}

// ─── Profile (worker + receptionist + owner shared shape) ────
function ProfileScreen() {
  const { sel, logout, dispatch } = useStore();
  const me = sel.user;
  const myStage = me.stageId ? sel.stageById(me.stageId) : null;
  const stats = me.role === 'worker' ? {
    today: sel.casesByWorker(me.id).filter(a => Date.now() - a.at < 86400000).length,
    week:  sel.casesByWorker(me.id).filter(a => Date.now() - a.at < 7 * 86400000).length,
    total: sel.casesByWorker(me.id).length,
  } : null;

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Account</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Me</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        <div className="card row gap-12" style={{ alignItems: 'center' }}>
          <Avatar name={me.name} size={56} tone={toneFor(me)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{me.name}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>
              {roleLabel(me, sel)} · <span className="mono">{me.phone}</span>
            </div>
          </div>
        </div>

        {stats && (
          <div className="row gap-8" style={{ marginTop: 14 }}>
            <StatTile label="Today"     value={stats.today} />
            <StatTile label="This week" value={stats.week} />
            <StatTile label="Total"     value={stats.total} tone="clay" />
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="row gap-12 row-tap" style={{ padding: '14px 14px' }} onClick={() => {
              if (confirm('Reset all local data? This clears every case, message, and edit on this device.')) {
                dispatch({ type: 'RESET' });
              }
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'var(--surface-2)', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="rotate" size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Reset demo data</div>
                <div className="muted" style={{ fontSize: 12 }}>Restores all 18 sample cases on this device.</div>
              </div>
            </div>
            <div className="hr" />
            <div className="row gap-12 row-tap" style={{ padding: '14px 14px' }} onClick={logout}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'var(--surface-2)', color: 'var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="logout" size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--danger)' }}>Sign out</div>
              </div>
            </div>
          </div>
        </div>

        <div className="muted" style={{ marginTop: 24, fontSize: 11.5, textAlign: 'center', paddingBottom: 20 }}>
          Bench · v0.1 · {sel.labConfig.labName}
        </div>
      </div>
    </Shell>
  );
}

function StatTile({ label, value, tone }) {
  return (
    <div className="tile" style={{
      flex: 1, padding: '12px 14px',
      background: tone === 'clay' ? 'var(--clay-soft)' : 'var(--surface)',
      borderColor: tone ? 'transparent' : 'var(--line)',
    }}>
      <div className="t-eyebrow" style={{ color: tone === 'clay' ? 'var(--clay-ink)' : 'var(--muted)' }}>{label}</div>
      <div className="serif" style={{
        fontSize: 32, lineHeight: 1.1, marginTop: 4, letterSpacing: '-0.02em',
        color: tone === 'clay' ? 'var(--clay-ink)' : 'var(--ink)',
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { WorkerScanHome, WorkerQueueScreen, WorkerHistoryScreen, ProfileScreen, StatTile, QueueCard });
