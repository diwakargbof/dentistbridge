// data.jsx — shared helpers + full mock data for offline/demo mode
// Loaded after supabase.jsx. All hooks check window.CHAIRSIDE_MOCK_DATA.

window.byId = (arr, id) => (arr ? arr.find(x => x.id === id) : null);

// ── Static user IDs (must match app.jsx PHONE_PROFILES) ──────
const _TECH_ID   = 'static-tech-vikram';
const _DENT_ID   = 'static-dent-anaya';
const _LAB_ID    = 'lab-iyer';
const _CLINIC_ID = 'clinic-rao';

// ── Services for Iyer Dental Lab ──────────────────────────────
const _SVC_IYER = [
  {
    id: 'svc-i-1', lab_id: _LAB_ID, active: true, price: 4200,
    title: 'Zirconia Crown',
    description: 'Monolithic or layered zirconia. Custom shade matching included.',
    stages: ['Received', 'Prepped', 'Designed', 'Milled', 'Glazed', 'Ready'],
  },
  {
    id: 'svc-i-2', lab_id: _LAB_ID, active: true, price: 14500,
    title: 'Bridge — 3 unit',
    description: 'Zirconia or PFM. Includes pontic.',
    stages: ['Received', 'Prepped', 'Designed', 'Milled', 'Glazed', 'Ready'],
  },
  {
    id: 'svc-i-3', lab_id: _LAB_ID, active: true, price: 2800,
    title: 'Night Guard',
    description: 'Hard-soft dual-layer occlusal splint.',
    stages: ['Received', 'Trimmed', 'Polished', 'Ready'],
  },
  {
    id: 'svc-i-4', lab_id: _LAB_ID, active: true, price: 5400,
    title: 'E.max Inlay / Onlay',
    description: 'Lithium disilicate. CAD-milled with hand polish finish.',
    stages: ['Received', 'Designed', 'Milled', 'Crystallized', 'Ready'],
  },
];

const _LAB_IYER = {
  id: _LAB_ID, owner_id: _TECH_ID, verified: true, rating: 4.9, jobs_count: 312,
  name: 'Iyer Dental Lab', city: 'Mumbai', turnaround: '4–6 days',
  bio: 'Crown & bridge specialist. Twelve years of milling experience. Zirconia, e.max, PFM.',
  services: _SVC_IYER,
  owner: { full_name: 'Vikram Iyer' },
};

// ── All labs for dentist browse ───────────────────────────────
const _ALL_LABS = [
  _LAB_IYER,
  {
    id: 'lab-bombay', owner_id: 'other-1', verified: true, rating: 4.8, jobs_count: 248,
    name: 'Bombay Dental Studio', city: 'Mumbai', turnaround: '5–7 days',
    bio: 'Aesthetic veneers + full-mouth rehab. CAD/CAM workflow with hand-layered porcelain.',
    services: [
      { id: 'svc-b-1', lab_id: 'lab-bombay', active: true, price: 6500, title: 'Porcelain Veneer',     description: 'Hand-layered feldspathic veneers. 0.3–0.5mm thickness.', stages: ['Received', 'Waxed-up', 'Pressed', 'Layered', 'Glazed', 'Ready'] },
      { id: 'svc-b-2', lab_id: 'lab-bombay', active: true, price: 5400, title: 'E.max Inlay / Onlay', description: 'Lithium disilicate. CAD-milled with hand polish.',           stages: ['Received', 'Designed', 'Milled', 'Crystallized', 'Ready'] },
    ],
    owner: { full_name: 'Priya Mehta' },
  },
  {
    id: 'lab-pune', owner_id: 'other-2', verified: false, rating: 4.7, jobs_count: 451,
    name: 'Pune Prosthetics', city: 'Pune', turnaround: '6–8 days',
    bio: 'Removable specialist — partials, complete dentures, night guards.',
    services: [
      { id: 'svc-p-1', lab_id: 'lab-pune', active: true, price: 12000, title: 'Complete Denture', description: 'Acrylic base with high-impact teeth. Try-in included.', stages: ['Received', 'Molded', 'Wax try-in', 'Processed', 'Polished', 'Ready'] },
    ],
    owner: { full_name: 'Rajesh Khanna' },
  },
  {
    id: 'lab-blr', owner_id: 'other-3', verified: true, rating: 4.9, jobs_count: 187,
    name: 'Crown & Glory Lab', city: 'Bangalore', turnaround: '5–7 days',
    bio: 'Digital workflow, intra-oral scan friendly. Same-day mockups available.',
    services: [
      { id: 'svc-g-1', lab_id: 'lab-blr', active: true, price: 4200, title: 'Zirconia Crown',       description: 'Monolithic zirconia, full digital workflow.', stages: ['Received', 'Designed', 'Milled', 'Glazed', 'Ready'] },
      { id: 'svc-g-2', lab_id: 'lab-blr', active: true, price: 5400, title: 'E.max Inlay / Onlay', description: 'IPS e.max, digital design.',                   stages: ['Received', 'Designed', 'Milled', 'Crystallized', 'Ready'] },
    ],
    owner: { full_name: 'Sara Joseph' },
  },
];

