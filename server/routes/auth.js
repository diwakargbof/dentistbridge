const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

// Phone → Supabase user UUID. Only the IDs need to be in env vars.
const PHONE_TO_ID = {
  '8919744177': process.env.PROFILE_A_ID || 'static-dent-anaya',
  '9440134493': process.env.PROFILE_B_ID || 'static-tech-vikram',
};

async function fetchProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('[fetchProfile] Supabase error:', error.message, '| id:', id);
    return { _error: error.message };
  }
  return data;
}

// POST /api/auth/phone-login
router.post('/phone-login', async (req, res) => {
  const phone = (req.body.phone || '').replace(/\D/g, '');
  const id = PHONE_TO_ID[phone];
  if (!id) return res.status(401).json({ error: 'Phone number not recognised.' });

  const profile = await fetchProfile(id);
  if (!profile) return res.status(404).json({ error: 'Profile row not found. Check PROFILE_A_ID / PROFILE_B_ID match real UUIDs in the profiles table.' });
  if (profile._error) return res.status(500).json({ error: `Supabase error: ${profile._error}. Check SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.` });

  res.json({ profile, token: id });
});

// GET /api/auth/me  (token → profile; used after page reload)
router.get('/me', authMiddleware, async (req, res) => {
  const profile = await fetchProfile(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

module.exports = router;
