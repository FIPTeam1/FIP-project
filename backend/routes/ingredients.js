const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /ingredients
 * Optional query: ?items=N — caps the number of rows returned.
 */
router.get('/ingredients', async (req, res) => {
  let query = supabase.from('Ingredients').select('id, name, image, substitutes');

  const items = parseInt(req.query.items, 10);
  if (Number.isFinite(items) && items > 0) {
    query = query.limit(items);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

/**
 * POST /create-ingredient   (auth required)
 * Body: { name, image?, substitutes? }
 * Creates a new ingredient. Returns 409 if the name already exists.
 */
router.post('/create-ingredient', requireAuth, async (req, res) => {
  const { name, image, substitutes } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const cleanName = name.trim();

  // Check for duplicate (case-insensitive)
  const { data: existing } = await supabase
    .from('Ingredients')
    .select('id, name')
    .ilike('name', cleanName)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'Ingredient already exists', ingredient: existing });
  }

  // Ingredients table has no auto-increment sequence — compute next id manually.
  const { data: maxRow } = await supabase
    .from('Ingredients')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextId = (maxRow?.id ?? 0) + 1;

  const { data, error } = await supabase
    .from('Ingredients')
    .insert({
      id: nextId,
      name: cleanName,
      image: image ?? null,
      substitutes: substitutes ?? null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

module.exports = router;
