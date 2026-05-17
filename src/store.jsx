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
  return { cases: {}, audit: [], notifications: [], labConfig: JSON.parse(JSON.stringify(cfg)) };
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
