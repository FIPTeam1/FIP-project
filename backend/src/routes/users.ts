import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/users/me/saved
 * Return saved recipes for the authenticated user.
 * MUST be registered BEFORE /api/users/:username to avoid route conflict.
 */
router.get('/me/saved', requireAuth, async (req: Request, res: Response) => {
  const user_id = req.user!.id;

  const { data, error } = await supabase
    .from('saved_recipes')
    .select(
      `
      created_at,
      recipes (
        id, title, description, image_url, location_of_origin, servings, time_duration,
        creator_id, is_draft, created_at, updated_at,
        profiles!recipes_creator_id_fkey (id, username, first_name, last_name, avatar_url)
      )
    `
    )
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  // Flatten to just the recipe objects
  const recipes = (data ?? []).map((row: any) => row.recipes).filter(Boolean);
  res.json({ data: recipes, error: null });
});

/**
 * PUT /api/users/me
 * Update the authenticated user's profile.
 */
router.put('/me', requireAuth, async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const { first_name, last_name, bio, location, avatar_url } = req.body as {
    first_name?: string;
    last_name?: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
  };

  const updatePayload: Record<string, unknown> = {};
  if (first_name !== undefined) updatePayload.first_name = first_name;
  if (last_name !== undefined) updatePayload.last_name = last_name;
  if (bio !== undefined) updatePayload.bio = bio;
  if (location !== undefined) updatePayload.location = location;
  if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url;

  if (Object.keys(updatePayload).length === 0) {
    res.status(400).json({ data: null, error: 'No updatable fields provided' });
    return;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user_id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  res.json({ data, error: null });
});

/**
 * GET /api/users/:username
 * Public profile with average_rating placeholder.
 */
router.get('/:username', async (req: Request, res: Response) => {
  const { username } = req.params;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, first_name, last_name, avatar_url, bio, location, created_at')
    .eq('username', username)
    .single();

  if (error || !profile) {
    res.status(404).json({ data: null, error: 'User not found' });
    return;
  }

  // Count published recipes
  const { count: recipeCount } = await supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', (profile as any).id)
    .eq('is_draft', false);

  res.json({
    data: {
      ...profile,
      recipe_count: recipeCount ?? 0,
      average_rating: null,
    },
    error: null,
  });
});

/**
 * GET /api/users/:username/recipes
 * Public recipes by a specific user.
 */
router.get('/:username/recipes', async (req: Request, res: Response) => {
  const { username } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
  const offset = (page - 1) * limit;

  // Resolve username → id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (profileError || !profile) {
    res.status(404).json({ data: null, error: 'User not found' });
    return;
  }

  const { data, error, count } = await supabase
    .from('recipes')
    .select(
      `
      id, title, description, image_url, location_of_origin, servings, time_duration,
      creator_id, is_draft, created_at, updated_at,
      profiles!recipes_creator_id_fkey (id, username, first_name, last_name, avatar_url)
    `,
      { count: 'exact' }
    )
    .eq('creator_id', (profile as any).id)
    .eq('is_draft', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  res.json({ data, total: count ?? 0, page, limit, error: null });
});

export default router;
