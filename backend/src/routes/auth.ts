import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * POST /api/auth/register
 * body: { email, password, username, first_name, last_name }
 */
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, username, first_name, last_name } = req.body as {
    email?: string;
    password?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };

  if (!email || !password || !username) {
    res.status(400).json({ data: null, error: 'email, password, and username are required' });
    return;
  }

  // Check username availability first
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (existingProfile) {
    res.status(409).json({ data: null, error: 'Username already taken' });
    return;
  }

  // Create auth user — the trigger handle_new_user will create the profile row
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { username, first_name, last_name },
    email_confirm: true,
  });

  if (createError || !createData.user) {
    res.status(400).json({ data: null, error: createError?.message ?? 'Failed to create user' });
    return;
  }

  // Sign in immediately to return a token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.session) {
    res.status(500).json({ data: null, error: 'User created but sign-in failed. Please log in manually.' });
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', createData.user.id)
    .single();

  res.status(201).json({
    data: {
      token: signInData.session.access_token,
      user: {
        id: createData.user.id,
        email: createData.user.email,
        profile,
      },
    },
    error: null,
  });
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ data: null, error: 'email and password are required' });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    res.status(401).json({ data: null, error: error?.message ?? 'Invalid credentials' });
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  res.json({
    data: {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        profile,
      },
    },
    error: null,
  });
});

/**
 * POST /api/auth/logout
 * The client removes the token; this endpoint is a no-op acknowledgment.
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ data: { message: 'Logged out successfully' }, error: null });
});

export default router;
