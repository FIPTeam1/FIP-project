const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /follow?user_id=<target>   (auth required)
 * Authenticated user starts following the target user.
 */
router.get('/follow', requireAuth, async (req, res) => {
  const target = req.query.user_id;
  if (!target) {
    return res
      .status(400)
      .json({ error: 'user_id query parameter is required' });
  }
  if (target === req.user.id) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  // confirm the target user exists
  const { data: targetUser, error: lookupErr } = await supabase
    .from('Users')
    .select('id')
    .eq('id', target)
    .maybeSingle();
  if (lookupErr) return res.status(500).json({ error: lookupErr.message });
  if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

  const { data: existing, error: existingErr } = await supabase
    .from('UserFollowing')
    .select('id')
    .eq('user_id_from', req.user.id)
    .eq('user_id_to', target)
    .maybeSingle();
  if (existingErr) return res.status(500).json({ error: existingErr.message });
  if (existing) return res.json({ success: true, follow: existing });

  const { data, error } = await supabase
    .from('UserFollowing')
    .insert({ user_id_from: req.user.id, user_id_to: target })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true, follow: data });
});

/**
 * GET /unfollow?user_id=<target>   (auth required)
 */
router.get('/unfollow', requireAuth, async (req, res) => {
  const target = req.query.user_id;
  if (!target) {
    return res
      .status(400)
      .json({ error: 'user_id query parameter is required' });
  }

  const { data, error } = await supabase
    .from('UserFollowing')
    .delete()
    .eq('user_id_from', req.user.id)
    .eq('user_id_to', target)
    .select('id');

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'You are not following this user' });
  }
  return res.json({ success: true });
});

module.exports = router;
