const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

async function getMyLabId(userId) {
  const { data } = await supabase.from('labs').select('id').eq('owner_id', userId).single();
  return data?.id;
}

// GET /api/services/lab/:labId
router.get('/lab/:labId', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('lab_id', req.params.labId)
    .eq('active', true)
    .order('created_at');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/services/mine — technician's own services (all, including inactive)
router.get('/mine', auth, async (req, res) => {
  const labId = await getMyLabId(req.user.id);
  if (!labId) return res.json([]);

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('lab_id', labId)
    .order('created_at');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /api/services
router.post('/', auth, async (req, res) => {
  const labId = await getMyLabId(req.user.id);
  if (!labId) return res.status(404).json({ error: 'No lab found. Complete your profile first.' });

  const { title, description, price, stages } = req.body;
  if (!title || !price || !stages?.length) {
    return res.status(400).json({ error: 'title, price, and stages are required' });
  }

  const { data, error } = await supabase
    .from('services')
    .insert({ lab_id: labId, title, description, price, stages })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/services/:id
router.patch('/:id', auth, async (req, res) => {
  const labId = await getMyLabId(req.user.id);
  const { title, description, price, stages, active } = req.body;

  const { data, error } = await supabase
    .from('services')
    .update({ title, description, price, stages, active })
    .eq('id', req.params.id)
    .eq('lab_id', labId)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/services/:id
router.delete('/:id', auth, async (req, res) => {
  const labId = await getMyLabId(req.user.id);
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', req.params.id)
    .eq('lab_id', labId);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

// GET /api/services/:id/templates
router.get('/:id/templates', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('service_id', req.params.id)
    .order('stage_index');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// PUT /api/services/:id/templates — replace all templates for a service
router.put('/:id/templates', auth, async (req, res) => {
  const labId = await getMyLabId(req.user.id);
  const { templates } = req.body; // [{ stage_index, body }]

  await supabase.from('message_templates').delete().eq('service_id', req.params.id);

  if (!templates?.length) return res.json([]);

  const rows = templates.map(t => ({
    service_id: req.params.id,
    lab_id: labId,
    stage_index: t.stage_index,
    body: t.body,
  }));

  const { data, error } = await supabase.from('message_templates').insert(rows).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
