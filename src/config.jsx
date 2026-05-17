// config.jsx — Bench configuration
// ════════════════════════════════════════════════════════════════════
// 📞 ALLOWED PHONE NUMBERS — edit to control who can log in.
// ════════════════════════════════════════════════════════════════════
//
// Roles: 'receptionist' | 'worker' | 'owner' | 'admin'
// Workers must include a stageId (matches a stage in LAB_CONFIG.stages).
//
// To add a user, copy a line. No build step needed.

const ALLOWED_USERS = {
  // ─── Receptionists ───────────────────────────────────────────
  '+919876543201': { role: 'receptionist', id: 'u-recep1', name: 'Receptionist1' },
  '+919876543202': { role: 'receptionist', id: 'u-recep2', name: 'Receptionist2' },

  // ─── Stage workers ───────────────────────────────────────────
  '+910000000001': { role: 'worker', id: 'u-worker1', name: 'Worker 1', stageId: 'st-design' },
  '+910000000002': { role: 'worker', id: 'u-worker2', name: 'Worker 2', stageId: 'st-mill'   },
  '+910000000003': { role: 'worker', id: 'u-worker3', name: 'Worker 3', stageId: 'st-finish' },

  // ─── Owners ──────────────────────────────────────────────────
  '+919876543220': { role: 'owner', id: 'u-vishwanath', name: 'Vishwanath' },
  '+919876543221': { role: 'owner', id: 'u-anu',        name: 'Anu'        },

  // ─── Admin ───────────────────────────────────────────────────
  '+919876543230': { role: 'admin', id: 'u-admin', name: 'Admin' },
};

// Demo accounts shown on the login screen as quick-fill buttons.
// Remove in production.
const DEMO_LOGINS = [
  { phone: '+919876543220', label: 'Vishwanath · Owner' },
  { phone: '+919876543221', label: 'Anu · Owner' },
  { phone: '+919876543201', label: 'Receptionist1' },
  { phone: '+919876543202', label: 'Receptionist2' },
  { phone: '+910000000001', label: 'Worker 1 · Design' },
  { phone: '+910000000002', label: 'Worker 2 · Mill' },
  { phone: '+910000000003', label: 'Worker 3 · Finish' },
  { phone: '+919876543230', label: 'Admin' },
];

// ────────────────────────────────────────────────────────────────────
// Lab default config — admin can edit these in-app and they persist.
// First-load only; on subsequent loads, the admin's edits win.
// ────────────────────────────────────────────────────────────────────
const LAB_CONFIG_DEFAULTS = {
  labName: 'southamandentallab',
  labCity: 'Mumbai',
  labPhone: '+91 22 4444 0000',
  warrantyMonths: 12,

  // Workflow stages, in order. Each case flows through these.
  // QC is just another stage with role-special marker.
  stages: [
    { id: 'st-design', name: 'Design',  short: 'D', desc: 'CAD design / wax-up' },
    { id: 'st-mill',   name: 'Mill',    short: 'M', desc: 'Milling / pressing' },
    { id: 'st-finish', name: 'Finish',  short: 'F', desc: 'Layering / contouring' },
    { id: 'st-glaze',  name: 'Glaze',   short: 'G', desc: 'Glazing / polishing' },
    { id: 'st-qc',     name: 'QC',      short: 'Q', desc: 'Quality check', isQC: true },
  ],

  caseTypes: [
    { id: 'ct-crown',    name: 'Crown' },
    { id: 'ct-bridge',   name: 'Bridge' },
    { id: 'ct-veneer',   name: 'Veneer' },
    { id: 'ct-inlay',    name: 'Inlay / Onlay' },
    { id: 'ct-denture',  name: 'Denture (full)' },
    { id: 'ct-partial',  name: 'Denture (partial)' },
    { id: 'ct-night',    name: 'Night guard' },
    { id: 'ct-implant',  name: 'Implant abutment' },
  ],

  urgencyLevels: [
    { id: 'normal',    name: 'Normal',         slaHours: 168, tone: 'normal' },
    { id: 'district',  name: 'Same district',  slaHours: 72,  tone: 'district' },
    { id: 'emergency', name: 'Emergency',      slaHours: 24,  tone: 'emergency' },
  ],
};

window.BENCH_CONFIG = { ALLOWED_USERS, DEMO_LOGINS, LAB_CONFIG_DEFAULTS };
