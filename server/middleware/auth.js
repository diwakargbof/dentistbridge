// Dev-mode auth: Bearer token IS the user ID (set by phone login).
// Replace with Supabase JWT verification once real auth is enabled.
function auth(req, res, next) {
  const userId = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.user = { id: userId };
  next();
}

module.exports = auth;
