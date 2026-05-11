const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[supabase] SUPABASE_URL or SUPABASE_SECRET_KEY missing in .env — most endpoints will fail.'
  );
}

// Server-side client uses the service_role key, so it bypasses RLS.
// We still verify users with `auth.getUser(token)` in middleware before
// performing any user-scoped writes.
const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: { Authorization: `Bearer ${supabaseKey || ''}` },
  },
});

module.exports = supabase;
