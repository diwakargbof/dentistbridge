const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { ALLOWED_USERS } = require('../bench-config');

// Lazy-initialized so env vars from dotenv are loaded first
let _sb;
function sb() {
  if (!_sb) _sb = createClient(
    (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
    process.env.SUPABASE_SERVICE_KEY || ''
  );
  return _sb;
}

// ─── Auth middleware ──────────────────────────────────────────────────
function auth(req, res, next) {
  const phone = (req.headers['x-bench-phone'] || '').trim();
  const user = ALLOWED_USERS[phone];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.benchUser = { ...user, phone };
  next();
}

// ─── GET /api/bench/state ─────────────────────────────────────────────
router.get('/state', auth, async (req, res) => {
  try {
    const [casesRes, auditRes, notifsRes, cfgRes] = await Promise.all([
      sb().from('bench_cases').select('*'),
      sb().from('bench_audit').select('*').order('at', { ascending: true }),
      sb().from('bench_notifications').select('*').order('at', { ascending: false }),
      sb().from('bench_lab_config').select('*').eq('id', 'default').maybeSingle(),
    ]);

    const cases = {};
    (casesRes.data || []).forEach(row => { cases[row.id] = dbToCase(row); });

    res.json({
      cases,
      audit:         (auditRes.data  || []).map(dbToAudit),
      notifications: (notifsRes.data || []).map(dbToNotif),
      labConfig:     cfgRes.data?.config || null,
    });
  } catch (e) {
    console.error('GET /bench/state', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /api/bench/cases ────────────────────────────────────────────
router.post('/cases', auth, async (req, res) => {
  const { error } = await sb().from('bench_cases').insert(caseToDb(req.body));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── PUT /api/bench/cases/:id ─────────────────────────────────────────
router.put('/cases/:id', auth, async (req, res) => {
  const { error } = await sb().from('bench_cases').upsert(caseToDb(req.body));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── POST /api/bench/audit ────────────────────────────────────────────
router.post('/audit', auth, async (req, res) => {
  const entries = Array.isArray(req.body) ? req.body : [];
  if (!entries.length) return res.json({ ok: true });
  const { error } = await sb().from('bench_audit').upsert(entries.map(auditToDb));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── POST /api/bench/notifications ───────────────────────────────────
router.post('/notifications', auth, async (req, res) => {
  const notifs = Array.isArray(req.body) ? req.body : [];
  if (!notifs.length) return res.json({ ok: true });
  const { error } = await sb().from('bench_notifications').upsert(notifs.map(notifToDb));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── PUT /api/bench/notifications/read ───────────────────────────────
router.put('/notifications/read', auth, async (req, res) => {
  const { forRole, forStage } = req.body || {};
  let q = sb().from('bench_notifications').update({ read: true });
  if (forRole)  q = q.eq('for_role',  forRole);
  if (forStage) q = q.eq('for_stage', forStage);
  const { error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── GET /api/bench/config ────────────────────────────────────────────
router.get('/config', auth, async (req, res) => {
  const { data, error } = await sb().from('bench_lab_config').select('*').eq('id', 'default').maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data?.config || null);
});

// ─── PUT /api/bench/config ────────────────────────────────────────────
router.put('/config', auth, async (req, res) => {
  const { error } = await sb().from('bench_lab_config').upsert({ id: 'default', config: req.body });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── POST /api/bench/reset ────────────────────────────────────────────
// Deletes all rows, then bulk-inserts the seed payload sent in body.
router.post('/reset', auth, async (req, res) => {
  const { cases = [], audit = [], notifications = [], labConfig } = req.body || {};
  try {
    // Delete in dependency order (audit references cases)
    await sb().from('bench_notifications').delete().not('id', 'is', null);
    await sb().from('bench_audit').delete().not('id', 'is', null);
    await sb().from('bench_cases').delete().not('id', 'is', null);

    const inserts = [];
    if (cases.length)
      inserts.push(sb().from('bench_cases').insert(cases.map(caseToDb)));
    if (audit.length)
      inserts.push(sb().from('bench_audit').insert(audit.map(auditToDb)));
    if (notifications.length)
      inserts.push(sb().from('bench_notifications').insert(notifications.map(notifToDb)));
    if (labConfig)
      inserts.push(sb().from('bench_lab_config').upsert({ id: 'default', config: labConfig }));

    await Promise.all(inserts);
    res.json({ ok: true });
  } catch (e) {
    console.error('POST /bench/reset', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Conversion helpers ───────────────────────────────────────────────
function caseToDb(c) {
  return {
    id:                c.id,
    case_type:         c.caseType,
    patient:           c.patient,
    dentist_name:      c.dentistName,
    dentist_clinic:    c.dentistClinic,
    urgency:           c.urgency,
    units:             c.units,
    due_date:          c.dueDate,
    instructions:      c.instructions,
    current_stage_idx: c.currentStageIdx,
    stage_progress:    c.stageProgress || [],
    status:            c.status,
    created_at:        c.createdAt,
    updated_at:        c.updatedAt,
    dispatched:        c.dispatched || false,
    dispatched_at:     c.dispatchedAt || null,
    cancel_reason:     c.cancelReason || null,
    warranty:          c.warranty || null,
  };
}

function dbToCase(row) {
  return {
    id:               row.id,
    caseType:         row.case_type,
    patient:          row.patient,
    dentistName:      row.dentist_name,
    dentistClinic:    row.dentist_clinic,
    urgency:          row.urgency,
    units:            row.units,
    dueDate:          row.due_date,
    instructions:     row.instructions,
    currentStageIdx:  row.current_stage_idx,
    stageProgress:    row.stage_progress || [],
    status:           row.status,
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
    dispatched:       row.dispatched || false,
    dispatchedAt:     row.dispatched_at || null,
    cancelReason:     row.cancel_reason || null,
    warranty:         row.warranty || null,
  };
}

function auditToDb(a) {
  return {
    id:         a.id,
    case_id:    a.caseId,
    at:         a.at,
    actor_id:   a.actorId,
    actor_name: a.actorName,
    action:     a.action,
    meta:       a.meta || {},
  };
}

function dbToAudit(row) {
  return {
    id:        row.id,
    caseId:    row.case_id,
    at:        row.at,
    actorId:   row.actor_id,
    actorName: row.actor_name,
    action:    row.action,
    meta:      row.meta || {},
  };
}

function notifToDb(n) {
  return {
    id:        n.id,
    at:        n.at,
    read:      n.read || false,
    for_role:  n.forRole  || null,
    for_stage: n.forStage || null,
    text:      n.text,
    case_id:   n.caseId   || null,
  };
}

function dbToNotif(row) {
  return {
    id:       row.id,
    at:       row.at,
    read:     row.read || false,
    forRole:  row.for_role  || null,
    forStage: row.for_stage || null,
    text:     row.text,
    caseId:   row.case_id   || null,
  };
}

module.exports = router;
