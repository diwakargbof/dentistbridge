const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

// GET /api/labs
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('labs')
    .select(`
      *,
      owner:profiles(id, full_name),
      services(id, title, description, price, stages, active)
    `)
    .order('rating', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/labs/mine — technician's own lab
router.get('/mine', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('labs')
    .select(`*, services(*)`)
    .eq('owner_id', req.user.id)
    .single();
  if (error) return res.status(404).json({ error: 'No lab found' });
  res.json(data);
});

// PATCH /api/labs/mine
router.patch('/mine', auth, async (req, res) => {
  const { name, city, bio, turnaround } = req.body;
  const { data, error } = await supabase
    .from('labs')
    .update({ name, city, bio, turnaround })
    .eq('owner_id', req.user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/labs/:id
router.get('/:id', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('labs')
    .select(`
      *,
      owner:profiles(id, full_name, phone, city),
      services(id, title, description, price, stages, active)
    `)
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Lab not found' });
  res.json(data);
});

module.exports = router;
