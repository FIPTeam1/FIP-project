import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

/**
 * GET /api/recipes/:id/comments
 */
router.get('/', async (req: Request, res: Response) => {
  const { id: recipe_id } = req.params;

  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      id, content, parent_comment_id, created_at, updated_at,
      profiles!comments_user_id_fkey (id, username, first_name, last_name, avatar_url)
    `
    )
    .eq('recipe_id', recipe_id)
    .order('created_at', { ascending: true });

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  res.json({ data, error: null });
});

/**
 * POST /api/recipes/:id/comments
 * body: { content, parent_comment_id? }
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { id: recipe_id } = req.params;
  const { content, parent_comment_id } = req.body as {
    content?: string;
    parent_comment_id?: string;
  };

  if (!content || content.trim() === '') {
    res.status(400).json({ data: null, error: 'content is required' });
    return;
  }

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

  const { data, error } = await supabase
    .from('comments')
    .insert({
      recipe_id,
      user_id: req.user!.id,
      content: content.trim(),
      parent_comment_id: parent_comment_id ?? null,
    })
    .select(
      `
      id, content, parent_comment_id, created_at, updated_at,
      profiles!comments_user_id_fkey (id, username, first_name, last_name, avatar_url)
    `
    )
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  res.status(201).json({ data, error: null });
});

/**
 * PUT /api/comments/:id  (mounted separately)
 */
export async function updateComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { content } = req.body as { content?: string };

  if (!content || content.trim() === '') {
    res.status(400).json({ data: null, error: 'content is required' });
    return;
  }

  const { data: existing, error: fetchError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    res.status(404).json({ data: null, error: 'Comment not found' });
    return;
  }

  if ((existing as any).user_id !== req.user!.id) {
    res.status(403).json({ data: null, error: 'Forbidden: you do not own this comment' });
    return;
  }

  const { data, error } = await supabase
    .from('comments')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ data: null, error: error.message });
    return;
  }

  res.json({ data, error: null });
}

/**
 * DELETE /api/comments/:id  (mounted separately)
 */
export async function deleteComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const { data: existing, error: fetchError } = await supabase
    .from('comments')
    .select('user_id, recipe_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    res.status(404).json({ data: null, error: 'Comment not found' });
    return;
  }

  const comment = existing as { user_id: string; recipe_id: string };

  // Allow deletion by comment owner or recipe owner
  let canDelete = comment.user_id === req.user!.id;

  if (!canDelete) {
    const { data: recipe } = await supabase
      .from('recipes')
      .select('creator_id')
      .eq('id', comment.recipe_id)
      .single();

    if (recipe && (recipe as any).creator_id === req.user!.id) {
      canDelete = true;
    }
  }

  if (!canDelete) {
    res.status(403).json({ data: null, error: 'Forbidden: insufficient permissions to delete this comment' });
    return;
  }

  const { error: deleteError } = await supabase.from('comments').delete().eq('id', id);

  if (deleteError) {
    res.status(500).json({ data: null, error: deleteError.message });
    return;
  }

  res.json({ data: { message: 'Comment deleted successfully' }, error: null });
}

export default router;
