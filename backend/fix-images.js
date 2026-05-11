/**
 * fix-images.js — patches all broken Unsplash URLs in the database.
 * Run: node fix-images.js  (from /backend with .env loaded)
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}` } },
  }
);

async function fix() {
  console.log('\n🔧  Fixing broken image URLs…\n');

  // ── Recipes ──────────────────────────────────────────────────────────────────
  const recipePatches = [
    {
      recipe_id: 1, // Chicken Adobo
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop',
    },
    {
      recipe_id: 9, // Ube Halaya
      image: 'https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?w=800&auto=format&fit=crop',
    },
  ];

  for (const { recipe_id, image } of recipePatches) {
    const { error } = await supabase.from('Recipe').update({ image }).eq('recipe_id', recipe_id);
    if (error) console.error(`  ✗ Recipe ${recipe_id}:`, error.message);
    else console.log(`  ✓ Recipe ${recipe_id} image updated`);
  }

  // ── Family History ────────────────────────────────────────────────────────────
  // FamilyHistory id=2 had a broken family_photo URL
  const { error: fhErr } = await supabase
    .from('FamilyHistory')
    .update({ family_photo: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&auto=format&fit=crop' })
    .eq('id', 2);
  if (fhErr) console.error('  ✗ FamilyHistory 2:', fhErr.message);
  else console.log('  ✓ FamilyHistory 2 photo updated');

  // ── Ingredients ───────────────────────────────────────────────────────────────
  const ingredientPatches = [
    {
      name: 'Bagoong (Shrimp Paste)',
      image: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=400&auto=format&fit=crop',
    },
    {
      name: 'Tamarind (Sampalok)',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop',
    },
    {
      name: 'Annatto Seeds (Atsuete)',
      image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&auto=format&fit=crop',
    },
    {
      name: 'Coconut Milk (Gata)',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop',
    },
    {
      name: 'Banana Ketchup',
      image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&auto=format&fit=crop',
    },
  ];

  for (const { name, image } of ingredientPatches) {
    const { error } = await supabase.from('Ingredients').update({ image }).eq('name', name);
    if (error) console.error(`  ✗ Ingredient "${name}":`, error.message);
    else console.log(`  ✓ Ingredient "${name}" image updated`);
  }

  console.log('\n✅  All image URLs patched.\n');
}

fix().catch(err => { console.error(err); process.exit(1); });
