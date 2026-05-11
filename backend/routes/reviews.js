const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /review   (auth required)
 * Body: { recipe_id, rating, review?, name? }
 * One review per (user, recipe) pair.
 */
router.post('/review', requireAuth, async (req, res) => {
  const { recipe_id, rating, review, name } = req.body || {};

  if (!recipe_id) {
    return res.status(400).json({ error: 'recipe_id is required' });
  }
  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return res
      .status(400)
      .json({ error: 'rating is required and must be between 1 and 5' });
  }

  // ensure the recipe exists
  const { data: recipe, error: recipeErr } = await supabase
    .from('Recipe')
    .select('recipe_id')
    .eq('recipe_id', recipe_id)
    .maybeSingle();
  if (recipeErr) return res.status(500).json({ error: recipeErr.message });
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  // enforce one-review-per-user-per-recipe
  const { data: existing, error: existingErr } = await supabase
    .from('Ratings')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('recipe_id', recipe_id)
    .maybeSingle();
  if (existingErr) return res.status(500).json({ error: existingErr.message });
  if (existing) {
    return res
      .status(409)
      .json({ error: 'You have already reviewed this recipe' });
  }

  const { data, error } = await supabase
    .from('Ratings')
    .insert({
      user_id: req.user.id,
      recipe_id,
      rating: numericRating,
      review: review ?? null,
      name: name ?? null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

/**
 * POST /delete-review   (auth required)
 * Body: { recipe_id }
 * Deletes the authenticated user's review for the given recipe.
 */
router.post('/delete-review', requireAuth, async (req, res) => {
  const recipeId = req.body?.recipe_id;
  if (!recipeId) {
    return res.status(400).json({ error: 'recipe_id is required' });
  }

  const { data, error } = await supabase
    .from('Ratings')
    .delete()
    .eq('user_id', req.user.id)
    .eq('recipe_id', recipeId)
    .select('id');

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Review not found' });
  }
  return res.json({ success: true });
});

/**
 * GET /reviews?recipe_id=...
 * Public list of reviews for a recipe.
 */
router.get('/reviews', async (req, res) => {
  const recipeId = req.query.recipe_id;
  if (!recipeId) {
    return res
      .status(400)
      .json({ error: 'recipe_id query parameter is required' });
  }

  const { data, error } = await supabase
    .from('Ratings')
    .select('*')
    .eq('recipe_id', recipeId);

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

module.exports = router;
