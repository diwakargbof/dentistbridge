// store.jsx — Bench reactive store with Supabase cloud sync
// Local state managed by a reducer; every mutation also syncs to
// Supabase via the Express API. Supabase Realtime pushes changes
// from other sessions back to this client.

const STORAGE_KEY = 'bench.v1';
const AUTH_KEY    = 'bench.auth';

// ─── Helpers ─────────────────────────────────────────────────────────
function dateId(d) {
  return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
}
function newCaseId(when = new Date()) {
  return `DL-${dateId(when)}-${1000 + Math.floor(Math.random() * 8999)}`;
}

// ─── Seed data ────────────────────────────────────────────────────────
function makeSeed() {
  const cfg = window.BENCH_CONFIG.LAB_CONFIG_DEFAULTS;
  const stageIds = cfg.stages.map(s => s.id);
  const now = Date.now();
  const day = 86400000;

  const seeds = [
    { dy: 6,   stage: 0,  ct: 'ct-crown',   pt: 'Riya Shah',      dn: 'Dr. Anaya Rao',   dc: 'Rao Family Dental',   u: 'normal',    units: 1, due: now + 5*day,    ins: 'Margin sub-gingival on the distal.' },
    { dy: 5,   stage: 0,  ct: 'ct-bridge',  pt: 'Mohan Verma',    dn: 'Dr. Karan Mehta', dc: 'Mehta Smile Studio',  u: 'district',  units: 3, due: now + 2*day,    ins: '3-unit bridge #11-13.' },
    { dy: 5,   stage: 1,  ct: 'ct-crown',   pt: 'Aisha Khan',     dn: 'Dr. Anaya Rao',   dc: 'Rao Family Dental',   u: 'emergency', units: 1, due: now + 0.5*day,  ins: 'Urgent — patient travels Friday.' },
    { dy: 4,   stage: 1,  ct: 'ct-veneer',  pt: 'Sneha Kapoor',   dn: 'Dr. Meera Singh', dc: 'Singh Dental Clinic', u: 'normal',    units: 2, due: now + 4*day,    ins: 'Hand-layered, A1 shade.' },
    { dy: 4,   stage: 2,  ct: 'ct-crown',   pt: 'Karan Bhatia',   dn: 'Dr. Anaya Rao',   dc: 'Rao Family Dental',   u: 'normal',    units: 1, due: now + 3*day,    ins: '' },
    { dy: 4,   stage: 2,  ct: 'ct-inlay',   pt: 'Maya Iyer',      dn: 'Dr. Karan Mehta', dc: 'Mehta Smile Studio',  u: 'district',  units: 1, due: now + 1*day,    ins: 'E.max, B2 shade.' },
    { dy: 3,   stage: 3,  ct: 'ct-crown',   pt: 'Imran Sayed',    dn: 'Dr. Meera Singh', dc: 'Singh Dental Clinic', u: 'normal',    units: 1, due: now + 2*day,    ins: '' },
    { dy: 3,   stage: 3,  ct: 'ct-bridge',  pt: 'Reema Pillai',   dn: 'Dr. Anaya Rao',   dc: 'Rao Family Dental',   u: 'district',  units: 4, due: now + 1*day,    ins: '4-unit zirconia bridge.' },
    { dy: 2,   stage: 4,  ct: 'ct-crown',   pt: 'Arjun Nair',     dn: 'Dr. Karan Mehta', dc: 'Mehta Smile Studio',  u: 'normal',    units: 2, due: now + 1*day,    ins: 'QC for shade match.' },
    { dy: 1,   stage: 4,  ct: 'ct-veneer',  pt: 'Priya Joshi',    dn: 'Dr. Anaya Rao',   dc: 'Rao Family Dental',   u: 'emergency', units: 2, due: now - 0.2*day,  ins: 'OVERDUE — confirm with dentist.' },
    { dy: 0.2, stage: -1, ct: 'ct-crown',   pt: 'Yash Patel',     dn: 'Dr. Meera Singh', dc: 'Singh Dental Clinic', u: 'normal',    units: 1, due: now + 6*day,    ins: '' },
    { dy: 0.1, stage: -1, ct: 'ct-night',   pt: 'Tara Wadia',     dn: 'Dr. Karan Mehta', dc: 'Mehta Smile Studio',  u: 'normal',    units: 1, due: now + 7*day,    ins: 'Heavy bruxer.' },
    { dy: 7,   stage: 5,  ct: 'ct-crown',   pt: 'Dev Saxena',     dn: 'Dr. Anaya Rao',   dc: 'Rao Family Dental',   u: 'normal',    units: 1, due: now - 1*day,    ins: '', dispatched: true },
    { dy: 8,   stage: 5,  ct: 'ct-bridge',  pt: 'Aditi Sharma',   dn: 'Dr. Karan Mehta', dc: 'Mehta Smile Studio',  u: 'normal',    units: 3, due: now - 2*day,    ins: '', dispatched: true, warranty: true },
    { dy: 10,  stage: 5,  ct: 'ct-veneer',  pt: 'Ravi Krishnan',  dn: 'Dr. Meera Singh', dc: 'Singh Dental Clinic', u: 'normal',    units: 4, due: now - 4*day,    ins: '', dispatched: true, warranty: true },
    { dy: 5,   stage: 4,  ct: 'ct-denture', pt: 'Sushila Bhatt',  dn: 'Dr. Anaya Rao',   dc: 'Rao Family Dental',   u: 'normal',    units: 1, due: now + 8*day,    ins: 'Trial sent for verification.', status: 'on_trial' },
    { dy: 4,   stage: 1,  ct: 'ct-crown',   pt: 'Manoj Rai',      dn: 'Dr. Karan Mehta', dc: 'Mehta Smile Studio',  u: 'normal',    units: 1, due: now + 10*day,   ins: 'Awaiting clarification.', status: 'on_hold' },
    { dy: 6,   stage: 0,  ct: 'ct-crown',   pt: 'Naina Sethi',    dn: 'Dr. Anaya Rao',   dc: 'Rao Family Dental',   u: 'district',  units: 1, due: now + 3*day,    ins: '', status: 'cancelled', cancelReason: 'Dentist withdrew' },
  ];

  const cases = {};
  const audit = [];
  let counter = 4801;

  seeds.forEach((s, idx) => {
    const createdAt = now - s.dy * day;
    const id = `DL-${dateId(new Date(createdAt))}-${String(counter++).padStart(4, '0')}`;
    const stageProgress = [];
    const lastStageDone = Math.min(s.stage, stageIds.length - 1);
    for (let i = 0; i < lastStageDone; i++) {
      const t = createdAt + (i + 1) * 0.5 * day;
      stageProgress.push({ stageId: stageIds[i], completedBy: ['u-rakesh','u-sumit','u-anjali','u-naveen','u-deepa'][i], completedAt: t });
    }
    const c = {
      id, caseType: s.ct, patient: s.pt, dentistName: s.dn, dentistClinic: s.dc,
      urgency: s.u, units: s.units, dueDate: s.due, instructions: s.ins,
      currentStageIdx: s.stage, stageProgress,
      status: s.status || (s.dispatched ? 'dispatched' : 'active'),
      createdAt, updatedAt: createdAt + lastStageDone * 0.5 * day,
      dispatched: !!s.dispatched,
      dispatchedAt: s.dispatched ? createdAt + (stageIds.length + 1) * 0.5 * day : null,
      cancelReason: s.cancelReason || null,
      warranty: s.warranty ? {
        number: 'WAR-' + dateId(new Date(createdAt + (stageIds.length + 2) * 0.5 * day)) + '-' + String(idx + 1).padStart(3, '0'),
        issuedAt: createdAt + (stageIds.length + 2) * 0.5 * day,
        voidedAt: null, voidReason: null, months: cfg.warrantyMonths,
      } : null,
    };
    cases[id] = c;
    audit.push({ id: 'a' + audit.length, caseId: id, at: createdAt, actorId: 'u-priya', actorName: 'Priya Naik', action: 'received', meta: { from: s.dn } });
    stageProgress.forEach(sp => {
      const stageName = cfg.stages.find(st => st.id === sp.stageId)?.name;
      const workerName = Object.values(window.BENCH_CONFIG.ALLOWED_USERS).find(u => u.id === sp.completedBy)?.name || sp.completedBy;
      audit.push({ id: 'a' + audit.length, caseId: id, at: sp.completedAt, actorId: sp.completedBy, actorName: workerName, action: 'stage_complete', meta: { stageId: sp.stageId, stageName } });
    });
    if (c.dispatched)             audit.push({ id: 'a' + audit.length, caseId: id, at: c.dispatchedAt, actorId: 'u-priya', actorName: 'Priya Naik', action: 'dispatched', meta: {} });
    if (c.warranty)               audit.push({ id: 'a' + audit.length, caseId: id, at: c.warranty.issuedAt, actorId: 'u-priya', actorName: 'Priya Naik', action: 'warranty_issued', meta: { number: c.warranty.number, months: c.warranty.months } });
    if (c.status === 'cancelled') audit.push({ id: 'a' + audit.length, caseId: id, at: createdAt + 0.2*day, actorId: 'u-vikram', actorName: 'Vikram Iyer', action: 'cancelled', meta: { reason: c.cancelReason } });
    if (c.status === 'on_hold')   audit.push({ id: 'a' + audit.length, caseId: id, at: c.updatedAt + 0.5*day, actorId: 'u-vikram', actorName: 'Vikram Iyer', action: 'on_hold', meta: {} });
    if (c.status === 'on_trial')  audit.push({ id: 'a' + audit.length, caseId: id, at: c.updatedAt, actorId: 'u-priya', actorName: 'Priya Naik', action: 'trial_sent', meta: {} });
  });

  audit.sort((a, b) => a.at - b.at);
  return { cases, audit, notifications: [], labConfig: JSON.parse(JSON.stringify(cfg)) };
}