// ── Active cases ──────────────────────────────────────────────
const _LAB_REF  = { id: _LAB_ID, name: 'Iyer Dental Lab', owner: { full_name: 'Vikram Iyer' } };
const _DENT_REF = { full_name: 'Dr. Anaya Rao' };

const _CASES = [
  {
    id: 'C-4821', lab_id: _LAB_ID, dentist_id: _DENT_ID, service_id: 'svc-i-1',
    patient_ref: 'Patient · #14 UR1', stage: 3, notes: 'Margin is sub-gingival on the distal.',
    shade: 'A2', payment_status: 'pending', payment_amount: null, archived: false,
    created_at: '2026-05-12T10:24:00Z', updated_at: '2026-05-13T09:14:00Z',
    service: _SVC_IYER[0], lab: _LAB_REF, dentist: _DENT_REF,
  },
  {
    id: 'C-4820', lab_id: _LAB_ID, dentist_id: _DENT_ID, service_id: 'svc-i-2',
    patient_ref: 'Patient · #11–13 bridge', stage: 2, notes: '',
    shade: null, payment_status: 'pending', payment_amount: null, archived: false,
    created_at: '2026-05-12T09:10:00Z', updated_at: '2026-05-12T09:10:00Z',
    service: _SVC_IYER[1], lab: _LAB_REF, dentist: _DENT_REF,
  },
  {
    id: 'C-4818', lab_id: _LAB_ID, dentist_id: 'dent-other-1', service_id: 'svc-i-1',
    patient_ref: 'Patient · UR2 veneer', stage: 4, notes: '',
    shade: 'B1', payment_status: 'pending', payment_amount: null, archived: false,
    created_at: '2026-05-11T16:42:00Z', updated_at: '2026-05-13T10:00:00Z',
    service: _SVC_IYER[0], lab: _LAB_REF, dentist: { full_name: 'Dr. Karan Mehta' },
  },
  {
    id: 'C-4815', lab_id: _LAB_ID, dentist_id: 'dent-other-2', service_id: 'svc-i-3',
    patient_ref: 'Patient · upper nightguard', stage: 1, notes: '',
    shade: null, payment_status: 'pending', payment_amount: null, archived: false,
    created_at: '2026-05-10T14:01:00Z', updated_at: '2026-05-10T14:01:00Z',
    service: _SVC_IYER[2], lab: _LAB_REF, dentist: { full_name: 'Dr. Meera Singh' },
  },
  {
    id: 'C-4808', lab_id: _LAB_ID, dentist_id: 'dent-other-1', service_id: 'svc-i-1',
    patient_ref: 'Patient · #46 UR4', stage: 5, notes: '',
    shade: 'A3', payment_status: 'pending', payment_amount: null, archived: false,
    created_at: '2026-05-09T09:30:00Z', updated_at: '2026-05-14T11:00:00Z',
    service: _SVC_IYER[0], lab: _LAB_REF, dentist: { full_name: 'Dr. Karan Mehta' },
  },
];

