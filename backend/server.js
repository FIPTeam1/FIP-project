require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// example
app.get('/api/temp', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      error:
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env',
    });
  }

  const { data, error } = await supabase
    .from('test_table')
    .select('id, created_at, dummy')
    .limit(3);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/recipes', async (req, res) => {
  // fetches all recipes from the database, should limit later on

  if (!supabase) {
    return res.status(500).json({
      error:
        'Supabase Error, recipes endpoint',
    });
  }

  const { data, error } = await supabase
    .from('recipes')
    .select('recipe_id, image, name, description, duration, location, type, ingredients, family_history_id, category, user_id');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'No recipes found' });
  }

  res.status(200).json(data);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