// ─── Local persistence (offline fallback) ────────────────────────────
function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.cases && s.audit && s.labConfig) return s; }
  } catch {}
  return makeSeed();
}
function saveLocal(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }
function loadAuth() { try { const r = localStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveAuth(u) { if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u)); else localStorage.removeItem(AUTH_KEY); }

// ─── Cloud API ────────────────────────────────────────────────────────
async function apiFetch(method, path, body, phone) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Bench-Phone': phone || '' },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
  return res.json();
}

async function fetchCloudState(phone) {
  try { return await apiFetch('GET', '/api/bench/state', null, phone); }
  catch (e) { console.warn('Cloud fetch failed:', e.message); return null; }
}

async function syncAction(type, payload, prevState, nextState, phone) {
  if (!phone) return;
  const post = (path, data) => apiFetch('POST', path, data, phone);
  const put  = (path, data) => apiFetch('PUT',  path, data, phone);

  const prevAuditIds = new Set(prevState.audit.map(a => a.id));
  const newAudit = nextState.audit.filter(a => !prevAuditIds.has(a.id));
  const prevNotifIds = new Set(prevState.notifications.map(n => n.id));
  const newNotifs = nextState.notifications.filter(n => !prevNotifIds.has(n.id));

  try {
    switch (type) {
      case 'CREATE_CASE':
        await post('/api/bench/cases', nextState.cases[payload.caseObj.id]);
        break;
      case 'COMPLETE_STAGE': case 'SKIP_STAGE': case 'SEND_TO_TRIAL':
      case 'RETURN_FROM_TRIAL': case 'SET_STATUS': case 'REASSIGN_STAGE':
      case 'DISPATCH': case 'ISSUE_WARRANTY': case 'VOID_WARRANTY': {
        const c = nextState.cases[payload.caseId];
        if (c) await put(`/api/bench/cases/${payload.caseId}`, c);
        break;
      }
      case 'MARK_NOTIFS_READ':
        await put('/api/bench/notifications/read', payload || {});
        return;
      case 'UPDATE_LAB_CONFIG':
        await put('/api/bench/config', payload);
        return;
      case 'RESET': {
        const { cases, audit, notifications, labConfig } = nextState;
        await post('/api/bench/reset', { cases: Object.values(cases), audit, notifications, labConfig });
        return;
      }
    }
    if (newAudit.length)  await post('/api/bench/audit',        newAudit);
    if (newNotifs.length) await post('/api/bench/notifications', newNotifs);
  } catch (e) {
    console.warn('Sync failed for', type, '—', e.message);
  }
}

