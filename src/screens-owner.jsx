// screens-owner.jsx — owner board, cases list, reports, audit

function OwnerBoardScreen() {
  const { sel } = useStore();
  const stages = sel.stages;
  const all = sel.allCases();
  const active = all.filter(c => c.status !== 'cancelled' && c.status !== 'dispatched');
  const overdue = active.filter(isOverdue).length;
  const emergencies = active.filter(c => c.urgency === 'emergency').length;
  const ready = active.filter(c => c.currentStageIdx >= stages.length).length;

  // Build columns: Received + each stage + Done(awaiting dispatch) + side pool (Hold/Trial)
  const colReceived = active.filter(c => c.currentStageIdx < 0);
  const colsByStage = stages.map((s, i) => ({
    stage: s,
    items: active.filter(c => c.currentStageIdx === i && c.status === 'active'),
  }));
  const colReady = active.filter(c => c.currentStageIdx >= stages.length);
  const sidePool = active.filter(c => c.status === 'on_hold' || c.status === 'on_trial');

  return (
    <Shell title={false} wide>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">{sel.labConfig.labName} · live board</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>{active.length} active</div>
        </div>
      </header>

      <div style={{ padding: '0 20px 12px' }}>
        <div className="row gap-8" style={{ overflow: 'auto', marginBottom: 14, padding: '0 0 4px' }}>
          <StatTile label="Overdue" value={overdue} tone={overdue > 0 ? 'clay' : null} />
          <StatTile label="Emergency" value={emergencies} />
          <StatTile label="Ready to dispatch" value={ready} />
          <StatTile label="In production" value={active.length - colReceived.length - ready - sidePool.length} />
        </div>
      </div>

      <div className="kan-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 20px 20px', minHeight: 480 }}>
        <BoardCol label="Received" tone="muted" items={colReceived} />
        {colsByStage.map(col => (
          <BoardCol key={col.stage.id} label={col.stage.name} items={col.items} stageShort={col.stage.short} />
        ))}
        <BoardCol label="Ready" tone="ok" items={colReady} />
        {sidePool.length > 0 && (
          <BoardCol label="Hold / Trial" tone="warn" items={sidePool} />
        )}
      </div>
    </Shell>
  );
}

function BoardCol({ label, items, tone, stageShort }) {
  return (
    <div className="kan-col">
      <h4>
        <span style={{ color: tone === 'ok' ? 'var(--ok-ink)' : tone === 'warn' ? 'var(--warn-ink)' : 'var(--ink-3)' }}>
          {label}
        </span>
        <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{items.length}</span>
      </h4>
      <div className="kan-col-body">
        {items.map(c => <BoardCard key={c.id} c={c} />)}
        {items.length === 0 && (
          <div style={{ padding: 12, color: 'var(--muted-2)', fontSize: 12, textAlign: 'center' }}>—</div>
        )}
      </div>
    </div>
  );
}

function BoardCard({ c }) {
  const { sel } = useStore();
  const u = sel.urgency(c.urgency);
  const d = dueRel(c);
  const overdue = isOverdue(c);
  const klass = 'kan-card' +
    (u?.tone === 'emergency' ? ' emergency' :
     u?.tone === 'district' ? ' district' : '') +
    (overdue ? ' overdue' : '');
  return (
    <div className={klass} onClick={() => nav('/case/' + c.id)}>
      <div className="row between" style={{ marginBottom: 4 }}>
        <span className="case-id muted" style={{ fontSize: 10.5 }}>{c.id}</span>
        {c.status === 'on_hold' && <Icon name="pause" size={12} color="var(--warn)" />}
        {c.status === 'on_trial' && <Icon name="truck" size={12} color="var(--info)" />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em', marginBottom: 2 }} className="truncate">{c.patient}</div>
      <div className="muted" style={{ fontSize: 11.5 }} className="truncate">
        {sel.caseTypeName(c.caseType)} · {c.dentistName.replace(/^Dr\.\s*/, '')}
      </div>
      <div className="row between" style={{ marginTop: 8 }}>
        <StageStrip stages={sel.stages} currentIdx={c.currentStageIdx} />
      </div>
      {d && (
        <div className="row gap-4" style={{ marginTop: 6 }}>
          <Icon name={d.overdue ? 'flame' : d.soon ? 'clock' : 'calendar'} size={11}
            color={d.overdue ? 'var(--danger)' : d.soon ? 'var(--warn-ink)' : 'var(--muted)'} />
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: d.overdue ? 'var(--danger)' : d.soon ? 'var(--warn-ink)' : 'var(--muted)',
          }}>{d.label}</span>
        </div>
      )}
    </div>
  );
}