// ── Archived cases ────────────────────────────────────────────
const _ARCHIVED = [
  {
    id: 'C-4801', lab_id: _LAB_ID, dentist_id: _DENT_ID, service_id: 'svc-i-1',
    patient_ref: 'Patient · #16', stage: 5,
    shade: 'A3', payment_status: 'confirmed', payment_amount: 4200, archived: true,
    created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-10T10:00:00Z',
    service: _SVC_IYER[0], lab: _LAB_REF, dentist: _DENT_REF,
  },
  {
    id: 'C-4798', lab_id: _LAB_ID, dentist_id: _DENT_ID, service_id: 'svc-i-3',
    patient_ref: 'Patient · nightguard', stage: 3,
    shade: null, payment_status: 'confirmed', payment_amount: 2800, archived: true,
    created_at: '2026-04-05T10:00:00Z', updated_at: '2026-04-12T10:00:00Z',
    service: _SVC_IYER[2], lab: _LAB_REF, dentist: _DENT_REF,
  },
  {
    id: 'C-4790', lab_id: _LAB_ID, dentist_id: 'dent-other-1', service_id: 'svc-i-2',
    patient_ref: 'Patient · #34–36 bridge', stage: 5,
    shade: null, payment_status: 'confirmed', payment_amount: 14500, archived: true,
    created_at: '2026-03-20T10:00:00Z', updated_at: '2026-03-30T10:00:00Z',
    service: _SVC_IYER[1], lab: _LAB_REF, dentist: { full_name: 'Dr. Karan Mehta' },
  },
  {
    id: 'C-4785', lab_id: _LAB_ID, dentist_id: _DENT_ID, service_id: 'svc-i-4',
    patient_ref: 'Patient · #25 onlay', stage: 4,
    shade: null, payment_status: 'confirmed', payment_amount: 5400, archived: true,
    created_at: '2026-03-10T10:00:00Z', updated_at: '2026-03-20T10:00:00Z',
    service: _SVC_IYER[3], lab: _LAB_REF, dentist: _DENT_REF,
  },
];

// ── Messages ──────────────────────────────────────────────────
const _T = { full_name: 'Vikram Iyer',   role: 'technician' };
const _D = { full_name: 'Dr. Anaya Rao', role: 'dentist' };
const _S = { full_name: 'Chairside',     role: 'system' };

