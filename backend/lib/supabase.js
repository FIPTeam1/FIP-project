const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[supabase] SUPABASE_URL or SUPABASE_SECRET_KEY missing in .env — most endpoints will fail.'
  );
}

// Service-role client: bypasses RLS for all database operations.
// The `global.headers` option explicitly sets the Authorization header so
// Supabase PostgREST recognises the service_role JWT and skips RLS.
const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseKey || ''}`,
    },
  },
});

module.exports = supabase;