// ─── Supabase Realtime ────────────────────────────────────────────────
function startRealtime(dispatch) {
  const cfg = window.BENCH_CLOUD || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return () => {};

  const toCase = r => ({
    id: r.id, caseType: r.case_type, patient: r.patient, dentistName: r.dentist_name,
    dentistClinic: r.dentist_clinic, urgency: r.urgency, units: r.units, dueDate: r.due_date,
    instructions: r.instructions, currentStageIdx: r.current_stage_idx,
    stageProgress: r.stage_progress || [], status: r.status, createdAt: r.created_at,
    updatedAt: r.updated_at, dispatched: r.dispatched || false,
    dispatchedAt: r.dispatched_at || null, cancelReason: r.cancel_reason || null,
    warranty: r.warranty || null,
  });
  const toAudit = r => ({ id: r.id, caseId: r.case_id, at: r.at, actorId: r.actor_id, actorName: r.actor_name, action: r.action, meta: r.meta || {} });
  const toNotif = r => ({ id: r.id, at: r.at, read: r.read || false, forRole: r.for_role || null, forStage: r.for_stage || null, text: r.text, caseId: r.case_id || null });

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const ch = sb.channel('bench-rt')
    .on('postgres_changes', { event: '*',      schema: 'public', table: 'bench_cases' },        p => { if (p.new?.id) dispatch({ type: 'RT_UPSERT_CASE', payload: toCase(p.new) }); })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bench_audit' },         p => { if (p.new)     dispatch({ type: 'RT_ADD_AUDIT',    payload: toAudit(p.new) }); })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bench_notifications' }, p => { if (p.new)     dispatch({ type: 'RT_ADD_NOTIF',    payload: toNotif(p.new) }); })
    .on('postgres_changes', { event: '*',      schema: 'public', table: 'bench_lab_config' },    p => { if (p.new?.config) dispatch({ type: 'UPDATE_LAB_CONFIG', payload: p.new.config }); })
    .subscribe();
  return () => { try { ch.unsubscribe(); } catch {} };
}

