// screens-reception.jsx — receptionist screens: intake, active, dispatch, warranty

function ReceptionActiveScreen() {
  const { sel } = useStore();
  const all = sel.allCases();
  const active = all.filter(c => c.status !== 'cancelled' && c.status !== 'dispatched')
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const overdue = active.filter(isOverdue);
  const ready = active.filter(c => c.currentStageIdx >= sel.stages.length);
  const onTrial = active.filter(c => c.status === 'on_trial');
  const onHold = active.filter(c => c.status === 'on_hold');

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Reception desk</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Active · {active.length}</div>
        </div>
        <button className="btn btn-sm btn-clay" onClick={() => nav('/intake')}>
          <Icon name="plus" size={14} /> New
        </button>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        {/* Quick stats */}
        <div className="row gap-8" style={{ overflow: 'auto', marginBottom: 14, padding: '0 0 4px' }}>
          <StatTile label="Ready to dispatch" value={ready.length} tone={ready.length ? 'clay' : null} />
          <StatTile label="Overdue" value={overdue.length} />
          <StatTile label="On trial" value={onTrial.length} />
          <StatTile label="On hold" value={onHold.length} />
        </div>

        {ready.length > 0 && (
          <div className="card" style={{
            marginBottom: 16, padding: 14,
            background: 'var(--clay-soft)', border: 'none',
          }}>
            <div className="row gap-8" style={{ marginBottom: 6 }}>
              <Icon name="truck" size={16} color="var(--clay-ink)" />
              <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--clay-ink)' }}>
                {ready.length} case{ready.length > 1 ? 's' : ''} ready for dispatch
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--clay-ink)', marginBottom: 10 }}>
              QC has finished these. Mark dispatched and issue warranty.
            </div>
            <button className="btn btn-sm" style={{ background: 'var(--clay)', borderColor: 'var(--clay)', color: '#fff' }} onClick={() => nav('/dispatch')}>
              Review →
            </button>
          </div>
        )}

        <div className="col gap-8">
          {active.map(c => <ReceptionCaseRow key={c.id} c={c} />)}
        </div>
      </div>
    </Shell>
  );
}