const _MSGS = {
  'C-4821': [
    { id: 'm-0a', case_id: 'C-4821', sender_id: null,     body: 'Case assigned — Mon, 10:24 AM',                                                              kind: 'system',   metadata: {},                             deleted_at: null, created_at: '2026-05-12T10:24:00Z', sender: _S },
    { id: 'm-1a', case_id: 'C-4821', sender_id: _DENT_ID, body: 'Hi Vikram — sending over UR1 prep. Margin is sub-gingival on the distal, let me know if you need a re-scan.', kind: 'text', metadata: {}, deleted_at: null, created_at: '2026-05-12T10:24:30Z', sender: _D },
    { id: 'm-2a', case_id: 'C-4821', sender_id: _TECH_ID, body: "Got it. Margin looks readable. I'll start prep.",                                              kind: 'text',     metadata: {},                             deleted_at: null, created_at: '2026-05-12T10:31:00Z', sender: _T },
    { id: 'm-3a', case_id: 'C-4821', sender_id: null,     body: 'Stage → Prepped',                                                                              kind: 'system',   metadata: {},                             deleted_at: null, created_at: '2026-05-12T11:00:00Z', sender: _S },
    { id: 'm-4a', case_id: 'C-4821', sender_id: _TECH_ID, body: "Heads-up: I'll need a shade tab photo against the prep before designing. Daylight if possible.", kind: 'template', metadata: { template: 'Shade request · Zirconia' }, deleted_at: null, created_at: '2026-05-12T11:02:00Z', sender: _T },
    { id: 'm-5a', case_id: 'C-4821', sender_id: _DENT_ID, body: 'Reading A2 cervical → A1 incisal. Layering accordingly.',                                     kind: 'text',     metadata: {},                             deleted_at: null, created_at: '2026-05-12T14:22:00Z', sender: _D },
    { id: 'm-6a', case_id: 'C-4821', sender_id: null,     body: 'Stage → Designed',                                                                             kind: 'system',   metadata: {},                             deleted_at: null, created_at: '2026-05-13T09:00:00Z', sender: _S },
    { id: 'm-7a', case_id: 'C-4821', sender_id: _TECH_ID, body: 'Designed and queued for milling. Should ship Wed evening.',                                   kind: 'text',     metadata: {},                             deleted_at: null, created_at: '2026-05-13T09:14:00Z', sender: _T },
  ],
  'C-4820': [
    { id: 'm-0b', case_id: 'C-4820', sender_id: null,     body: 'Case assigned — Mon, 9:10 AM',                                                                kind: 'system', metadata: {}, deleted_at: null, created_at: '2026-05-12T09:10:00Z', sender: _S },
    { id: 'm-1b', case_id: 'C-4820', sender_id: _DENT_ID, body: 'Bridge for #11–13. PFM please — patient has issues with full zirconia. Pontic on #12.',       kind: 'text',   metadata: {}, deleted_at: null, created_at: '2026-05-12T09:10:30Z', sender: _D },
    { id: 'm-2b', case_id: 'C-4820', sender_id: _TECH_ID, body: "Confirmed — PFM bridge, pontic #12. Will prep first thing tomorrow.",                          kind: 'text',   metadata: {}, deleted_at: null, created_at: '2026-05-12T09:45:00Z', sender: _T },
    { id: 'm-3b', case_id: 'C-4820', sender_id: null,     body: 'Stage → Prepped',                                                                              kind: 'system', metadata: {}, deleted_at: null, created_at: '2026-05-13T08:00:00Z', sender: _S },
  ],
  'C-4818': [
    { id: 'm-0c', case_id: 'C-4818', sender_id: null,     body: 'Case assigned — Sun, 4:42 PM',                                                                kind: 'system', metadata: {}, deleted_at: null, created_at: '2026-05-11T16:42:00Z', sender: _S },
    { id: 'm-1c', case_id: 'C-4818', sender_id: 'dent-other-1', body: "UR2 veneer re-do. Patient wants lighter shade than last time — we went with A2, let's try B1.", kind: 'text', metadata: {}, deleted_at: null, created_at: '2026-05-11T16:43:00Z', sender: { full_name: 'Dr. Karan Mehta', role: 'dentist' } },
    { id: 'm-2c', case_id: 'C-4818', sender_id: _TECH_ID, body: 'Understood — B1 shade, brighter incisal. Will adjust.',                                       kind: 'text',   metadata: {}, deleted_at: null, created_at: '2026-05-11T17:10:00Z', sender: _T },
  ],
  'C-4815': [
    { id: 'm-0d', case_id: 'C-4815', sender_id: null,     body: 'Case assigned — Sat, 2:01 PM', kind: 'system', metadata: {}, deleted_at: null, created_at: '2026-05-10T14:01:00Z', sender: _S },
    { id: 'm-1d', case_id: 'C-4815', sender_id: 'dent-other-2', body: 'Upper nightguard. Patient grinds heavily — please go hard outer shell, softer inner.', kind: 'text', metadata: {}, deleted_at: null, created_at: '2026-05-10T14:01:30Z', sender: { full_name: 'Dr. Meera Singh', role: 'dentist' } },
    { id: 'm-2d', case_id: 'C-4815', sender_id: _TECH_ID, body: 'Got it — hard-soft laminate. Any bite registration issues we should know about?',             kind: 'text',   metadata: {}, deleted_at: null, created_at: '2026-05-10T14:30:00Z', sender: _T },
  ],
};

// ── Global mock data object ───────────────────────────────────
window.CHAIRSIDE_MOCK_DATA = {
  TECH_ID:   _TECH_ID,
  DENT_ID:   _DENT_ID,
  LAB_ID:    _LAB_ID,
  CLINIC_ID: _CLINIC_ID,

  PROFILES: {
    [_TECH_ID]: { id: _TECH_ID, role: 'technician', full_name: 'Vikram Iyer',   phone: '8919744177', city: 'Mumbai' },
    [_DENT_ID]: { id: _DENT_ID, role: 'dentist',    full_name: 'Dr. Anaya Rao', phone: '9440134493', city: 'Mumbai' },
  },

  MY_LAB:    _LAB_IYER,
  MY_CLINIC: { id: _CLINIC_ID, owner_id: _DENT_ID, name: 'Rao Family Dental', city: 'Mumbai' },

  LABS:           _ALL_LABS,
  CASES_TECH:     _CASES,
  CASES_DENTIST:  _CASES.filter(c => c.dentist_id === _DENT_ID),
  ARCHIVED_TECH:  _ARCHIVED,
  ARCHIVED_DENT:  _ARCHIVED.filter(c => c.dentist_id === _DENT_ID),
  MESSAGES:       _MSGS,
};