// ─── Reducer ─────────────────────────────────────────────────────────
function mkAudit(state, caseId, actor, action, meta = {}) {
  return { id: 'a' + (state.audit.length + Math.random().toString(36).slice(2, 6)), caseId, at: Date.now(), actorId: actor?.id || 'system', actorName: actor?.name || 'System', action, meta };
}
function addNotif(state, notif) {
  return { ...state, notifications: [{ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 4), at: Date.now(), read: false, ...notif }, ...state.notifications].slice(0, 100) };
}

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_CASE': {
      const { caseObj: c, actor } = action.payload;
      return addNotif({ ...state, cases: { ...state.cases, [c.id]: c }, audit: [...state.audit, mkAudit(state, c.id, actor, 'received', { from: c.dentistName, units: c.units, urgency: c.urgency })] }, { forRole: 'owner', text: `New case ${c.id} · ${c.patient}`, caseId: c.id });
    }
    case 'COMPLETE_STAGE': {
      const { caseId, actor, stageId } = action.payload;
      const c = state.cases[caseId]; if (!c) return state;
      const stages = state.labConfig.stages;
      const idx = stages.findIndex(s => s.id === stageId); if (idx < 0) return state;
      const sp = [...c.stageProgress.filter(p => p.stageId !== stageId), { stageId, completedBy: actor.id, completedAt: Date.now() }];
      const newIdx = idx + 1 > stages.length - 1 ? stages.length : idx + 1;
      let s2 = { ...state, cases: { ...state.cases, [caseId]: { ...c, stageProgress: sp, currentStageIdx: newIdx, updatedAt: Date.now() } }, audit: [...state.audit, mkAudit(state, caseId, actor, 'stage_complete', { stageId, stageName: stages[idx].name })] };
      s2 = addNotif(s2, { forRole: 'receptionist', text: `${stages[idx].name} complete · ${c.id} · ${c.patient}`, caseId });
      const nx = stages[idx + 1];
      return nx ? addNotif(s2, { forRole: 'worker', forStage: nx.id, text: `${c.id} is ready for ${nx.name}`, caseId }) : addNotif(s2, { forRole: 'receptionist', text: `${c.id} ready for dispatch`, caseId });
    }
    case 'SKIP_STAGE': {
      const { caseId, actor, stageId, reason } = action.payload;
      const c = state.cases[caseId]; if (!c) return state;
      const stages = state.labConfig.stages;
      const idx = stages.findIndex(s => s.id === stageId);
      return { ...state, cases: { ...state.cases, [caseId]: { ...c, currentStageIdx: Math.min(idx + 1, stages.length), updatedAt: Date.now() } }, audit: [...state.audit, mkAudit(state, caseId, actor, 'skipped', { stageId, stageName: stages[idx]?.name, reason })] };
    }
    case 'SEND_TO_TRIAL': {
      const { caseId, actor } = action.payload; const c = state.cases[caseId]; if (!c) return state;
      return { ...state, cases: { ...state.cases, [caseId]: { ...c, status: 'on_trial', updatedAt: Date.now() } }, audit: [...state.audit, mkAudit(state, caseId, actor, 'trial_sent', {})] };
    }
    case 'RETURN_FROM_TRIAL': {
      const { caseId, actor, reason } = action.payload; const c = state.cases[caseId]; if (!c) return state;
      return { ...state, cases: { ...state.cases, [caseId]: { ...c, status: 'active', updatedAt: Date.now() } }, audit: [...state.audit, mkAudit(state, caseId, actor, 'trial_returned', { reason })] };
    }
    case 'SET_STATUS': {
      const { caseId, actor, status, reason } = action.payload; const c = state.cases[caseId]; if (!c) return state;
      const upd = { status, updatedAt: Date.now() }; if (status === 'cancelled') upd.cancelReason = reason;
      return { ...state, cases: { ...state.cases, [caseId]: { ...c, ...upd } }, audit: [...state.audit, mkAudit(state, caseId, actor, status, { reason })] };
    }
    case 'REASSIGN_STAGE': {
      const { caseId, actor, stageIdx, reason } = action.payload; const c = state.cases[caseId]; if (!c) return state;
      return { ...state, cases: { ...state.cases, [caseId]: { ...c, currentStageIdx: stageIdx, updatedAt: Date.now() } }, audit: [...state.audit, mkAudit(state, caseId, actor, 'reassigned', { toStage: state.labConfig.stages[stageIdx]?.name, reason })] };
    }
    case 'DISPATCH': {
      const { caseId, actor } = action.payload; const c = state.cases[caseId]; if (!c) return state;
      const now = Date.now();
      return { ...state, cases: { ...state.cases, [caseId]: { ...c, status: 'dispatched', dispatched: true, dispatchedAt: now, currentStageIdx: state.labConfig.stages.length, updatedAt: now } }, audit: [...state.audit, mkAudit(state, caseId, actor, 'dispatched', {})] };
    }
    case 'ISSUE_WARRANTY': {
      const { caseId, actor, months } = action.payload; const c = state.cases[caseId]; if (!c) return state;
      const now = Date.now();
      const num = 'WAR-' + dateId(new Date(now)) + '-' + String(Object.values(state.cases).filter(x => x.warranty).length + 1).padStart(3, '0');
      const warranty = { number: num, issuedAt: now, voidedAt: null, voidReason: null, months: months || state.labConfig.warrantyMonths };
      return { ...state, cases: { ...state.cases, [caseId]: { ...c, warranty, updatedAt: now } }, audit: [...state.audit, mkAudit(state, caseId, actor, 'warranty_issued', { number: num, months: warranty.months })] };
    }
    case 'VOID_WARRANTY': {
      const { caseId, actor, reason } = action.payload; const c = state.cases[caseId]; if (!c || !c.warranty) return state;
      const now = Date.now(); const w = { ...c.warranty, voidedAt: now, voidReason: reason };
      return { ...state, cases: { ...state.cases, [caseId]: { ...c, warranty: w, updatedAt: now } }, audit: [...state.audit, mkAudit(state, caseId, actor, 'warranty_voided', { number: w.number, reason })] };
    }
    case 'MARK_NOTIFS_READ': {
      const { forRole, forStage } = action.payload || {};
      return { ...state, notifications: state.notifications.map(n => (forRole === undefined || n.forRole === forRole) && (forStage === undefined || n.forStage === forStage) ? { ...n, read: true } : n) };
    }
    case 'UPDATE_LAB_CONFIG': return { ...state, labConfig: action.payload };

    // Realtime — deduplicated
    case 'RT_UPSERT_CASE': { const c = action.payload; return { ...state, cases: { ...state.cases, [c.id]: c } }; }
    case 'RT_ADD_AUDIT': { const e = action.payload; if (state.audit.find(a => a.id === e.id)) return state; return { ...state, audit: [...state.audit, e].sort((a, b) => a.at - b.at) }; }
    case 'RT_ADD_NOTIF': { const n = action.payload; if (state.notifications.find(x => x.id === n.id)) return state; return { ...state, notifications: [n, ...state.notifications].slice(0, 100) }; }

    case 'RESET': return makeSeed();
    case 'HYDRATE': return action.payload;
    default: return state;
  }
}

