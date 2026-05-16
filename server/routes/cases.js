const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

const CASE_SELECT = `
  *,
  service:services(id, title, price, stages),
  lab:labs(id, name, city, bio, turnaround, rating),
  dentist:profiles!cases_dentist_id_fkey(id, full_name, phone, city)
`;

async function getProfileRole(userId) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return data?.role;
}

async function getLabId(userId) {
  const { data } = await supabase.from('labs').select('id').eq('owner_id', userId).single();
  return data?.id;
}

// GET /api/cases — list active cases for current user
router.get('/', auth, async (req, res) => {
  const role = await getProfileRole(req.user.id);

  let query = supabase
    .from('cases')
    .select(CASE_SELECT)
    .eq('archived', false)
    .order('updated_at', { ascending: false });

  if (role === 'dentist') {
    query = query.eq('dentist_id', req.user.id);
  } else {
    const labId = await getLabId(req.user.id);
    if (!labId) return res.json([]);
    query = query.eq('lab_id', labId);
  }

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/cases/archive — archived cases
router.get('/archive', auth, async (req, res) => {
  const role = await getProfileRole(req.user.id);

  let query = supabase
    .from('cases')
    .select(CASE_SELECT)
    .eq('archived', true)
    .order('updated_at', { ascending: false });

  if (role === 'dentist') {
    query = query.eq('dentist_id', req.user.id);
  } else {
    const labId = await getLabId(req.user.id);
    if (!labId) return res.json([]);
    query = query.eq('lab_id', labId);
  }

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/cases/:id
router.get('/:id', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('cases')
    .select(CASE_SELECT)
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Case not found' });
  res.json(data);
});

// POST /api/cases — create case (dentist or technician)
router.post('/', auth, async (req, res) => {
  const role = await getProfileRole(req.user.id);
  const { lab_id, service_id, patient_ref, notes, shade, doctor_name, doctor_phone, clinic_name } = req.body;

  let insertLabId  = lab_id;
  let insertDentistId = null;

  if (role === 'dentist') {
    if (!lab_id || !service_id) return res.status(400).json({ error: 'lab_id and service_id are required' });
    insertDentistId = req.user.id;
  } else {
    // Tech creates on behalf of a doctor
    if (!service_id) return res.status(400).json({ error: 'service_id is required' });
    if (!doctor_name?.trim()) return res.status(400).json({ error: 'doctor_name is required' });
    insertLabId = await getLabId(req.user.id);
    if (!insertLabId) return res.status(404).json({ error: 'No lab found. Set up your lab profile first.' });
  }

  const { data, error } = await supabase
    .from('cases')
    .insert({
      lab_id: insertLabId,
      dentist_id: insertDentistId,
      service_id,
      patient_ref,
      notes,
      shade,
      doctor_name:  doctor_name  || null,
      doctor_phone: doctor_phone || null,
      clinic_name:  clinic_name  || null,
    })
    .select(CASE_SELECT)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const opener = role === 'dentist' ? 'Case opened.' : `Case opened for Dr. ${doctor_name}.`;
  await supabase.from('messages').insert({
    case_id: data.id,
    sender_id: req.user.id,
    kind: 'system',
    body: opener,
  });

  res.status(201).json(data);
});

// PATCH /api/cases/:id/stage — advance stage (technician)
router.patch('/:id/stage', auth, async (req, res) => {
  const { stage } = req.body;
  if (typeof stage !== 'number') return res.status(400).json({ error: 'stage must be a number' });

  const { data: caseData } = await supabase
    .from('cases')
    .select('lab_id, service_id')
    .eq('id', req.params.id)
    .single();
  if (!caseData) return res.status(404).json({ error: 'Case not found' });

  const { data: lab } = await supabase.from('labs').select('owner_id').eq('id', caseData.lab_id).single();
  if (!lab || lab.owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { data: service } = await supabase.from('services').select('stages').eq('id', caseData.service_id).single();

  const { data, error } = await supabase
    .from('cases')
    .update({ stage })
    .eq('id', req.params.id)
    .select(CASE_SELECT)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const stageName = service?.stages?.[stage] || `Stage ${stage + 1}`;
  await supabase.from('messages').insert({
    case_id: req.params.id,
    sender_id: req.user.id,
    kind: 'system',
    body: `Status updated to "${stageName}".`,
  });

  res.json(data);
});

// PATCH /api/cases/:id/payment
router.patch('/:id/payment', auth, async (req, res) => {
  const { payment_status, payment_amount } = req.body;
  const { data, error } = await supabase
    .from('cases')
    .update({ payment_status, payment_amount })
    .eq('id', req.params.id)
    .select(CASE_SELECT)
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// PATCH /api/cases/:id/archive
router.patch('/:id/archive', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('cases')
    .update({ archived: true })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
