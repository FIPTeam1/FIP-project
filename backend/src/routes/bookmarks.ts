import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

// This router is mounted at /api/recipes/:id with mergeParams: true
const router = Router({ mergeParams: true });

/**
 * POST /api/recipes/:id/save
 * Save (bookmark) a recipe for the authenticated user.
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { id: recipe_id } = req.params;
  const user_id = req.user!.id;

  // Verify recipe exists
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipe_id)
    .single();

  if (recipeError || !recipe) {
    res.status(404).json({ data: null, error: 'Recipe not found' });
    return;
  }

  // Upsert to avoid duplicate key errors
  const { error } = await supabase
    .from('saved_recipes')
    .upsert({ user_id, recipe_id }, { onConflict: 'user_id,recipe_id' });

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  res.status(201).json({ data: { message: 'Recipe saved successfully' }, error: null });
});

/**
 * DELETE /api/recipes/:id/save
 * Remove a saved recipe for the authenticated user.
 */
router.delete('/', requireAuth, async (req: Request, res: Response) => {
  const { id: recipe_id } = req.params;
  const user_id = req.user!.id;

  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', user_id)
    .eq('recipe_id', recipe_id);

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  res.json({ data: { message: 'Recipe unsaved successfully' }, error: null });
});

export default router;
