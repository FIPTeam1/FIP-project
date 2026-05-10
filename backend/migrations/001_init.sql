-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location_of_origin TEXT,
  servings INTEGER,
  time_duration TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_draft BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  quantity TEXT,
  measurement TEXT,
  ingredient_name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- Recipe instructions
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL
);

-- Family history
CREATE TABLE IF NOT EXISTS recipe_family_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE UNIQUE,
  creator_name TEXT,
  family_name TEXT,
  ancestral_origin TEXT,
  story TEXT,
  photo_url TEXT
);

-- Comments (threaded)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved recipes (bookmarks)
CREATE TABLE IF NOT EXISTS saved_recipes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Ingredient glossary
CREATE TABLE IF NOT EXISTS ingredient_glossary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS ingredient_substitutes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredient_glossary(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_range TEXT,
  unit TEXT,
  image_url TEXT
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_family_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_substitutes ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only own profile writable
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes: public read for non-drafts, owner write
CREATE POLICY "recipes_select" ON recipes FOR SELECT USING (is_draft = false OR auth.uid() = creator_id);
CREATE POLICY "recipes_insert" ON recipes FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "recipes_update" ON recipes FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "recipes_delete" ON recipes FOR DELETE USING (auth.uid() = creator_id);

-- Recipe sub-tables: follow recipe permissions
CREATE POLICY "ri_select" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "ri_all" ON recipe_ingredients FOR ALL USING (
  auth.uid() = (SELECT creator_id FROM recipes WHERE id = recipe_id)
);
CREATE POLICY "rins_select" ON recipe_instructions FOR SELECT USING (true);
CREATE POLICY "rins_all" ON recipe_instructions FOR ALL USING (
  auth.uid() = (SELECT creator_id FROM recipes WHERE id = recipe_id)
);
CREATE POLICY "rfh_select" ON recipe_family_history FOR SELECT USING (true);
CREATE POLICY "rfh_all" ON recipe_family_history FOR ALL USING (
  auth.uid() = (SELECT creator_id FROM recipes WHERE id = recipe_id)
);

-- Comments: read all, write own
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (
  auth.uid() = user_id OR
  auth.uid() = (SELECT creator_id FROM recipes WHERE id = recipe_id)
);

-- Saved recipes: own only
CREATE POLICY "saved_select" ON saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_all" ON saved_recipes FOR ALL USING (auth.uid() = user_id);

-- Ingredient glossary: public read
CREATE POLICY "ig_select" ON ingredient_glossary FOR SELECT USING (true);
CREATE POLICY "is_select" ON ingredient_substitutes FOR SELECT USING (true);

-- Function: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed ingredient glossary
INSERT INTO ingredient_glossary (name, image_url) VALUES
  ('Annatto (Achiote)', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'),
  ('Banana Ketchup', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'),
  ('Bay Leaves', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
  ('Calamansi', 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400'),
  ('Coconut Milk', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'),
  ('Fish Sauce (Patis)', 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400'),
  ('Longanisa', 'https://images.unsplash.com/photo-1606851091851-e8c8cae4d9e9?w=400'),
  ('Pandan Leaves', 'https://images.unsplash.com/photo-1618897996318-5a901fa0ca57?w=400'),
  ('Rice Vinegar', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'),
  ('Tamarind', 'https://images.unsplash.com/photo-1594368496338-60f3abe04c52?w=400'),
  ('Ube (Purple Yam)', 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400'),
  ('Cane Vinegar', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400')
ON CONFLICT DO NOTHING;
