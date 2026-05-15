/**
 * seed-demo-recipe.js
 * Inserts one complete demo recipe (Chicken Adobo) with full family history.
 * Run: node seed-demo-recipe.js
 */
require('dotenv').config();
const supabase = require('./lib/supabase');

const JACOB = 'dfdc0ea8-1040-4285-b9df-31f60398fdea';

async function nextId(table, col) {
  const { data } = await supabase
    .from(table)
    .select(col)
    .order(col, { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.[col] ?? 0) + 1;
}

async function main() {
  // 1. Insert family history
  console.log('Inserting family history...');
  const fhId = await nextId('FamilyHistory', 'id');
  const { data: fhData, error: fhError } = await supabase
    .from('FamilyHistory')
    .insert({
      id: fhId,
      creator: 'Lola Nena (Leonora Santos)',
      family_name_origin: 'Santos Family, Cavite City',
      story: `This Chicken Adobo recipe has been the soul of the Santos family table for over seventy years. Lola Nena learned it from her own mother during the Japanese occupation, when families had to make every ingredient last. The secret she always whispered: never skimp on the garlic, and let the chicken simmer uncovered at the very end so the sauce clings and caramelizes against the meat. Every Christmas Eve, Lola Nena would start the pot before sunrise, and the whole neighborhood on Calle Real knew the holidays had begun just from the smell drifting through the capiz-shell windows. When she passed in 1998, her daughter Tita Coring carried the recipe to Quezon City, then to Chicago, then back to Manila — each household adding a little story to it, but never changing a single gram of the vinegar. We made sure to write it down this time. This one is for every apo who never got to taste it straight from Lola's clay pot.`,
      family_photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    })
    .select('id')
    .single();

  if (fhError) {
    console.error('Family history error:', fhError.message);
    process.exit(1);
  }
  console.log(`  Family history inserted (id=${fhData.id})`);

  // 2. Insert recipe
  console.log('Inserting demo recipe...');
  const recipeId = await nextId('Recipe', 'recipe_id');
  const ingredients = JSON.stringify([
    'Chicken (whole, cut into serving pieces)',
    'Soy Sauce',
    'White Vinegar',
    'Garlic',
    'Bay Leaves',
    'Black Pepper',
    'Brown Sugar',
    'Cooking Oil',
    'Water',
    'Green Onions (Sibuyas Dahon)',
  ]);

  const { data: recipeData, error: recipeError } = await supabase
    .from('Recipe')
    .insert({
      recipe_id: recipeId,
      name: 'Lola Nena\'s Chicken Adobo',
      category: 'Main Course',
      type: 'Chicken',
      duration: '1 hour',
      location: 'Cavite City, Cavite',
      description:
        'A slow-braised chicken adobo passed down through four generations of the Santos family from Cavite. The chicken is marinated overnight in native cane vinegar and aged soy sauce, then braised low and slow until the sauce reduces to a deep mahogany glaze. Finished uncovered so the skin crisps and the sauce caramelizes — exactly as Lola Nena always insisted. Serve with steamed jasmine rice and let the pot do the talking.',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&auto=format&fit=crop&q=85',
      ingredients,
      family_history_id: fhData.id,
      user_id: JACOB,
    })
    .select('recipe_id, name')
    .single();

  if (recipeError) {
    console.error('Recipe error:', recipeError.message);
    process.exit(1);
  }

  console.log(`  Recipe inserted (recipe_id=${recipeData.recipe_id}, name="${recipeData.name}")`);
  console.log('\nDemo recipe seeded successfully!');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