// ─── Context / Provider ───────────────────────────────────────────────
const StoreContext = React.createContext(null);

function StoreProvider({ children }) {
  const [state, rawDispatch] = React.useReducer(reducer, null, loadLocal);
  const [user, setUser] = React.useState(loadAuth);
  const [cloudReady, setCloudReady] = React.useState(false);
  const stateRef = React.useRef(state);

  React.useEffect(() => { stateRef.current = state; saveLocal(state); }, [state]);

  // Fetch from cloud on mount / login
  React.useEffect(() => {
    if (!user) { setCloudReady(true); return; }
    setCloudReady(false);
    fetchCloudState(user.phone).then(cloud => {
      if (cloud) {
        const hasData = Object.keys(cloud.cases || {}).length > 0;
        if (hasData) {
          if (!cloud.labConfig) cloud.labConfig = window.BENCH_CONFIG.LAB_CONFIG_DEFAULTS;
          rawDispatch({ type: 'HYDRATE', payload: cloud });
        } else {
          // First run — seed the cloud from local state
          const s = stateRef.current;
          apiFetch('POST', '/api/bench/reset', { cases: Object.values(s.cases), audit: s.audit, notifications: s.notifications, labConfig: s.labConfig }, user.phone).catch(console.warn);
        }
      }
      setCloudReady(true);
    });
  }, [user?.phone]);

  // Subscribe to Realtime once cloud is ready
  React.useEffect(() => {
    if (!cloudReady || !user) return;
    return startRealtime(rawDispatch);
  }, [cloudReady, user?.phone]);

  // Optimistic dispatch + async cloud sync
  const dispatch = React.useCallback((action) => {
    const prev = stateRef.current;
    rawDispatch(action);
    if (user?.phone) {
      Promise.resolve().then(() =>
        syncAction(action.type, action.payload, prev, stateRef.current, user.phone)
      );
    }
  }, [user?.phone]);

  const login = React.useCallback((phone) => {
    const cleaned = phone.replace(/\s+/g, '');
    const u = window.BENCH_CONFIG.ALLOWED_USERS[cleaned];
    if (!u) return { ok: false, error: 'This number is not on the access list.' };
    const account = { ...u, phone: cleaned };
    saveAuth(account); setUser(account);
    return { ok: true };
  }, []);

  const logout = React.useCallback(() => {
    saveAuth(null); setUser(null); setCloudReady(false);
    location.hash = '#/login';
  }, []);

  const sel = React.useMemo(() => ({
    user, isAuthed: !!user, cloudReady,
    labConfig: state.labConfig,
    stages: state.labConfig.stages,
    caseTypes: state.labConfig.caseTypes,
    urgencyLevels: state.labConfig.urgencyLevels,
    allCases: () => Object.values(state.cases),
    caseById: (id) => state.cases[id],
    casesActive: () => Object.values(state.cases).filter(c => c.status !== 'cancelled' && c.status !== 'dispatched'),
    casesForStage: (stageId) => {
      const idx = state.labConfig.stages.findIndex(s => s.id === stageId);
      return Object.values(state.cases).filter(c => c.currentStageIdx === idx && c.status !== 'cancelled' && c.status !== 'on_hold' && c.status !== 'on_trial');
    },
    casesByWorker: (workerId) => state.audit.filter(a => a.action === 'stage_complete' && a.actorId === workerId).map(a => ({ ...a, c: state.cases[a.caseId] })).filter(x => x.c),
    auditForCase: (caseId) => state.audit.filter(a => a.caseId === caseId).sort((a, b) => b.at - a.at),
    notifsFor: (u) => { if (!u) return []; return state.notifications.filter(n => n.forRole === u.role && (!n.forStage || n.forStage === u.stageId)); },
    caseTypeName: (id) => state.labConfig.caseTypes.find(c => c.id === id)?.name || id,
    stageById: (id) => state.labConfig.stages.find(s => s.id === id),
    urgency: (id) => state.labConfig.urgencyLevels.find(u => u.id === id),
    workerById: (id) => Object.values(window.BENCH_CONFIG.ALLOWED_USERS).find(u => u.id === id),
    allWorkers: () => Object.values(window.BENCH_CONFIG.ALLOWED_USERS).filter(u => u.role === 'worker'),
  }), [state, user, cloudReady]);

  return (
    <StoreContext.Provider value={{ state, dispatch, sel, login, logout }}>
      {children}
    </StoreContext.Provider>
  );
}

function useStore() { return React.useContext(StoreContext); }

function isOverdue(c) { return c.dueDate && Date.now() > c.dueDate && c.status === 'active' && !c.dispatched; }
function dueRel(c) {
  if (!c.dueDate) return null;
  const diff = c.dueDate - Date.now(), day = 86400000;
  if (diff < -day)  return { overdue: true,  label: Math.floor(-diff / day) + 'd overdue' };
  if (diff < 0)     return { overdue: true,  label: 'overdue' };
  if (diff < day)   return { soon: true,     label: 'due today' };
  if (diff < 2*day) return { soon: true,     label: 'due tomorrow' };
  return { soon: false, label: 'in ' + Math.floor(diff / day) + 'd' };
}

Object.assign(window, { StoreProvider, useStore, StoreContext, isOverdue, dueRel, newCaseId, dateId });