function ReceptionCaseRow({ c }) {
  const { sel } = useStore();
  const u = sel.urgency(c.urgency);
  const d = dueRel(c);
  const stage = c.currentStageIdx < 0 ? null
              : c.currentStageIdx >= sel.stages.length ? { name: 'Done · awaiting dispatch' }
              : sel.stages[c.currentStageIdx];
  return (
    <Link to={'/case/' + c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card row-tap" style={{
        borderLeft: u?.tone === 'emergency' ? '4px solid var(--danger)' :
                    u?.tone === 'district' ? '4px solid var(--warn)' : undefined,
      }}>
        <div className="row between" style={{ marginBottom: 6 }}>
          <span className="case-id muted" style={{ fontSize: 12 }}>{c.id}</span>
          <div className="row gap-6">
            {u && u.tone !== 'normal' && <Pill tone={u.tone === 'emergency' ? 'danger' : 'warn'} dot>{u.name}</Pill>}
            {c.status === 'on_hold' && <Pill tone="warn" dot>On hold</Pill>}
            {c.status === 'on_trial' && <Pill tone="info" dot>On trial</Pill>}
          </div>
        </div>
        <div className="row between" style={{ alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.005em' }} className="truncate">{c.patient}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }} className="truncate">
              {sel.caseTypeName(c.caseType)} · {c.dentistName}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>{stage?.name}</div>
            {d && (
              <div style={{
                fontSize: 11, marginTop: 2, fontWeight: 600,
                color: d.overdue ? 'var(--danger)' : d.soon ? 'var(--warn-ink)' : 'var(--muted)',
              }}>{d.label}</div>
            )}
          </div>
        </div>
        <StageStrip stages={sel.stages} currentIdx={c.currentStageIdx} />
      </div>
    </Link>
  );
}

// ─── Intake / new case form ──────────────────────────────
function ReceptionIntakeScreen() {
  const { sel, dispatch } = useStore();
  const me = sel.user;
  const [form, setForm] = React.useState({
    patient: '',
    dentistName: '',
    dentistClinic: '',
    caseType: sel.caseTypes[0]?.id || '',
    urgency: 'normal',
    units: 1,
    dueDays: 5,
    instructions: '',
  });
  const [created, setCreated] = React.useState(null);

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  function submit(e) {
    e && e.preventDefault();
    if (!form.patient.trim() || !form.dentistName.trim()) return;
    const id = newCaseId();
    const now = Date.now();
    const dueDate = now + form.dueDays * 86400000;
    const c = {
      id,
      caseType: form.caseType,
      patient: form.patient.trim(),
      dentistName: form.dentistName.trim(),
      dentistClinic: form.dentistClinic.trim(),
      urgency: form.urgency,
      units: parseInt(form.units, 10) || 1,
      dueDate,
      instructions: form.instructions.trim(),
      currentStageIdx: -1,
      stageProgress: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      dispatched: false,
      dispatchedAt: null,
      cancelReason: null,
      warranty: null,
    };
    dispatch({ type: 'CREATE_CASE', payload: { caseObj: c, actor: me } });
    // Immediately move into first stage
    dispatch({ type: 'REASSIGN_STAGE', payload: { caseId: id, actor: me, stageIdx: 0, reason: 'Auto-assigned to first stage' } });
    setCreated(c);
  }

  if (created) {
    return <ReceptionCreated c={created} onAnother={() => { setCreated(null); setForm({ ...form, patient: '', instructions: '' }); }} />;
  }

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Reception</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>New case</div>
        </div>
      </header>

      <form className="pg" onSubmit={submit} style={{ paddingTop: 8, paddingBottom: 30 }}>
        <div className="col gap-14">
          <FormGroup label="Patient name">
            <input className="field" value={form.patient} onChange={e => update('patient', e.target.value)} placeholder="Riya Shah" required autoFocus />
          </FormGroup>

          <div className="row gap-10">
            <FormGroup label="Dentist" style={{ flex: 2 }}>
              <input className="field" value={form.dentistName} onChange={e => update('dentistName', e.target.value)} placeholder="Dr. Anaya Rao" required />
            </FormGroup>
            <FormGroup label="Clinic" style={{ flex: 2 }}>
              <input className="field" value={form.dentistClinic} onChange={e => update('dentistClinic', e.target.value)} placeholder="Rao Family Dental" />
            </FormGroup>
          </div>

          <div className="row gap-10">
            <FormGroup label="Case type" style={{ flex: 2 }}>
              <select className="field" value={form.caseType} onChange={e => update('caseType', e.target.value)}>
                {sel.caseTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Units" style={{ flex: 1 }}>
              <input className="field" type="number" min="1" max="20" value={form.units} onChange={e => update('units', e.target.value)} />
            </FormGroup>
          </div>

          <FormGroup label="Urgency">
            <div className="row gap-8">
              {sel.urgencyLevels.map(u => (
                <button key={u.id} type="button" onClick={() => update('urgency', u.id)} style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10,
                  border: '1.5px solid ' + (form.urgency === u.id
                    ? (u.tone === 'emergency' ? 'var(--danger)' : u.tone === 'district' ? 'var(--warn)' : 'var(--ink)')
                    : 'var(--line)'),
                  background: form.urgency === u.id
                    ? (u.tone === 'emergency' ? 'var(--danger-soft)' : u.tone === 'district' ? 'var(--warn-soft)' : 'var(--surface)')
                    : 'var(--surface)',
                  cursor: 'pointer', font: 'inherit',
                  color: form.urgency === u.id ? (u.tone === 'emergency' ? 'var(--danger-ink)' : u.tone === 'district' ? 'var(--warn-ink)' : 'var(--ink)') : 'var(--ink-2)',
                  fontWeight: form.urgency === u.id ? 600 : 500,
                  fontSize: 12.5,
                  textAlign: 'left',
                }}>
                  <div className="t-eyebrow" style={{ color: 'inherit', opacity: 0.7, fontSize: 9.5, letterSpacing: '0.1em', marginBottom: 2 }}>{u.tone}</div>
                  {u.name}
                  <div style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.7, marginTop: 2 }}>SLA {u.slaHours}h</div>
                </button>
              ))}
            </div>
          </FormGroup>

          <FormGroup label="Due in (days)">
            <input className="field" type="number" min="1" max="60" value={form.dueDays} onChange={e => update('dueDays', e.target.value)} />
          </FormGroup>

          <FormGroup label="Special instructions">
            <textarea className="field" rows={3} value={form.instructions} onChange={e => update('instructions', e.target.value)}
              placeholder="Margin sub-gingival on distal · Use B2 shade · Patient travels Friday…" />
          </FormGroup>

          <button type="submit" className="btn btn-clay btn-lg btn-block" disabled={!form.patient.trim() || !form.dentistName.trim()}>
            Create case · print label
          </button>
        </div>
      </form>
    </Shell>
  );
}

