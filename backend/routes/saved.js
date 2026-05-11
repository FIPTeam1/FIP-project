const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /save-recipe?recipe_id=...   (auth required)
 * Bookmarks a recipe for the authenticated user. Idempotent — saving an already
 * saved recipe returns the existing row instead of creating a duplicate.
 *
 * NOTE: this uses GET to match the spec in API.md, but POST would be more
 * conventional since this mutates state.
 */
router.get('/save-recipe', requireAuth, async (req, res) => {
  const recipeId = req.query.recipe_id;
  if (!recipeId) {
    return res
      .status(400)
      .json({ error: 'recipe_id query parameter is required' });
  }

  // make sure the recipe exists first
  const { data: recipe, error: recipeErr } = await supabase
    .from('Recipe')
    .select('recipe_id')
    .eq('recipe_id', recipeId)
    .maybeSingle();
  if (recipeErr) return res.status(500).json({ error: recipeErr.message });
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  const { data: existing, error: existingErr } = await supabase
    .from('SavedRecipes')
    .select('id, user_id, recipe_id')
    .eq('user_id', req.user.id)
    .eq('recipe_id', recipeId)
    .maybeSingle();
  if (existingErr) return res.status(500).json({ error: existingErr.message });
  if (existing) return res.json({ success: true, saved: existing });

  const { data, error } = await supabase
    .from('SavedRecipes')
    .insert({ user_id: req.user.id, recipe_id: recipeId })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true, saved: data });
});

/**
 * POST /unsave-recipe   (auth required)
 * Body: { recipe_id }
 */
router.post('/unsave-recipe', requireAuth, async (req, res) => {
  const recipeId = req.body?.recipe_id;
  if (!recipeId) {
    return res.status(400).json({ error: 'recipe_id is required' });
  }

  const { data, error } = await supabase
    .from('SavedRecipes')
    .delete()
    .eq('user_id', req.user.id)
    .eq('recipe_id', recipeId)
    .select('id');

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Saved recipe not found' });
  }
  return res.json({ success: true });
});

/**
 * GET /me/saved   (auth required)
 * Returns the authenticated user's saved recipes joined with Recipe rows.
 * (Manual join — the schema doesn't declare a FK from SavedRecipes.recipe_id.)
 */
router.get('/me/saved', requireAuth, async (req, res) => {
  const { data: rows, error } = await supabase
    .from('SavedRecipes')
    .select('id, recipe_id')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  if (!rows || rows.length === 0) return res.json([]);

  const recipeIds = rows.map((r) => r.recipe_id).filter((v) => v != null);
  if (recipeIds.length === 0) {
    return res.json(rows.map((r) => ({ ...r, recipe: null })));
  }

  const { data: recipes, error: recipesErr } = await supabase
    .from('Recipe')
    .select('*')
    .in('recipe_id', recipeIds);
  if (recipesErr) return res.status(500).json({ error: recipesErr.message });

  const byId = new Map(recipes.map((r) => [r.recipe_id, r]));
  return res.json(
    rows.map((row) => ({ ...row, recipe: byId.get(row.recipe_id) ?? null }))
  );
});

module.exports = router;
