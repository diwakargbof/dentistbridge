// screens-admin.jsx — admin: stages, case types, users, lab settings
// screens-notifs.jsx — notifications inbox (used by reception/owner)

function AdminStagesScreen() {
  const { sel, dispatch } = useStore();
  const [stages, setStages] = React.useState(sel.stages);
  const dirty = JSON.stringify(stages) !== JSON.stringify(sel.stages);

  React.useEffect(() => { setStages(sel.stages); }, [sel.labConfig]);

  function update(i, k, v) {
    const next = stages.slice();
    next[i] = { ...next[i], [k]: v };
    setStages(next);
  }
  function move(i, dir) {
    const next = stages.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setStages(next);
  }
  function remove(i) {
    if (stages.length <= 2) return;
    if (!confirm(`Remove the "${stages[i].name}" stage? Active cases at this stage will not move automatically.`)) return;
    setStages(stages.filter((_, j) => j !== i));
  }
  function add() {
    const id = 'st-' + Date.now().toString(36);
    setStages([...stages, { id, name: 'New stage', short: 'X', desc: '' }]);
  }
  function save() {
    dispatch({ type: 'UPDATE_LAB_CONFIG', payload: { ...sel.labConfig, stages } });
    toast('Stages saved');
  }

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Admin · workflow</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Stages</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8, paddingBottom: 100 }}>
        <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Each case flows through these stages in order. Workers are assigned to specific stages in <span className="mono">config.jsx</span>.
        </div>

        <div className="col gap-10">
          {stages.map((s, i) => (
            <div key={s.id} className="card">
              <div className="row gap-10" style={{ marginBottom: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'var(--bg-2)', color: 'var(--ink-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: 12,
                }}>{i + 1}</div>
                <div className="col gap-6" style={{ flex: 1 }}>
                  <input className="field" style={{ height: 38 }} value={s.name} onChange={e => update(i, 'name', e.target.value)} />
                </div>
                <input className="field" style={{ height: 38, width: 60, textAlign: 'center', fontWeight: 600 }} value={s.short} maxLength={2} onChange={e => update(i, 'short', e.target.value.toUpperCase())} />
                <div className="row gap-2">
                  <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => move(i, -1)} disabled={i === 0}>
                    <Icon name="chev-u" size={14} />
                  </button>
                  <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => move(i, +1)} disabled={i === stages.length - 1}>
                    <Icon name="chev-d" size={14} />
                  </button>
                  <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => remove(i)} disabled={stages.length <= 2}>
                    <Icon name="x" size={14} />
                  </button>
                </div>
              </div>
              <input className="field" style={{ height: 36, fontSize: 13 }} value={s.desc || ''}
                onChange={e => update(i, 'desc', e.target.value)} placeholder="Short description (optional)" />
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={add}>
          <Icon name="plus" size={16} /> Add stage
        </button>
      </div>

      <SaveBar dirty={dirty} onReset={() => setStages(sel.stages)} onSave={save} />
    </Shell>
  );
}

function AdminTypesScreen() {
  const { sel, dispatch } = useStore();
  const [types, setTypes] = React.useState(sel.caseTypes);
  const dirty = JSON.stringify(types) !== JSON.stringify(sel.caseTypes);
  React.useEffect(() => { setTypes(sel.caseTypes); }, [sel.labConfig]);

  function update(i, name) {
    const next = types.slice();
    next[i] = { ...next[i], name };
    setTypes(next);
  }
  function remove(i) {
    if (!confirm(`Remove "${types[i].name}"? Existing cases keep this type.`)) return;
    setTypes(types.filter((_, j) => j !== i));
  }
  function add() {
    const id = 'ct-' + Date.now().toString(36);
    setTypes([...types, { id, name: 'New case type' }]);
  }
  function save() {
    dispatch({ type: 'UPDATE_LAB_CONFIG', payload: { ...sel.labConfig, caseTypes: types } });
    toast('Case types saved');
  }

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Admin</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Case types</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8, paddingBottom: 100 }}>
        <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Types receptionist can choose when creating a case.
        </div>

        <div className="card" style={{ padding: 0 }}>
          {types.map((t, i) => (
            <div key={t.id} className="row gap-10" style={{
              padding: '12px 14px',
              borderBottom: i < types.length - 1 ? '1px solid var(--line)' : '0',
            }}>
              <span className="mono muted" style={{ fontSize: 11, width: 28 }}>{String(i + 1).padStart(2, '0')}</span>
              <input className="field" style={{ height: 38, flex: 1 }} value={t.name} onChange={e => update(i, e.target.value)} />
              <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => remove(i)}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={add}>
          <Icon name="plus" size={16} /> Add type
        </button>
      </div>

      <SaveBar dirty={dirty} onReset={() => setTypes(sel.caseTypes)} onSave={save} />
    </Shell>
  );
}

