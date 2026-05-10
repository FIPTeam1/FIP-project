import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * GET /api/ingredients
 * Query: search
 */
router.get('/', async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';

  let query = supabase
    .from('ingredient_glossary')
    .select(
      `
      id, name, image_url,
      ingredient_substitutes (id, name, price_range, unit, image_url)
    `
    )
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  // Rename ingredient_substitutes → substitutes to match frontend types
  const normalized = (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    image_url: item.image_url,
    substitutes: (item as Record<string, unknown>)['ingredient_substitutes'] ?? [],
  }));

  res.json({ data: normalized, error: null });
});

export default router;
