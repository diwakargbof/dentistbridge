require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Expose Supabase URL + anon key for client-side Realtime subscriptions
app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.BENCH_CLOUD = ${JSON.stringify({
    supabaseUrl:     (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  })};`);
});

// Bench API
app.use('/api/bench', require('./routes/bench'));

// Serve .jsx files as JavaScript so Babel standalone can fetch and transpile them
app.use((req, res, next) => {
  if (req.path.endsWith('.jsx')) res.type('application/javascript');
  next();
});

// Serve frontend files
app.use(express.static(path.join(__dirname, '..', 'src')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Bench running at http://localhost:${PORT}`);
});