// ─── Owner Cases (filterable list) ──────────────────────
function OwnerCasesScreen() {
  const { sel } = useStore();
  const all = sel.allCases();
  const [filter, setFilter] = React.useState('active');
  const [stageFilter, setStageFilter] = React.useState('all');
  const [q, setQ] = React.useState('');

  let filtered = all;
  if (filter === 'active') filtered = filtered.filter(c => c.status !== 'cancelled' && c.status !== 'dispatched');
  if (filter === 'overdue') filtered = filtered.filter(isOverdue);
  if (filter === 'emergency') filtered = filtered.filter(c => c.urgency === 'emergency' && c.status !== 'cancelled');
  if (filter === 'dispatched') filtered = filtered.filter(c => c.status === 'dispatched');
  if (filter === 'cancelled') filtered = filtered.filter(c => c.status === 'cancelled');
  if (stageFilter !== 'all') {
    const idx = sel.stages.findIndex(s => s.id === stageFilter);
    filtered = filtered.filter(c => c.currentStageIdx === idx);
  }
  if (q) {
    const ql = q.toLowerCase();
    filtered = filtered.filter(c => (c.patient + ' ' + c.id + ' ' + c.dentistName).toLowerCase().includes(ql));
  }
  filtered = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">All cases</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>{filtered.length} {filter === 'active' ? 'active' : filter}</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        <div className="row gap-8" style={{
          height: 44, padding: '0 14px', background: 'var(--surface)',
          border: '1px solid var(--line)', borderRadius: 12, marginBottom: 10,
        }}>
          <Icon name="search" size={18} color="var(--muted)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search ID, patient, or dentist…"
            style={{ flex: 1, height: '100%', border: 0, background: 'transparent', font: 'inherit', fontSize: 14, color: 'var(--ink)', outline: 'none' }} />
        </div>

        <div className="row gap-6" style={{ overflow: 'auto', marginBottom: 14 }}>
          {[
            { id: 'active', label: 'Active' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} className={'pill ' + (filter === t.id ? 'pill-ink' : '')}
              style={{ height: 28, padding: '0 12px', fontSize: 12.5, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
          <span style={{ flexShrink: 0, color: 'var(--muted-2)', padding: '0 6px' }}>·</span>
          <select className="field" style={{ height: 28, fontSize: 12.5, padding: '0 24px 0 12px', borderRadius: 14, flexShrink: 0, width: 'auto' }}
            value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="all">All stages</option>
            {sel.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <Empty icon="search" title="No cases match" sub="Try a different filter." />
        ) : (
          <div className="col gap-8">
            {filtered.map(c => <ReceptionCaseRow key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </Shell>
  );
}

// ─── Reports ────────────────────────────────────────────
function OwnerReportsScreen() {
  const { state, sel } = useStore();
  const stages = sel.stages;
  const all = sel.allCases();
  const workers = sel.allWorkers();

  // Per-worker stage completions in last 7 days
  const weekMs = 7 * 86400000;
  const since = Date.now() - weekMs;
  const completionsByWorker = workers.map(w => {
    const events = state.audit.filter(a =>
      a.action === 'stage_complete' && a.actorId === w.id && a.at >= since
    );
    return { worker: w, count: events.length };
  }).sort((a, b) => b.count - a.count);

  const maxWeek = Math.max(1, ...completionsByWorker.map(x => x.count));

  // Stage throughput (last 7 days, total per stage)
  const stageThru = stages.map(s => {
    const events = state.audit.filter(a =>
      a.action === 'stage_complete' && a.meta?.stageId === s.id && a.at >= since
    );
    return { stage: s, count: events.length };
  });
  const maxStage = Math.max(1, ...stageThru.map(x => x.count));

  // Case-type breakdown of active cases
  const byType = {};
  sel.casesActive().forEach(c => { byType[c.caseType] = (byType[c.caseType] || 0) + 1; });
  const typeBreak = Object.entries(byType).map(([id, v]) => ({ id, name: sel.caseTypeName(id), v }))
    .sort((a, b) => b.v - a.v);
  const maxType = Math.max(1, ...typeBreak.map(x => x.v));

  // Average days in lab (dispatched cases)
  const dispatched = all.filter(c => c.dispatched && c.dispatchedAt);
  const avgDays = dispatched.length
    ? Math.round(dispatched.reduce((s, c) => s + (c.dispatchedAt - c.createdAt), 0) / dispatched.length / 86400000 * 10) / 10
    : 0;

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Last 7 days</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Reports</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        <div className="row gap-8" style={{ marginBottom: 18 }}>
          <StatTile label="Active" value={sel.casesActive().length} />
          <StatTile label="Dispatched (all)" value={dispatched.length} tone="clay" />
          <StatTile label="Avg lab days" value={avgDays} />
        </div>

        <div className="card">
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>Worker completions · last 7 days</div>
          <div className="bar-chart">
            {completionsByWorker.map(({ worker, count }) => (
              <div className="bar-row" key={worker.id}>
                <span className="name">{worker.name.split(' ')[0]}</span>
                <div className="track">
                  <div className="fill" style={{ width: (count / maxWeek) * 100 + '%' }} />
                </div>
                <span className="v">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>Stage throughput · last 7 days</div>
          <div className="bar-chart">
            {stageThru.map(({ stage, count }) => (
              <div className="bar-row" key={stage.id}>
                <span className="name">{stage.name}</span>
                <div className="track">
                  <div className="fill" style={{ width: (count / maxStage) * 100 + '%', background: 'var(--ink)' }} />
                </div>
                <span className="v">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>Active cases by type</div>
          <div className="bar-chart">
            {typeBreak.map(t => (
              <div className="bar-row" key={t.id}>
                <span className="name">{t.name}</span>
                <div className="track">
                  <div className="fill" style={{ width: (t.v / maxType) * 100 + '%', background: 'var(--info)' }} />
                </div>
                <span className="v">{t.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="muted" style={{ marginTop: 24, fontSize: 11.5, textAlign: 'center', paddingBottom: 20 }}>
          Reports auto-refresh as cases move.
        </div>
      </div>
    </Shell>
  );
}

// ─── Activity (global audit) ────────────────────────────
function OwnerActivityScreen() {
  const { state, sel } = useStore();
  const [filter, setFilter] = React.useState('all');

  let events = [...state.audit].sort((a, b) => b.at - a.at);
  if (filter !== 'all') events = events.filter(a => a.action === filter);

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Audit log · {state.audit.length} events</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Activity</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        <div className="row gap-6" style={{ overflow: 'auto', marginBottom: 14 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'received', label: 'Received' },
            { id: 'stage_complete', label: 'Stage complete' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'on_hold', label: 'On hold' },
            { id: 'warranty_issued', label: 'Warranty' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={'pill ' + (filter === f.id ? 'pill-ink' : '')}
              style={{ height: 28, padding: '0 12px', fontSize: 12.5, cursor: 'pointer' }}>{f.label}</button>
          ))}
        </div>

        <div className="card" style={{ padding: '4px 14px' }}>
          {events.slice(0, 100).map(a => (
            <div key={a.id} className="audit-row">
              <div className="ts">{formatDateShort(a.at)} {formatTime(a.at)}</div>
              <div className="body">
                <div>
                  <span className="actor">{a.actorName}</span> <span className="what">{(window.ACTION_VERBS || {})[a.action] || a.action}</span>{' '}
                  <Link to={'/case/' + a.caseId} className="case-id" style={{ color: 'var(--clay-ink)', fontSize: 12, textDecoration: 'none' }}>{a.caseId}</Link>
                </div>
                <AuditMeta action={a.action} meta={a.meta} />
              </div>
            </div>
          ))}
          {events.length === 0 && <Empty icon="history" title="No events" sub="" />}
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { OwnerBoardScreen, OwnerCasesScreen, OwnerReportsScreen, OwnerActivityScreen, BoardCol, BoardCard });
