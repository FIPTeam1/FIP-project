const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[supabase] FATAL: SUPABASE_URL or SUPABASE_SECRET_KEY environment variable is missing.\n' +
    '  SUPABASE_URL present: ' + !!supabaseUrl + '\n' +
    '  SUPABASE_SECRET_KEY present: ' + !!supabaseKey
  );
  process.exit(1);
}

// Server-side client uses the service_role key, so it bypasses RLS.
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: { Authorization: `Bearer ${supabaseKey}` },
  },
});

module.exports = supabase;
