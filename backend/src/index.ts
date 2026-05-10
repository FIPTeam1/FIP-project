import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './routes/auth';
import recipesRouter from './routes/recipes';
import commentsRouter from './routes/comments';
import { updateComment, deleteComment } from './routes/comments';
import bookmarksRouter from './routes/bookmarks';
import usersRouter from './routes/users';
import ingredientsRouter from './routes/ingredients';
import { requireAuth } from './middleware/auth';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRouter);

// Recipe routes
app.use('/api/recipes', recipesRouter);

// Comments sub-resource (nested under recipes)
app.use('/api/recipes/:id/comments', commentsRouter);

// Bookmarks sub-resource (nested under recipes)
app.use('/api/recipes/:id/save', bookmarksRouter);

// Standalone comment update/delete routes
app.put('/api/comments/:id', requireAuth, updateComment);
app.delete('/api/comments/:id', requireAuth, deleteComment);

// Users routes — /me/* routes are registered first inside the router
app.use('/api/users', usersRouter);

// Ingredients glossary
app.use('/api/ingredients', ingredientsRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ data: null, error: 'Route not found' });
});

// Global error handler (catches errors thrown from async route handlers via express-async-errors)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ data: null, error: err.message ?? 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`FIP backend running on http://localhost:${PORT}`);
});

export default app;
