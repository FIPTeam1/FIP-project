const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /family-history/:id
 */
router.get('/family-history/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { data, error } = await supabase
    .from('FamilyHistory')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Family history not found' });
  return res.json(data);
});

/**
 * POST /family-history    (auth required)
 * Body: { family_photo?, creator?, family_name_origin?, story? }
 * Defaults `creator` to the authenticated user's id when not provided.
 */
router.post('/family-history', requireAuth, async (req, res) => {
  const { family_photo, creator, family_name_origin, story } = req.body || {};

  const { data, error } = await supabase
    .from('FamilyHistory')
    .insert({
      family_photo: family_photo ?? null,
      creator: creator ?? req.user.id,
      family_name_origin: family_name_origin ?? null,
      story: story ?? null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

module.exports = router;
