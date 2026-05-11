const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const RECIPE_COLUMNS =
  'recipe_id, image, name, description, duration, location, type, ingredients, family_history_id, category, user_id';

/**
 * GET /recipes
 * Optional query: ?items=N — caps the number of recipes returned.
 */
router.get('/recipes', async (req, res) => {
  let query = supabase.from('Recipe').select(RECIPE_COLUMNS);

  const items = parseInt(req.query.items, 10);
  if (Number.isFinite(items) && items > 0) {
    query = query.limit(items);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

/**
 * GET /search-recipe?keyword=...
 * Case-insensitive partial match against name + description.
 */
router.get('/search-recipe', async (req, res) => {
  const keyword = (req.query.keyword || '').toString().trim();
  if (!keyword) {
    return res
      .status(400)
      .json({ error: 'keyword query parameter is required' });
  }

  // escape commas / parens so they aren't interpreted by PostgREST `or`.
  const safe = keyword.replace(/[,()]/g, ' ');

  const { data, error } = await supabase
    .from('Recipe')
    .select(RECIPE_COLUMNS)
    .or(
      `name.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`
    );

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

/**
 * GET /recipe/:id
 * Returns a single recipe and, when present, the linked family history.
 *
 * We don't use a PostgREST relational join here because the SCHEMA.md
 * doesn't declare a foreign key from Recipe.family_history_id to
 * FamilyHistory.id. Instead we fetch the family history in a follow-up query.
 */
router.get('/recipe/:id', async (req, res) => {
  const recipeId = parseInt(req.params.id, 10);
  if (!Number.isFinite(recipeId)) {
    return res.status(400).json({ error: 'Invalid recipe id' });
  }

  const { data: recipe, error } = await supabase
    .from('Recipe')
    .select(RECIPE_COLUMNS)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  let familyHistory = null;
  if (recipe.family_history_id != null) {
    const { data: fh } = await supabase
      .from('FamilyHistory')
      .select('*')
      .eq('id', recipe.family_history_id)
      .maybeSingle();
    familyHistory = fh ?? null;
  }

  return res.json({ ...recipe, family_history: familyHistory });
});

/**
 * POST /create-recipe   (auth required)
 * The authenticated user becomes the recipe owner; client should not pass user_id.
 */
router.post('/create-recipe', requireAuth, async (req, res) => {
  const {
    image,
    description,
    name,
    duration,
    location,
    ingredients,
    family_history_id,
    category,
    type,
  } = req.body || {};

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }

  const { data, error } = await supabase
    .from('Recipe')
    .insert({
      image: image ?? null,
      description: description ?? null,
      name,
      duration: duration ?? null,
      location: location ?? null,
      ingredients: ingredients ?? null,
      family_history_id: family_history_id ?? null,
      category: category ?? null,
      type: type ?? null,
      user_id: req.user.id,
    })
    .select(RECIPE_COLUMNS)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

/**
 * POST /delete-recipe   (auth required)
 * Body: { recipe_id }
 * Only deletes if the recipe is owned by the authenticated user.
 */
router.post('/delete-recipe', requireAuth, async (req, res) => {
  const recipeId = req.body?.recipe_id;
  if (!recipeId) {
    return res.status(400).json({ error: 'recipe_id is required' });
  }

  const { data, error } = await supabase
    .from('Recipe')
    .delete()
    .eq('recipe_id', recipeId)
    .eq('user_id', req.user.id)
    .select('recipe_id');

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res
      .status(404)
      .json({ error: 'Recipe not found or you are not the owner' });
  }
  return res.json({ success: true, recipe_id: data[0].recipe_id });
});

module.exports = router;