function AdminUsersScreen() {
  const { sel } = useStore();
  const users = Object.entries(window.BENCH_CONFIG.ALLOWED_USERS).map(([phone, u]) => ({ phone, ...u }));
  const byRole = {
    receptionist: users.filter(u => u.role === 'receptionist'),
    worker: users.filter(u => u.role === 'worker'),
    owner: users.filter(u => u.role === 'owner'),
    admin: users.filter(u => u.role === 'admin'),
  };

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Admin · access list</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Users · {users.length}</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        <div className="card-flat" style={{ padding: 14, marginBottom: 16, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          <div className="row gap-6" style={{ marginBottom: 4, color: 'var(--clay-ink)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Icon name="sparkle" size={12} color="var(--clay)" />
            <span>How user access works</span>
          </div>
          Users are configured in <span className="mono">config.jsx</span>. Add a phone number and role there to grant access. We're showing the current list below; in-app editing isn't wired up yet.
        </div>

        {Object.entries(byRole).map(([role, list]) => (
          <div key={role} style={{ marginBottom: 16 }}>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>
              {role[0].toUpperCase() + role.slice(1)} · {list.length}
            </div>
            <div className="card" style={{ padding: 0 }}>
              {list.map((u, i) => {
                const stage = u.stageId ? sel.stageById(u.stageId) : null;
                return (
                  <div key={u.phone} className="row gap-12" style={{
                    padding: '12px 14px',
                    borderBottom: i < list.length - 1 ? '1px solid var(--line)' : '0',
                  }}>
                    <Avatar name={u.name} size={32} tone={toneFor(u)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        <span className="mono">{u.phone}</span>
                        {stage && <> · {stage.name}</>}
                      </div>
                    </div>
                    <Pill>{role}</Pill>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function AdminLabScreen() {
  const { sel, dispatch } = useStore();
  const [form, setForm] = React.useState({
    labName: sel.labConfig.labName,
    labCity: sel.labConfig.labCity,
    labPhone: sel.labConfig.labPhone,
    warrantyMonths: sel.labConfig.warrantyMonths,
  });
  const dirty = form.labName !== sel.labConfig.labName ||
                form.labCity !== sel.labConfig.labCity ||
                form.labPhone !== sel.labConfig.labPhone ||
                form.warrantyMonths !== sel.labConfig.warrantyMonths;

  function save() {
    dispatch({ type: 'UPDATE_LAB_CONFIG', payload: {
      ...sel.labConfig,
      labName: form.labName.trim() || sel.labConfig.labName,
      labCity: form.labCity.trim(),
      labPhone: form.labPhone.trim(),
      warrantyMonths: parseInt(form.warrantyMonths, 10) || sel.labConfig.warrantyMonths,
    }});
    toast('Lab profile saved');
  }

  function exportCSV() {
    const cases = sel.allCases();
    const lines = ['id,patient,case_type,dentist,clinic,urgency,units,due,status,stage,created'];
    cases.forEach(c => {
      const stages = sel.stages;
      const stage = c.currentStageIdx < 0 ? 'received' : c.currentStageIdx >= stages.length ? 'done' : stages[c.currentStageIdx]?.name;
      lines.push([
        c.id,
        `"${c.patient}"`,
        `"${sel.caseTypeName(c.caseType)}"`,
        `"${c.dentistName}"`,
        `"${c.dentistClinic}"`,
        c.urgency,
        c.units,
        new Date(c.dueDate).toISOString(),
        c.status,
        `"${stage}"`,
        new Date(c.createdAt).toISOString(),
      ].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bench-cases-${dateId(new Date())}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Shell title={false}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Admin</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Lab profile</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8, paddingBottom: 100 }}>
        <div className="card">
          <div className="col gap-14">
            <FormGroup label="Lab name">
              <input className="field" value={form.labName} onChange={e => setForm({ ...form, labName: e.target.value })} />
            </FormGroup>
            <div className="row gap-10">
              <FormGroup label="City" style={{ flex: 2 }}>
                <input className="field" value={form.labCity} onChange={e => setForm({ ...form, labCity: e.target.value })} />
              </FormGroup>
              <FormGroup label="Phone" style={{ flex: 2 }}>
                <input className="field" value={form.labPhone} onChange={e => setForm({ ...form, labPhone: e.target.value })} />
              </FormGroup>
            </div>
            <FormGroup label="Default warranty (months)">
              <input className="field" type="number" min="1" max="60"
                value={form.warrantyMonths} onChange={e => setForm({ ...form, warrantyMonths: e.target.value })} />
            </FormGroup>
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Data</div>
          <button className="btn btn-ghost btn-block" onClick={exportCSV}>
            <Icon name="pdf" size={16} /> Export all cases as CSV
          </button>
        </div>
      </div>

      <SaveBar dirty={dirty} onReset={() => setForm({
        labName: sel.labConfig.labName,
        labCity: sel.labConfig.labCity,
        labPhone: sel.labConfig.labPhone,
        warrantyMonths: sel.labConfig.warrantyMonths,
      })} onSave={save} />
    </Shell>
  );
}

function SaveBar({ dirty, onReset, onSave }) {
  if (!dirty) return null;
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
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onReset}>Discard</button>
        <button className="btn btn-clay" style={{ flex: 1.4 }} onClick={onSave}>Save changes</button>
      </div>
    </div>
  );
}

// ─── Notifications inbox ────────────────────────────────
function NotificationsScreen() {
  const { sel, dispatch } = useStore();
  const me = sel.user;
  const notifs = sel.notifsFor(me);

  React.useEffect(() => {
    return () => {
      dispatch({ type: 'MARK_NOTIFS_READ', payload: { forRole: me.role, forStage: me.stageId } });
    };
    // eslint-disable-next-line
  }, []);

  return (
    <Shell title={false} back={landingFor(me)}>
      <header className="topbar large">
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">Notifications</div>
          <div className="title" style={{ fontSize: 24, marginTop: 4 }}>Inbox · {notifs.length}</div>
        </div>
      </header>

      <div className="pg" style={{ paddingTop: 8 }}>
        {notifs.length === 0 ? (
          <Empty icon="bell" title="No notifications yet" sub="You'll see stage completions and case events here." />
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {notifs.map((n, i) => (
              <Link key={n.id} to={n.caseId ? '/case/' + n.caseId : '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="row gap-12 row-tap" style={{
                  padding: '14px 14px',
                  borderBottom: i < notifs.length - 1 ? '1px solid var(--line)' : '0',
                  background: !n.read ? 'rgba(180,114,74,0.04)' : undefined,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'var(--clay-soft)', color: 'var(--clay-ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon name="bell" size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: !n.read ? 600 : 500 }}>{n.text}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>{relTime(n.at)}</div>
                  </div>
                  <Icon name="chev-r" size={16} color="var(--muted)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

Object.assign(window, { AdminStagesScreen, AdminTypesScreen, AdminUsersScreen, AdminLabScreen, SaveBar, NotificationsScreen });
