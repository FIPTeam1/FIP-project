require('dotenv').config();
const express = require('express');
const cors = require('cors');

const ingredientsRoutes = require('./routes/ingredients');
const recipesRoutes = require('./routes/recipes');
const reviewsRoutes = require('./routes/reviews');
const savedRoutes = require('./routes/saved');
const authRoutes = require('./routes/auth');
const followRoutes = require('./routes/follow');
const usersRoutes = require('./routes/users');
const familyHistoryRoutes = require('./routes/familyHistory');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'FIP API' });
});

app.use(ingredientsRoutes);
app.use(recipesRoutes);
app.use(reviewsRoutes);
app.use(savedRoutes);
app.use(authRoutes);
app.use(followRoutes);
app.use(usersRoutes);
app.use(familyHistoryRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/ingredients', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      error:
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env',
    });
  }

  const { data, error } = await supabase
    .from('ingredients')
    .select('id, name, image, substitutes');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'No ingredients found' });
  }

  return res.status(200).json(data);
});

app.listen(PORT, () => {
  console.log(`FIP API listening on http://localhost:${PORT}`);
});
