// screens-case.jsx — universal case detail with role-aware actions + audit log

function CaseDetailScreen({ caseId }) {
  const { sel, dispatch } = useStore();
  const c = sel.caseById(caseId);
  const [tab, setTab] = React.useState('info');
  const [skipOpen, setSkipOpen] = React.useState(false);
  const [holdOpen, setHoldOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reassignOpen, setReassignOpen] = React.useState(false);
  const [reasonOpen, setReasonOpen] = React.useState(null); // { action: 'cancel' | 'hold' | 'skip' | 'trial-return', title, defaultReason }

  if (!c) return (
    <Shell title="Case" back={'/' + (sel.user.role === 'worker' ? 'scan' : 'board')}>
      <Empty icon="warning" title="Case not found" sub="It may have been deleted." />
    </Shell>
  );

  const me = sel.user;
  const stages = sel.stages;
  const u = sel.urgency(c.urgency);
  const d = dueRel(c);
  const myStage = me.role === 'worker' ? sel.stageById(me.stageId) : null;
  const myStageIdx = myStage ? stages.findIndex(s => s.id === myStage.id) : -1;
  const atMyStage = me.role === 'worker' && c.currentStageIdx === myStageIdx;
  const isLastStage = c.currentStageIdx === stages.length - 1;
  const isDispatched = c.status === 'dispatched';
  const isCancelled = c.status === 'cancelled';
  const isOnHold = c.status === 'on_hold';
  const isOnTrial = c.status === 'on_trial';
  const overdue = isOverdue(c);

  const statusPill = (() => {
    if (isDispatched) return { tone: 'ok', label: 'Dispatched', dot: false };
    if (isCancelled) return { tone: 'danger', label: 'Cancelled', dot: true };
    if (isOnHold)    return { tone: 'warn', label: 'On hold', dot: true };
    if (isOnTrial)   return { tone: 'info', label: 'On trial with dentist', dot: true };
    if (c.currentStageIdx < 0) return { tone: 'clay', label: 'Received', dot: true };
    if (c.currentStageIdx >= stages.length) return { tone: 'ok', label: 'Done — awaiting dispatch', dot: true };
    return { tone: 'clay', label: 'At ' + stages[c.currentStageIdx].name, dot: true };
  })();

  function complete() {
    const stage = stages[c.currentStageIdx];
    if (!stage) return;
    dispatch({ type: 'COMPLETE_STAGE', payload: { caseId: c.id, actor: me, stageId: stage.id } });
    toast(`${stage.name} marked complete · ${c.id}`);
    setTimeout(() => nav(me.role === 'worker' ? '/scan' : '/board'), 500);
  }

  function skip(reason) {
    const stage = stages[c.currentStageIdx];
    if (!stage) return;
    dispatch({ type: 'SKIP_STAGE', payload: { caseId: c.id, actor: me, stageId: stage.id, reason } });
    toast(`Skipped ${stage.name}`);
    setSkipOpen(false);
    setTimeout(() => nav('/scan'), 400);
  }

  function setHold(reason) {
    dispatch({ type: 'SET_STATUS', payload: { caseId: c.id, actor: me, status: 'on_hold', reason } });
    toast('Case placed on hold');
    setHoldOpen(false);
  }
  function resume() {
    dispatch({ type: 'SET_STATUS', payload: { caseId: c.id, actor: me, status: 'active' } });
    toast('Case resumed');
  }
  function doCancel(reason) {
    dispatch({ type: 'SET_STATUS', payload: { caseId: c.id, actor: me, status: 'cancelled', reason } });
    toast('Case cancelled');
    setCancelOpen(false);
  }
  function reassign(stageIdx, reason) {
    dispatch({ type: 'REASSIGN_STAGE', payload: { caseId: c.id, actor: me, stageIdx, reason } });
    toast('Reassigned to ' + stages[stageIdx].name);
    setReassignOpen(false);
  }
  function trialSend() {
    dispatch({ type: 'SEND_TO_TRIAL', payload: { caseId: c.id, actor: me } });
    toast('Marked sent for trial');
  }
  function trialReturn() {
    dispatch({ type: 'RETURN_FROM_TRIAL', payload: { caseId: c.id, actor: me, reason: 'returned from dentist trial' } });
    toast('Returned from trial');
  }
  function dispatchCase() {
    dispatch({ type: 'DISPATCH', payload: { caseId: c.id, actor: me } });
    toast('Dispatched to ' + c.dentistName);
  }
  function printLabel() {
    window.generateBarcodeLabel(c, sel);
  }
  function issueWarranty() {
    dispatch({ type: 'ISSUE_WARRANTY', payload: { caseId: c.id, actor: me } });
    toast('Warranty issued');
  }
  function voidWarranty(reason) {
    dispatch({ type: 'VOID_WARRANTY', payload: { caseId: c.id, actor: me, reason } });
    toast('Warranty voided');
  }

  const audit = sel.auditForCase(c.id);

  return (
    <Shell title={c.id} back={backFor(me)}>
      <div className="pg" style={{ paddingTop: 14, paddingBottom: 120 }}>

        {/* Hero header */}
        <div className="row between" style={{ marginBottom: 6 }}>
          <span className="case-id muted" style={{ fontSize: 12 }}>{c.id}</span>
          {u && <span className={'urg urg-' + u.tone}><span className="dot" />{u.name}</span>}
        </div>
        <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{c.patient}</div>
        <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
          {sel.caseTypeName(c.caseType)} · {c.units} unit{c.units > 1 ? 's' : ''}
        </div>

        {/* Status + stage progress */}
        <div style={{ marginTop: 16 }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <Pill tone={statusPill.tone} dot={statusPill.dot}>{statusPill.label}</Pill>
            {d && !isDispatched && !isCancelled && (
              <span className="row gap-4" style={{
                fontSize: 12.5, fontWeight: 600,
                color: d.overdue ? 'var(--danger)' : d.soon ? 'var(--warn-ink)' : 'var(--muted)',
              }}>
                {d.overdue && <Icon name="flame" size={13} color="var(--danger)" />}
                {!d.overdue && d.soon && <Icon name="clock" size={13} />}
                {d.label}
              </span>
            )}
          </div>
          <StageStrip stages={stages} currentIdx={c.currentStageIdx} />
          <div className="row between" style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {stages.map(s => <span key={s.id} style={{ fontWeight: 500 }}>{s.short}</span>)}
          </div>
        </div>

        {/* Tabs */}
        <div className="row between" style={{ marginTop: 22, marginBottom: 12, alignItems: 'baseline' }}>
          <div className="seg">
            <button className={tab === 'info' ? 'on' : ''} onClick={() => setTab('info')}>Details</button>
            <button className={tab === 'audit' ? 'on' : ''} onClick={() => setTab('audit')}>
              Activity · {audit.length}
            </button>
          </div>
          {me.role === 'receptionist' && (
            <button className="btn btn-xs btn-soft" onClick={printLabel}>
              <Icon name="print" size={13} /> Label
            </button>
          )}
        </div>

        {tab === 'info' && (
          <>
            {/* Dentist */}
            <div className="card-flat row gap-12">
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--surface)', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--line)',
              }}>
                <Icon name="building" size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.dentistName}</div>
                <div className="muted" style={{ fontSize: 12.5 }} className="truncate">{c.dentistClinic}</div>
              </div>
            </div>

            {/* Instructions */}
            {c.instructions && (
              <div className="card" style={{ marginTop: 12 }}>
                <div className="t-eyebrow" style={{ marginBottom: 6 }}>Special instructions</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{c.instructions}</div>
              </div>
            )}

            {/* Key facts */}
            <div className="card" style={{ marginTop: 12, padding: 0 }}>
              <KV k="Due" v={c.dueDate ? formatDate(c.dueDate) : '—'} />
              <KV k="Received" v={formatDate(c.createdAt)} />
              <KV k="Last updated" v={relTime(c.updatedAt)} />
              {isDispatched && <KV k="Dispatched" v={formatDate(c.dispatchedAt)} />}
              {c.cancelReason && <KV k="Cancel reason" v={c.cancelReason} />}
              {c.warranty && <KV k="Warranty" v={<>
                <span className="mono">{c.warranty.number}</span>
                {c.warranty.voidedAt ? <span style={{ color: 'var(--danger)', marginLeft: 6, fontWeight: 600 }}>VOID</span> : null}
              </>} />}
            </div>

            {/* Stage progress detail */}
            <div style={{ marginTop: 16 }}>
              <div className="t-eyebrow" style={{ marginBottom: 10 }}>Workflow · {stages.length} stages</div>
              <div className="card" style={{ padding: 0 }}>
                {stages.map((s, i) => {
                  const sp = c.stageProgress.find(p => p.stageId === s.id);
                  const state = i < c.currentStageIdx ? 'done' : i === c.currentStageIdx ? 'curr' : 'todo';
                  const worker = sp ? sel.workerById(sp.completedBy) : null;
                  return (
                    <div key={s.id} className="row gap-12" style={{
                      padding: '12px 14px',
                      borderBottom: i < stages.length - 1 ? '1px solid var(--line)' : '0',
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: '1.5px solid ' + (state === 'todo' ? 'var(--line-2)' : state === 'curr' ? 'var(--clay)' : 'var(--ink)'),
                        background: state === 'done' ? 'var(--ink)' : state === 'curr' ? 'var(--clay)' : 'transparent',
                        color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {state === 'done' && <Icon name="check" size={13} color="#fff" strokeWidth={2.5} />}
                        {state === 'curr' && <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: state === 'todo' ? 400 : 500, fontSize: 14.5, color: state === 'todo' ? 'var(--muted)' : 'var(--ink)' }}>
                          {s.name}
                        </div>
                        {sp && worker && (
                          <div className="muted" style={{ fontSize: 11.5 }}>by {worker.name} · {relTime(sp.completedAt)}</div>
                        )}
                        {state === 'curr' && !isOnHold && !isCancelled && !isOnTrial && (
                          <div className="t-xs" style={{ color: 'var(--clay-ink)' }}>Current</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === 'audit' && (
          <div className="card" style={{ padding: '4px 14px' }}>
            {audit.length === 0 ? (
              <Empty icon="history" title="No activity yet" sub="" />
            ) : audit.map(a => <AuditRow key={a.id} a={a} sel={sel} />)}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      {!isCancelled && (
        <ActionBar
          c={c}
          me={me}
          stages={stages}
          atMyStage={atMyStage}
          isOnHold={isOnHold}
          isOnTrial={isOnTrial}
          isDispatched={isDispatched}
          isLastStage={isLastStage}
          onComplete={complete}
          onSkip={() => setSkipOpen(true)}
          onHold={() => setHoldOpen(true)}
          onResume={resume}
          onCancel={() => setCancelOpen(true)}
          onReassign={() => setReassignOpen(true)}
          onTrialSend={trialSend}
          onTrialReturn={trialReturn}
          onDispatch={dispatchCase}
          onPrint={printLabel}
          onIssueWarranty={issueWarranty}
        />
      )}

      {skipOpen && (
        <ReasonSheet
          title={`Skip ${stages[c.currentStageIdx]?.name} stage`}
          subtitle="Pick a reason. Will be logged in the audit trail."
          presets={['Not needed for this case type', 'Sent directly to trial', 'Material change', 'Owner instruction']}
          submitLabel="Skip stage"
          onClose={() => setSkipOpen(false)}
          onSubmit={skip}
        />
      )}
      {holdOpen && (
        <ReasonSheet
          title="Place on hold"
          subtitle="Pause this case. Work won't proceed until resumed."
          presets={['Awaiting clarification from dentist', 'Material out of stock', 'Patient travelling', 'Re-impression needed']}
          submitLabel="Place on hold"
          onClose={() => setHoldOpen(false)}
          onSubmit={setHold}
        />
      )}
      {cancelOpen && (
        <ReasonSheet
          title="Cancel case"
          subtitle="This stops work and notifies reception."
          presets={['Dentist withdrew', 'Patient cancelled', 'Impossible to fabricate', 'Duplicate case']}
          submitLabel="Cancel case"
          destructive
          onClose={() => setCancelOpen(false)}
          onSubmit={doCancel}
        />
      )}
      {reassignOpen && (
        <ReassignSheet
          stages={stages}
          currentIdx={c.currentStageIdx}
          onClose={() => setReassignOpen(false)}
          onSubmit={reassign}
        />
      )}
    </Shell>
  );
}

function backFor(me) {
  if (me.role === 'worker') return '/scan';
  if (me.role === 'receptionist') return '/active';
  if (me.role === 'owner') return '/board';
  return '/';
}

function KV({ k, v }) {
  return (
    <div className="row between" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
      <span className="muted" style={{ fontSize: 12.5 }}>{k}</span>
      <span style={{ fontSize: 13.5, fontWeight: 500, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

function ActionBar({ c, me, stages, atMyStage, isOnHold, isOnTrial, isDispatched, isLastStage, onComplete, onSkip, onHold, onResume, onCancel, onReassign, onTrialSend, onTrialReturn, onDispatch, onPrint, onIssueWarranty }) {
  const role = me.role;
  const allDone = c.currentStageIdx >= stages.length;

  return (
    <div style={{
      position: 'fixed', bottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px))',
      left: 0, right: 0, zIndex: 35,
      padding: '10px 16px',
      background: 'rgba(243, 239, 232, 0.93)',
      backdropFilter: 'blur(20px) saturate(160%)',
      borderTop: '1px solid var(--line)',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 8 }}>
        {/* Worker: at my stage → big complete button */}
        {role === 'worker' && atMyStage && !isOnHold && !isOnTrial && (
          <>
            <button className="btn btn-ghost btn-icon" onClick={onSkip} title="Skip stage" style={{ width: 44, height: 44 }}>
              <Icon name="skip-forward" size={18} />
            </button>
            <button className="btn btn-clay btn-lg" style={{ flex: 1 }} onClick={onComplete}>
              <Icon name="check" size={18} /> Mark {stages[c.currentStageIdx]?.name} complete
            </button>
          </>
        )}
        {/* Worker: not at my stage */}
        {role === 'worker' && !atMyStage && !isOnHold && (
          <div className="row gap-8" style={{ width: '100%', justifyContent: 'center', padding: '10px 0', color: 'var(--muted)', fontSize: 13 }}>
            <Icon name="warning" size={15} color="var(--warn)" />
            <span>This case is at <strong style={{ color: 'var(--ink)' }}>{c.currentStageIdx >= 0 ? stages[c.currentStageIdx]?.name : 'reception'}</strong> — not your stage</span>
          </div>
        )}
        {/* Owner controls */}
        {role === 'owner' && !isDispatched && (
          <>
            {!isOnHold && !isOnTrial && (
              <button className="btn btn-ghost btn-sm" onClick={onReassign}>
                <Icon name="workflow" size={14} /> Move
              </button>
            )}
            {!isOnHold && <button className="btn btn-ghost btn-sm" onClick={onHold}><Icon name="pause" size={14} /> Hold</button>}
            {isOnHold && <button className="btn btn-soft btn-sm" onClick={onResume}><Icon name="check" size={14} /> Resume</button>}
            <button className="btn btn-danger-ghost btn-sm" onClick={onCancel}>Cancel</button>
            <div style={{ flex: 1 }} />
          </>
        )}
        {/* Reception controls */}
        {role === 'receptionist' && (
          <>
            {allDone && !isDispatched && (
              <button className="btn btn-clay" style={{ flex: 1 }} onClick={onDispatch}>
                <Icon name="truck" size={16} /> Mark dispatched
              </button>
            )}
            {isDispatched && !c.warranty && (
              <button className="btn btn-clay" style={{ flex: 1 }} onClick={onIssueWarranty}>
                <Icon name="shield" size={16} /> Issue warranty
              </button>
            )}
            {!isDispatched && !allDone && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={onPrint}>
                  <Icon name="print" size={14} /> Reprint label
                </button>
                {!isOnTrial
                  ? <button className="btn btn-ghost btn-sm" onClick={onTrialSend}>Send for trial</button>
                  : <button className="btn btn-soft btn-sm" onClick={onTrialReturn}>Return from trial</button>
                }
              </>
            )}
            {isDispatched && c.warranty && !c.warranty.voidedAt && (
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => window.generateWarrantyCard(c, window.__sel_singleton)}>
                <Icon name="pdf" size={14} /> Warranty PDF
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Reason sheet (skip / hold / cancel) ────────────────
function ReasonSheet({ title, subtitle, presets, submitLabel, destructive, onClose, onSubmit }) {
  const [picked, setPicked] = React.useState(presets[0]);
  const [custom, setCustom] = React.useState('');
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--line-2)', margin: '0 auto 16px' }} />
        <div className="t-eyebrow">{title}</div>
        {subtitle && <div className="muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 14 }}>{subtitle}</div>}

        <div className="col gap-6" style={{ marginBottom: 12 }}>
          {presets.map(p => (
            <button key={p} className="row gap-10 row-tap" onClick={() => setPicked(p)} style={{
              border: 0, textAlign: 'left',
              padding: 12, borderRadius: 12,
              background: picked === p ? 'var(--surface)' : 'var(--surface-2)',
              boxShadow: picked === p ? 'inset 0 0 0 1.5px var(--ink)' : 'none',
              font: 'inherit', fontSize: 14, color: 'var(--ink)',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '1.5px solid ' + (picked === p ? 'var(--ink)' : 'var(--line-2)'),
                background: picked === p ? 'var(--ink)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {picked === p && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span>{p}</span>
            </button>
          ))}
        </div>

        <label className="field-label">Other (optional)</label>
        <textarea className="field" rows={2} value={custom} onChange={e => setCustom(e.target.value)}
          placeholder="Add a more specific note…" />

        <div className="row gap-8" style={{ marginTop: 14 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Back</button>
          <button
            className={destructive ? 'btn btn-danger-ghost' : 'btn btn-clay'}
            style={{ flex: 1.4, background: destructive ? 'var(--danger)' : undefined, color: destructive ? '#fff' : undefined, borderColor: destructive ? 'var(--danger)' : undefined }}
            onClick={() => onSubmit(custom.trim() || picked)}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReassignSheet({ stages, currentIdx, onClose, onSubmit }) {
  const [idx, setIdx] = React.useState(currentIdx);
  const [reason, setReason] = React.useState('Owner reassignment');
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--line-2)', margin: '0 auto 16px' }} />
        <div className="t-eyebrow">Move case to stage</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 14 }}>
          Reception will be notified to physically move the case to that stage area.
        </div>

        <div className="col gap-6" style={{ marginBottom: 12 }}>
          {stages.map((s, i) => (
            <button key={s.id} className="row gap-10 row-tap" onClick={() => setIdx(i)} style={{
              border: 0, textAlign: 'left',
              padding: 12, borderRadius: 12,
              background: idx === i ? 'var(--surface)' : 'var(--surface-2)',
              boxShadow: idx === i ? 'inset 0 0 0 1.5px var(--ink)' : 'none',
              font: 'inherit', fontSize: 14, color: 'var(--ink)',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: 'var(--bg-2)', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 11,
              }}>{s.short}</div>
              <span style={{ flex: 1 }}>{s.name}</span>
              {i === currentIdx && <span className="t-xs muted">current</span>}
            </button>
          ))}
        </div>

        <label className="field-label">Reason (audited)</label>
        <input className="field" value={reason} onChange={e => setReason(e.target.value)} />

        <div className="row gap-8" style={{ marginTop: 14 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Back</button>
          <button className="btn btn-clay" style={{ flex: 1.4 }} onClick={() => onSubmit(idx, reason.trim() || 'Owner reassignment')} disabled={idx === currentIdx}>
            Move case
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Audit row ───────────────────────────────────────────
function AuditRow({ a, sel }) {
  const date = new Date(a.at);
  const stamp = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
                date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const verb = ACTION_VERBS[a.action] || a.action;
  return (
    <div className="audit-row">
      <div className="ts">{stamp}</div>
      <div className="body">
        <div><span className="actor">{a.actorName}</span> <span className="what">{verb}</span></div>
        <AuditMeta action={a.action} meta={a.meta} />
      </div>
    </div>
  );
}

const ACTION_VERBS = {
  received: 'received the case from the dentist',
  stage_complete: 'completed a stage',
  skipped: 'skipped a stage',
  reassigned: 'reassigned the case',
  cancelled: 'cancelled the case',
  on_hold: 'placed the case on hold',
  active: 'resumed the case',
  trial_sent: 'sent the case for trial',
  trial_returned: 'returned the case from trial',
  dispatched: 'dispatched the case to the dentist',
  warranty_issued: 'issued a warranty',
  warranty_voided: 'voided the warranty',
};

function AuditMeta({ action, meta }) {
  if (!meta) return null;
  if (action === 'stage_complete') return <div className="meta">{meta.stageName}</div>;
  if (action === 'skipped' && meta.stageName) return <div className="meta">{meta.stageName} · {meta.reason}</div>;
  if (action === 'reassigned' && meta.toStage) return <div className="meta">moved to {meta.toStage}{meta.reason ? ' · ' + meta.reason : ''}</div>;
  if (action === 'cancelled' && meta.reason) return <div className="meta">{meta.reason}</div>;
  if (action === 'on_hold' && meta.reason) return <div className="meta">{meta.reason}</div>;
  if (action === 'received' && meta.from) return <div className="meta">from {meta.from} · {meta.units} unit{meta.units > 1 ? 's' : ''} · {meta.urgency}</div>;
  if (action === 'warranty_issued' && meta.number) return <div className="meta"><span className="mono">{meta.number}</span> · {meta.months} months</div>;
  if (action === 'warranty_voided' && meta.reason) return <div className="meta"><span className="mono">{meta.number}</span> · {meta.reason}</div>;
  return null;
}

// ─── Toast ───────────────────────────────────────────────
const toastListeners = new Set();
function toast(text) {
  toastListeners.forEach(fn => fn(text));
}
function ToastHost() {
  const [msg, setMsg] = React.useState(null);
  React.useEffect(() => {
    const fn = (t) => {
      setMsg(t);
      clearTimeout(window.__toastT);
      window.__toastT = setTimeout(() => setMsg(null), 2400);
    };
    toastListeners.add(fn);
    return () => toastListeners.delete(fn);
  }, []);
  if (!msg) return null;
  return <div className="toast"><Icon name="check" size={16} color="#fff" /> {msg}</div>;
}

Object.assign(window, { CaseDetailScreen, ActionBar, ReasonSheet, ReassignSheet, AuditRow, toast, ToastHost });
