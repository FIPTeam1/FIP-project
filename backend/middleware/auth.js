const supabase = require('../lib/supabase');

/**
 * Verifies the `Authorization: Bearer <jwt>` header against Supabase auth
 * and attaches the resolved user to `req.user` for downstream handlers.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Missing or malformed Authorization header' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user;
    req.token = token;
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Auth verification failed' });
  }
}

module.exports = { requireAuth };
