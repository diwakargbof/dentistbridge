const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('[chairside] SUPABASE_URL or SUPABASE_SERVICE_KEY not set — API calls will fail.');
}

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder-key',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

module.exports = supabase;
