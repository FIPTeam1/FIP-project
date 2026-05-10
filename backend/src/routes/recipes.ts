import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/recipes
 * Query: search, region, page, limit
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const region = (req.query.region as string) || '';
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('recipes')
    .select(
      `
      id, title, description, image_url, location_of_origin, servings, time_duration,
      creator_id, is_draft, created_at, updated_at,
      profiles!recipes_creator_id_fkey (id, username, first_name, last_name, avatar_url)
    `,
      { count: 'exact' }
    )
    .eq('is_draft', false);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (region) {
    query = query.ilike('location_of_origin', `%${region}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  res.json({
    data,
    total: count ?? 0,
    page,
    limit,
    error: null,
  });
});

/**
 * GET /api/recipes/:id
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(
      `
      id, title, description, image_url, location_of_origin, servings, time_duration,
      creator_id, is_draft, created_at, updated_at,
      profiles!recipes_creator_id_fkey (id, username, first_name, last_name, avatar_url, bio, location),
      recipe_ingredients (id, quantity, measurement, ingredient_name, order_index),
      recipe_instructions (id, step_number, description),
      recipe_family_history (id, creator_name, family_name, ancestral_origin, story, photo_url)
    `
    )
    .eq('id', id)
    .single();

  if (error || !recipe) {
    res.status(404).json({ data: null, error: 'Recipe not found' });
    return;
  }

  // Check if recipe is a draft and user is not the creator
  const recipeData = recipe as typeof recipe & { is_draft: boolean; creator_id: string };
  if (recipeData.is_draft && req.user?.id !== recipeData.creator_id) {
    res.status(404).json({ data: null, error: 'Recipe not found' });
    return;
  }

  // Sort sub-tables
  const ingredients = (recipeData as any).recipe_ingredients ?? [];
  const instructions = (recipeData as any).recipe_instructions ?? [];
  ingredients.sort((a: any, b: any) => a.order_index - b.order_index);
  instructions.sort((a: any, b: any) => a.step_number - b.step_number);

  // Check is_saved for authenticated user
  let is_saved = false;
  if (req.user) {
    const { data: saved } = await supabase
      .from('saved_recipes')
      .select('recipe_id')
      .eq('user_id', req.user.id)
      .eq('recipe_id', id)
      .maybeSingle();
    is_saved = !!saved;
  }

  res.json({
    data: {
      ...recipe,
      recipe_ingredients: ingredients,
      recipe_instructions: instructions,
      is_saved,
      average_rating: null,
    },
    error: null,
  });
});

/**
 * POST /api/recipes
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const {
    title,
    description,
    image_url,
    location_of_origin,
    servings,
    time_duration,
    is_draft,
    ingredients,
    instructions,
    family_history,
  } = req.body as {
    title?: string;
    description?: string;
    image_url?: string;
    location_of_origin?: string;
    servings?: number;
    time_duration?: string;
    is_draft?: boolean;
    ingredients?: Array<{ quantity?: string; measurement?: string; ingredient_name: string; order_index?: number }>;
    instructions?: Array<{ step_number: number; description: string }>;
    family_history?: {
      creator_name?: string;
      family_name?: string;
      ancestral_origin?: string;
      story?: string;
      photo_url?: string;
    };
  };

  if (!title) {
    res.status(400).json({ data: null, error: 'title is required' });
    return;
  }

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      title,
      description,
      image_url,
      location_of_origin,
      servings,
      time_duration,
      creator_id: req.user!.id,
      is_draft: is_draft ?? false,
    })
    .select()
    .single();

  if (recipeError || !recipe) {
    res.status(500).json({ data: null, error: recipeError?.message ?? 'Failed to create recipe' });
    return;
  }

  const recipeId = (recipe as any).id as string;

  // Insert ingredients
  if (ingredients && ingredients.length > 0) {
    const { error: ingError } = await supabase.from('recipe_ingredients').insert(
      ingredients.map((ing, idx) => ({
        recipe_id: recipeId,
        quantity: ing.quantity,
        measurement: ing.measurement,
        ingredient_name: ing.ingredient_name,
        order_index: ing.order_index ?? idx,
      }))
    );
    if (ingError) {
      res.status(500).json({ data: null, error: ingError.message });
      return;
    }
  }

  // Insert instructions
  if (instructions && instructions.length > 0) {
    const { error: insError } = await supabase.from('recipe_instructions').insert(
      instructions.map((ins) => ({
        recipe_id: recipeId,
        step_number: ins.step_number,
        description: ins.description,
      }))
    );
    if (insError) {
      res.status(500).json({ data: null, error: insError.message });
      return;
    }
  }

  // Insert family history
  if (family_history) {
    const { error: fhError } = await supabase.from('recipe_family_history').insert({
      recipe_id: recipeId,
      ...family_history,
    });
    if (fhError) {
      res.status(500).json({ data: null, error: fhError.message });
      return;
    }
  }

  res.status(201).json({ data: recipe, error: null });
});

/**
 * PUT /api/recipes/:id
 */
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('recipes')
    .select('creator_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    res.status(404).json({ data: null, error: 'Recipe not found' });
    return;
  }

  if ((existing as any).creator_id !== req.user!.id) {
    res.status(403).json({ data: null, error: 'Forbidden: you do not own this recipe' });
    return;
  }

  const {
    title,
    description,
    image_url,
    location_of_origin,
    servings,
    time_duration,
    is_draft,
    ingredients,
    instructions,
    family_history,
  } = req.body as {
    title?: string;
    description?: string;
    image_url?: string;
    location_of_origin?: string;
    servings?: number;
    time_duration?: string;
    is_draft?: boolean;
    ingredients?: Array<{ quantity?: string; measurement?: string; ingredient_name: string; order_index?: number }>;
    instructions?: Array<{ step_number: number; description: string }>;
    family_history?: {
      creator_name?: string;
      family_name?: string;
      ancestral_origin?: string;
      story?: string;
      photo_url?: string;
    } | null;
  };

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updatePayload.title = title;
  if (description !== undefined) updatePayload.description = description;
  if (image_url !== undefined) updatePayload.image_url = image_url;
  if (location_of_origin !== undefined) updatePayload.location_of_origin = location_of_origin;
  if (servings !== undefined) updatePayload.servings = servings;
  if (time_duration !== undefined) updatePayload.time_duration = time_duration;
  if (is_draft !== undefined) updatePayload.is_draft = is_draft;

  const { data: updated, error: updateError } = await supabase
    .from('recipes')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    res.status(500).json({ data: null, error: updateError.message });
    return;
  }

  // Replace ingredients if provided
  if (ingredients !== undefined) {
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
    if (ingredients.length > 0) {
      await supabase.from('recipe_ingredients').insert(
        ingredients.map((ing, idx) => ({
          recipe_id: id,
          quantity: ing.quantity,
          measurement: ing.measurement,
          ingredient_name: ing.ingredient_name,
          order_index: ing.order_index ?? idx,
        }))
      );
    }
  }

  // Replace instructions if provided
  if (instructions !== undefined) {
    await supabase.from('recipe_instructions').delete().eq('recipe_id', id);
    if (instructions.length > 0) {
      await supabase.from('recipe_instructions').insert(
        instructions.map((ins) => ({
          recipe_id: id,
          step_number: ins.step_number,
          description: ins.description,
        }))
      );
    }
  }

  // Upsert family history if provided
  if (family_history !== undefined) {
    await supabase.from('recipe_family_history').delete().eq('recipe_id', id);
    if (family_history !== null) {
      await supabase.from('recipe_family_history').insert({ recipe_id: id, ...family_history });
    }
  }

  res.json({ data: updated, error: null });
});

/**
 * DELETE /api/recipes/:id
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: existing, error: fetchError } = await supabase
    .from('recipes')
    .select('creator_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    res.status(404).json({ data: null, error: 'Recipe not found' });
    return;
  }

  if ((existing as any).creator_id !== req.user!.id) {
    res.status(403).json({ data: null, error: 'Forbidden: you do not own this recipe' });
    return;
  }

  const { error: deleteError } = await supabase.from('recipes').delete().eq('id', id);

  if (deleteError) {
    res.status(500).json({ data: null, error: deleteError.message });
    return;
  }

  res.json({ data: { message: 'Recipe deleted successfully' }, error: null });
});

export default router;
