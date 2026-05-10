import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthProfile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
}

// Extend Express Request to carry user + profile
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      profile?: AuthProfile;
    }
  }
}

/**
 * requireAuth — hard gate, returns 401 if no valid token.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ data: null, error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ data: null, error: 'Invalid or expired token' });
    return;
  }

  req.user = { id: data.user.id, email: data.user.email ?? '' };

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    res.status(401).json({ data: null, error: 'User profile not found' });
    return;
  }

  req.profile = profile as AuthProfile;
  next();
}

/**
 * optionalAuth — attaches user/profile if token is present, but never blocks.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  const { data } = await supabase.auth.getUser(token);

  if (data.user) {
    req.user = { id: data.user.id, email: data.user.email ?? '' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      req.profile = profile as AuthProfile;
    }
  }

  next();
}
