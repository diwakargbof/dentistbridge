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
  // ─── Receptionist ────────────────────────────────────────────
  '+919876543201': {
    role: 'receptionist',
    id: 'u-priya',
    name: 'Priya Naik',
  },

  // ─── Stage workers ───────────────────────────────────────────
  '+919876543210': { role: 'worker', id: 'u-rakesh',  name: 'Rakesh Pawar',   stageId: 'st-design' },
  '+919876543211': { role: 'worker', id: 'u-sumit',   name: 'Sumit Yadav',    stageId: 'st-mill'   },
  '+919876543212': { role: 'worker', id: 'u-anjali',  name: 'Anjali Desai',   stageId: 'st-finish' },
  '+919876543213': { role: 'worker', id: 'u-naveen',  name: 'Naveen Kumar',   stageId: 'st-glaze'  },
  '+919876543214': { role: 'worker', id: 'u-deepa',   name: 'Deepa Iyer',     stageId: 'st-qc'     },

  // ─── Owner / Manager ─────────────────────────────────────────
  '+919876543220': {
    role: 'owner',
    id: 'u-vikram',
    name: 'Vikram Iyer',
  },

  // ─── Admin ───────────────────────────────────────────────────
  '+919876543230': {
    role: 'admin',
    id: 'u-admin',
    name: 'System Admin',
  },
};

// Demo accounts shown on the login screen as quick-fill buttons.
// Remove in production.
const DEMO_LOGINS = [
  { phone: '+919876543220', label: 'Vikram · Owner' },
  { phone: '+919876543201', label: 'Priya · Reception' },
  { phone: '+919876543210', label: 'Rakesh · Design worker' },
  { phone: '+919876543212', label: 'Anjali · Finish worker' },
  { phone: '+919876543230', label: 'Admin' },
];

// ────────────────────────────────────────────────────────────────────
// Lab default config — admin can edit these in-app and they persist.
// First-load only; on subsequent loads, the admin's edits win.
// ────────────────────────────────────────────────────────────────────
const LAB_CONFIG_DEFAULTS = {
  labName: 'Iyer Dental Lab',
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
