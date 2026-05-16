require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Serve runtime config to inject Supabase keys without exposing them in the bundle
app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.CHAIRSIDE_CONFIG = ${JSON.stringify({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  })};`);
});

// API routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/cases',    require('./routes/cases'));
app.use('/api/labs',     require('./routes/labs'));
app.use('/api/services', require('./routes/services'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/shade',    require('./routes/shade'));
app.use('/api/upload',   require('./routes/upload'));

// Serve compiled frontend
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use(express.static(path.join(__dirname, '..', 'src')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Chairside running at http://localhost:${PORT}`);
});
