// data.jsx — mock data for Chairside prototype
// Dentists, technicians, services, cases, message threads.
// Kept thin & globally exposed.

const TECHS = [
  {
    id: 't1', name: 'Vikram Iyer', lab: 'Iyer Dental Lab', city: 'Mumbai',
    rating: 4.9, jobs: 312, turnaround: '4–6 days',
    bio: 'Crown & bridge specialist. Twelve years of milling experience. Zirconia, e.max, PFM.',
    services: ['s1', 's2', 's5'],
  },
  {
    id: 't2', name: 'Priya Mehta', lab: 'Bombay Dental Studio', city: 'Mumbai',
    rating: 4.8, jobs: 248, turnaround: '5–7 days',
    bio: 'Aesthetic veneers + full-mouth rehab. CAD/CAM workflow with hand-layered porcelain.',
    services: ['s2', 's3', 's4'],
  },
  {
    id: 't3', name: 'Rajesh Khanna', lab: 'Pune Prosthetics', city: 'Pune',
    rating: 4.7, jobs: 451, turnaround: '6–8 days',
    bio: 'Removable specialist — partials, complete dentures, night guards.',
    services: ['s4', 's5'],
  },
  {
    id: 't4', name: 'Sara Joseph', lab: 'Crown & Glory Lab', city: 'Bangalore',
    rating: 4.9, jobs: 187, turnaround: '5–7 days',
    bio: 'Digital workflow, intra-oral scan friendly. Same-day mockups available.',
    services: ['s1', 's3'],
  },
];

const SERVICES = [
  {
    id: 's1', title: 'Zirconia Crown', price: 4200,
    desc: 'Monolithic or layered zirconia. Custom shade matching included.',
    stages: ['Received', 'Prepped', 'Designed', 'Milled', 'Glazed', 'Ready'],
  },
  {
    id: 's2', title: 'Porcelain Veneer', price: 6500,
    desc: 'Hand-layered feldspathic veneers. 0.3–0.5mm thickness.',
    stages: ['Received', 'Waxed-up', 'Pressed', 'Layered', 'Glazed', 'Ready'],
  },
  {
    id: 's3', title: 'E.max Inlay / Onlay', price: 5400,
    desc: 'Lithium disilicate. CAD-milled with hand polish finish.',
    stages: ['Received', 'Designed', 'Milled', 'Crystallized', 'Ready'],
  },
  {
    id: 's4', title: 'Complete Denture', price: 12000,
    desc: 'Acrylic base with high-impact teeth. Try-in included.',
    stages: ['Received', 'Molded', 'Wax try-in', 'Processed', 'Polished', 'Ready'],
  },
  {
    id: 's5', title: 'Night Guard', price: 2800,
    desc: 'Hard-soft dual-layer occlusal splint.',
    stages: ['Received', 'Trimmed', 'Polished', 'Ready'],
  },
  {
    id: 's6', title: 'Bridge — 3 unit', price: 14500,
    desc: 'Zirconia or PFM. Includes pontic.',
    stages: ['Received', 'Prepped', 'Designed', 'Milled', 'Glazed', 'Ready'],
  },
];

const DENTISTS = [
  { id: 'd1', name: 'Dr. Anaya Rao', clinic: 'Rao Family Dental', city: 'Mumbai' },
  { id: 'd2', name: 'Dr. Karan Mehta', clinic: 'Mehta Smile Studio', city: 'Mumbai' },
  { id: 'd3', name: 'Dr. Meera Singh', clinic: 'Singh Dental Clinic', city: 'Bangalore' },
  { id: 'd4', name: 'Dr. Imran Sayed', clinic: 'White Coast Dental', city: 'Goa' },
];

// Cases are scoped per technician (t1) for the demo but tagged with dentist.
const CASES = [
  {
    id: 'C-4821', service: 's1', stage: 3, dentist: 'd1',
    patient: 'Patient · #14 UR1', received: 'Mon 10:24',
    unread: 1, pinned: true,
  },
  {
    id: 'C-4820', service: 's6', stage: 2, dentist: 'd2',
    patient: 'Patient · #11–13 bridge', received: 'Mon 09:10',
    unread: 0,
  },
  {
    id: 'C-4818', service: 's2', stage: 4, dentist: 'd1',
    patient: 'Patient · UR2 veneer', received: 'Sun 16:42',
    unread: 0,
  },
  {
    id: 'C-4815', service: 's4', stage: 1, dentist: 'd3',
    patient: 'Patient · upper complete', received: 'Sat 14:01',
    unread: 2,
  },
  {
    id: 'C-4811', service: 's3', stage: 2, dentist: 'd4',
    patient: 'Patient · #36 onlay', received: 'Fri 11:00',
    unread: 0,
  },
  {
    id: 'C-4808', service: 's1', stage: 5, dentist: 'd2',
    patient: 'Patient · #46 UR4', received: 'Fri 09:30',
    unread: 0,
  },
  {
    id: 'C-4805', service: 's5', stage: 2, dentist: 'd1',
    patient: 'Patient · nightguard', received: 'Thu 17:15',
    unread: 0,
  },
];

// Chat thread for active case (C-4821)
const THREAD_4821 = [
  { sys: 'Case assigned — Mon, 10:24 AM' },
  { from: 'd1', text: 'Hi Vikram — sending over UR1 prep. Margin is sub-gingival on the distal, let me know if you need a re-scan.', t: '10:24' },
  { from: 'd1', img: 'iOS · scan export', t: '10:24' },
  { from: 't1', text: 'Got it. Margin looks readable. I\'ll start prep.', t: '10:31' },
  { sys: 'Stage → Prepped' },
  { from: 't1', text: 'Heads-up: I\'ll need a shade tab photo against the prep before designing. Daylight if possible.', t: '11:02', template: 'Shade request · Zirconia' },
  { from: 'd1', img: 'Shade tab + prep', t: '14:18', shadeable: true },
  { from: 't1', text: 'Reading A2 cervical → A1 incisal. I\'ll layer accordingly.', t: '14:22' },
  { sys: 'Stage → Designed' },
  { from: 't1', text: 'Designed and queued for milling. Should ship Wed evening.', t: 'Tue 09:14' },
];

window.CHAIRSIDE_DATA = { TECHS, SERVICES, DENTISTS, CASES, THREAD_4821 };
window.byId = (arr, id) => arr.find(x => x.id === id);
