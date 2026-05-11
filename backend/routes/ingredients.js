const express = require('express');
const supabase = require('../lib/supabase');

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

module.exports = router;