function FormGroup({ label, children, style }) {
  return (
    <div className="col gap-6" style={style}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

// Post-creation screen — barcode preview + print/next actions
function ReceptionCreated({ c, onAnother }) {
  const { sel } = useStore();
  const u = sel.urgency(c.urgency);
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (canvasRef.current && window.JsBarcode) {
      try {
        window.JsBarcode(canvasRef.current, c.id, {
          format: 'CODE128', width: 2, height: 60,
          fontSize: 14, font: 'Geist Mono, monospace',
          margin: 4, displayValue: true,
        });
      } catch (e) { console.warn('Barcode draw failed', e); }
    }
  }, [c.id]);

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Case created</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Ready to label</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8, paddingBottom: 30 }}>
        <div className="card" style={{
          padding: 20, marginBottom: 16, borderLeft: '6px solid ' + (
            u?.tone === 'emergency' ? 'var(--danger)' :
            u?.tone === 'district' ? 'var(--warn)' : 'var(--line-2)'
          ),
        }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="case-id muted" style={{ fontSize: 12 }}>{c.id}</span>
            {u && <span className={'urg urg-' + u.tone}><span className="dot" />{u.name}</span>}
          </div>
          <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{c.patient}</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            {sel.caseTypeName(c.caseType)} · {c.units} unit{c.units > 1 ? 's' : ''} · due {formatDate(c.dueDate)}
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>From {c.dentistName}{c.dentistClinic ? ' · ' + c.dentistClinic : ''}</div>

          <div style={{ marginTop: 16, padding: '12px 8px', background: '#fff', borderRadius: 10, textAlign: 'center' }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
          </div>
        </div>

        <div className="col gap-10">
          <button className="btn btn-clay btn-lg btn-block" onClick={() => window.generateBarcodeLabel(c, sel)}>
            <Icon name="print" size={18} /> Download label · PDF
          </button>
          <div className="row gap-10">
            <button className="btn btn-ghost btn-block" style={{ flex: 1 }} onClick={() => nav('/case/' + c.id)}>
              View case
            </button>
            <button className="btn btn-soft btn-block" style={{ flex: 1 }} onClick={onAnother}>
              Another case
            </button>
          </div>
        </div>

        <div className="card-flat" style={{ marginTop: 18, padding: 14, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          <div className="row gap-6" style={{ marginBottom: 4, color: 'var(--clay-ink)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Icon name="sparkle" size={12} color="var(--clay)" />
            <span>Next steps</span>
          </div>
          Stick the label on the case box, drop the box at <strong>{sel.stages[0]?.name}</strong>, and {sel.workerById('u-rakesh')?.name || 'the worker'} will pick it up from there. You'll get a notification when each stage completes.
        </div>
      </div>
    </Shell>
  );
}

// ─── Dispatch (ready for handoff back to dentist) ───────
function ReceptionDispatchScreen() {
  const { sel } = useStore();
  const stages = sel.stages;
  const all = sel.allCases();
  const ready = all.filter(c =>
    c.status !== 'cancelled' && !c.dispatched &&
    c.currentStageIdx >= stages.length
  );
  const recent = all.filter(c => c.dispatched)
    .sort((a, b) => (b.dispatchedAt || 0) - (a.dispatchedAt || 0)).slice(0, 6);

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Dispatch desk</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Ready · {ready.length}</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        {ready.length === 0 ? (
          <Empty icon="check-circle" title="Nothing waiting" sub="When QC completes a case, it'll show here for dispatch." />
        ) : (
          <div className="col gap-10">
            {ready.map(c => <ReadyCard key={c.id} c={c} />)}
          </div>
        )}

        {recent.length > 0 && (
          <>
            <div className="t-eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>Recently dispatched</div>
            <div className="card" style={{ padding: 0 }}>
              {recent.map((c, i) => (
                <Link key={c.id} to={'/case/' + c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="row gap-12 row-tap" style={{
                    padding: '12px 14px',
                    borderBottom: i < recent.length - 1 ? '1px solid var(--line)' : '0',
                  }}>
                    <Icon name="truck" size={18} color="var(--ok)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }} className="truncate">{c.patient}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>
                        <span className="mono">{c.id}</span> · {c.dentistName} {c.warranty ? '· warranty' : ''}
                      </div>
                    </div>
                    <span className="t-xs muted">{relTime(c.dispatchedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

function ReadyCard({ c }) {
  const { sel, dispatch } = useStore();
  const me = sel.user;
  const u = sel.urgency(c.urgency);
  return (
    <div className="card" style={{ background: 'var(--clay-soft)', border: 'none' }}>
      <div className="row between" style={{ marginBottom: 6 }}>
        <span className="case-id" style={{ fontSize: 12, color: 'var(--clay-ink)' }}>{c.id}</span>
        {u && <span className={'urg urg-' + u.tone}><span className="dot" />{u.name}</span>}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600 }}>{c.patient}</div>
      <div style={{ fontSize: 12.5, color: 'var(--clay-ink)', marginTop: 2 }}>
        {sel.caseTypeName(c.caseType)} · for {c.dentistName}
      </div>
      <div className="row gap-8" style={{ marginTop: 12 }}>
        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => nav('/case/' + c.id)}>
          View
        </button>
        <button className="btn btn-sm" style={{ flex: 1.6, background: 'var(--clay)', borderColor: 'var(--clay)', color: '#fff' }}
          onClick={() => { dispatch({ type: 'DISPATCH', payload: { caseId: c.id, actor: me } }); toast('Dispatched to ' + c.dentistName); }}>
          <Icon name="truck" size={14} /> Mark dispatched
        </button>
      </div>
    </div>
  );
}

// ─── Warranty registry ──────────────────────────────────
function WarrantyScreen() {
  const { sel, dispatch } = useStore();
  const me = sel.user;
  const all = sel.allCases().filter(c => c.warranty)
    .sort((a, b) => (b.warranty.issuedAt || 0) - (a.warranty.issuedAt || 0));
  const [voidOpen, setVoidOpen] = React.useState(null);
  const [q, setQ] = React.useState('');

  const filtered = all.filter(c =>
    !q || (c.warranty.number + ' ' + c.patient + ' ' + c.dentistName).toLowerCase().includes(q.toLowerCase())
  );

  function doVoid(reason) {
    dispatch({ type: 'VOID_WARRANTY', payload: { caseId: voidOpen.id, actor: me, reason } });
    setVoidOpen(null);
    toast('Warranty voided');
  }

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Warranty registry</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>{all.length} issued</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        <div className="row gap-8" style={{
          height: 44, padding: '0 14px', background: 'var(--surface)',
          border: '1px solid var(--line)', borderRadius: 12, marginBottom: 12,
        }}>
          <Icon name="search" size={18} color="var(--muted)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by number, patient, or dentist…"
            style={{ flex: 1, height: '100%', border: 0, background: 'transparent', font: 'inherit', fontSize: 14, color: 'var(--ink)', outline: 'none' }} />
        </div>

        {filtered.length === 0 ? (
          <Empty icon="shield" title="No warranties issued" sub="Warranties are issued from dispatched cases." />
        ) : (
          <div className="col gap-10">
            {filtered.map(c => {
              const w = c.warranty;
              const voided = !!w.voidedAt;
              return (
                <div key={c.id} className="card" style={{
                  opacity: voided ? 0.75 : 1,
                }}>
                  <div className="row between" style={{ marginBottom: 8 }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{w.number}</span>
                    {voided
                      ? <Pill tone="danger" dot>VOID</Pill>
                      : <Pill tone="ok" dot>Active</Pill>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{c.patient}</div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                    {sel.caseTypeName(c.caseType)} · for {c.dentistName}
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                    Issued {formatDate(w.issuedAt)} · {w.months} months
                    {voided && <> · Voided {formatDate(w.voidedAt)} · {w.voidReason}</>}
                  </div>
                  <div className="row gap-8" style={{ marginTop: 10 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => nav('/case/' + c.id)}>View case</button>
                    <button className="btn btn-soft btn-sm" onClick={() => window.generateWarrantyCard(c, sel)}>
                      <Icon name="pdf" size={13} /> Download PDF
                    </button>
                    {!voided && (
                      <button className="btn btn-danger-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setVoidOpen(c)}>
                        Void
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {voidOpen && (
          <ReasonSheet
            title={'Void warranty ' + voidOpen.warranty.number}
            subtitle="This marks the warranty as VOID in the system and audit log."
            presets={['Case returned for rework', 'Dispute with dentist', 'Issued in error', 'Damage outside coverage']}
            submitLabel="Void warranty"
            destructive
            onClose={() => setVoidOpen(null)}
            onSubmit={doVoid}
          />
        )}
      </div>
    </Shell>
  );
}

Object.assign(window, { ReceptionActiveScreen, ReceptionIntakeScreen, ReceptionCreated, ReceptionDispatchScreen, WarrantyScreen, FormGroup, ReadyCard });
