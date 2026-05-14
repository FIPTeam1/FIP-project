const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /register
 * Body: { email, password, first_name, last_name? }
 * Creates the auth user and a matching row in the public Users table.
 */
router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body || {};
  if (!email || !password || !first_name) {
    return res
      .status(400)
      .json({ error: 'email, password, and first_name are required' });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name: last_name ?? null },
  });

  if (error) {
    const alreadyExists =
      /already.*registered/i.test(error.message) ||
      /already.*exists/i.test(error.message) ||
      error.status === 422;
    return res
      .status(alreadyExists ? 400 : 500)
      .json({ error: error.message });
  }

  const authUser = data.user;

  const { error: insertErr } = await supabase
    .from('Users')
    .insert({
      id: authUser.id,
      first_name,
      last_name: last_name ?? null,
    });

  if (insertErr) {
    // best-effort rollback so the auth account doesn't go orphaned
    await supabase.auth.admin.deleteUser(authUser.id).catch(() => {});
    return res.status(500).json({ error: insertErr.message });
  }

  return res.status(200).json({
    success: true,
    user: { id: authUser.id, email: authUser.email, first_name, last_name: last_name ?? null },
  });
});

/**
 * POST /login
 * Body: { email, password }
 * Returns the Supabase session (access + refresh token).
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.session) {
    return res
      .status(401)
      .json({ error: error?.message || 'Invalid credentials' });
  }

  return res.json({
    user: data.user,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    token_type: data.session.token_type,
  });
});

/**
 * POST /refresh
 * Body: { refresh_token }
 * Returns a new access_token + refresh_token pair.
 */
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body || {};
  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error || !data?.session) {
    return res.status(401).json({ error: error?.message || 'Session expired' });
  }

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  });
});

/**
 * POST /logout    (auth required)
 * Invalidates the bearer token server-side.
 */
router.post('/logout', requireAuth, async (req, res) => {
  const { error } = await supabase.auth.admin.signOut(req.token);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

module.exports = router;
