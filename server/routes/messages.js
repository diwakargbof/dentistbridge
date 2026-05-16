const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

// GET /api/messages/:caseId
router.get('/:caseId', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(id, full_name, role)
    `)
    .eq('case_id', req.params.caseId)
    .is('deleted_at', null)
    .order('created_at');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /api/messages/:caseId
router.post('/:caseId', auth, async (req, res) => {
  const { body, kind = 'text', metadata = {} } = req.body;
  if (!body && kind === 'text') return res.status(400).json({ error: 'body is required for text messages' });

  const { data, error } = await supabase
    .from('messages')
    .insert({
      case_id: req.params.caseId,
      sender_id: req.user.id,
      body,
      kind,
      metadata,
    })
    .select(`*, sender:profiles(id, full_name, role)`)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/messages/:id (soft delete)
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('sender_id', req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
