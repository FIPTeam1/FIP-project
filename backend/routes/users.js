const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const PUBLIC_USER_COLS =
  'id, first_name, last_name, profile_picture, rating, description';

/**
 * GET /me   (auth required)
 * Profile of the currently authenticated user.
 */
router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('Users')
    .select(PUBLIC_USER_COLS)
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    profile: data,
    auth: { id: req.user.id, email: req.user.email },
  });
});

/**
 * GET /user/:id — public profile lookup.
 */
router.get('/user/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('Users')
    .select(PUBLIC_USER_COLS)
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found' });
  return res.json(data);
});

/**
 * GET /user/:id/recipes — recipes posted by a user.
 */
router.get('/user/:id/recipes', async (req, res) => {
  const { data, error } = await supabase
    .from('Recipe')
    .select('*')
    .eq('user_id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

async function hydrateUsers(rows, idField) {
  if (!rows || rows.length === 0) return [];
  const ids = rows.map((r) => r[idField]).filter((v) => v != null);
  if (ids.length === 0) return rows.map((r) => ({ ...r, user: null }));

  const { data: users, error } = await supabase
    .from('Users')
    .select('id, first_name, last_name, profile_picture')
    .in('id', ids);
  if (error) throw error;

  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.map((r) => ({ ...r, user: byId.get(r[idField]) ?? null }));
}

/**
 * GET /user/:id/followers — users following :id.
 */
router.get('/user/:id/followers', async (req, res) => {
  const { data, error } = await supabase
    .from('UserFollowing')
    .select('id, user_id_from')
    .eq('user_id_to', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  try {
    return res.json(await hydrateUsers(data, 'user_id_from'));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * GET /user/:id/following — users that :id is following.
 */
router.get('/user/:id/following', async (req, res) => {
  const { data, error } = await supabase
    .from('UserFollowing')
    .select('id, user_id_to')
    .eq('user_id_from', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  try {
    return res.json(await hydrateUsers(data, 'user_id_to'));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * POST /update-profile   (auth required)
 * Body: { first_name?, last_name?, profile_picture?, description? }
 */
router.post('/update-profile', requireAuth, async (req, res) => {
  const allowed = ['first_name', 'last_name', 'profile_picture', 'description'];
  const updates = {};
  for (const key of allowed) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates[key] = req.body[key];
    }
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'no valid fields to update' });
  }

  const { data, error } = await supabase
    .from('Users')
    .update(updates)
    .eq('id', req.user.id)
    .select(PUBLIC_USER_COLS)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

module.exports = router;
