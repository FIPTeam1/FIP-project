/**
 * seed.js — Populates the FIP database with sample Filipino recipes,
 * ingredients, users, family histories, and ratings.
 *
 * Run with:  node seed.js
 * (from the /backend directory, with .env loaded)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}` },
    },
  }
);

// ── helpers ───────────────────────────────────────────────────────────────────
async function must(label, promise) {
  const { data, error } = await promise;
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
  return data;
}

// ── seed data ─────────────────────────────────────────────────────────────────

const SEED_USERS = [
  {
    email: 'maria.santos@example.com',
    password: 'password123',
    first_name: 'Maria',
    last_name: 'Santos',
    profile_picture:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    description:
      'Home cook from Pampanga sharing the recipes my lola taught me. Every dish tells a story.',
  },
  {
    email: 'jose.reyes@example.com',
    password: 'password123',
    first_name: 'Jose',
    last_name: 'Reyes',
    profile_picture:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=jose',
    description:
      'Chef and food historian passionate about preserving traditional Filipino flavors.',
  },
  {
    email: 'ana.garcia@example.com',
    password: 'password123',
    first_name: 'Ana',
    last_name: 'Garcia',
    profile_picture:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    description:
      'Ilocana cooking enthusiast. My specialty is everything that starts with vinegar!',
  },
];

// Family histories — inserted before recipes so we can link them
const SEED_FAMILY_HISTORIES = [
  {
    family_photo:
      'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&auto=format&fit=crop',
    creator: 'Lola Conching Santos',
    family_name_origin: 'Pampanga, Central Luzon',
    story:
      'This adobo recipe has been in the Santos family for over four generations. My great-grandmother Conching learned it from her own mother in the rice fields of Pampanga during the American colonial period. She would cook it in a clay pot over a wood fire, and the smell would drift through the entire neighborhood. When our family emigrated to the United States in the 1970s, this recipe traveled with us in a handwritten notebook that my grandmother kept folded in her bra during the plane ride. It is our most treasured heirloom.',
  },
  {
    family_photo:
      'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&auto=format&fit=crop',
    creator: 'Lolo Ernesto Reyes',
    family_name_origin: 'Batangas, Southern Luzon',
    story:
      'Sinigang is the dish that reminds every Filipino of home. Our family recipe uses kamias (bilimbi) instead of tamarind, a secret my grandfather Ernesto discovered while fishing along Taal Lake. He was a fisherman by trade and would prepare this for the whole village after a good catch. The freshness of the fish made all the difference — he always said a sinigang cooked within an hour of the catch is worth ten cooked the next day.',
  },
  {
    family_photo:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop',
    creator: 'Nanay Rosario Garcia',
    family_name_origin: 'Ilocos Norte, Northern Luzon',
    story:
      'Bagnet is the Ilocano pride. My mother Rosario learned to make it from her mother, who lived in a small village near Laoag. The secret is the double-frying method and leaving the pork uncovered overnight in the refrigerator so the skin dries completely before the second fry. We eat it every Pista ng Bayan (town fiesta) and it is always the first thing to disappear from the table. Even relatives who have lived in Manila for decades still come home just for this.',
  },
];

const SEED_RECIPES = [
  // ── Maria's recipes ──────────────────────────────────────────────────────────
  {
    name: 'Chicken Adobo',
    description:
      'The quintessential Filipino dish — chicken braised in vinegar, soy sauce, garlic, and bay leaves until fall-off-the-bone tender. Rich, tangy, and deeply savory, it only gets better as leftovers.',
    duration: '1 hour',
    location: 'Pampanga, Philippines',
    category: 'Main Course',
    type: 'Chicken',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop',
    ingredients: `3 lbs chicken pieces (thighs and drumsticks)
½ cup white cane vinegar
⅓ cup soy sauce
1 head garlic, crushed
4 bay leaves
1 tsp whole black peppercorns
2 tbsp vegetable oil
1 cup water`,
    family_history_index: 0,
  },
  {
    name: 'Pork Kare-Kare',
    description:
      'A festive oxtail and pork stew simmered in a rich peanut sauce with banana blossom, eggplant, and string beans. Always served with bagoong (shrimp paste) on the side — the salty contrast is essential.',
    duration: '3 hours',
    location: 'Pampanga, Philippines',
    category: 'Main Course',
    type: 'Pork',
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop',
    ingredients: `2 lbs oxtail, cut into segments
1 lb pork leg
1 cup peanut butter
¼ cup ground toasted rice
1 banana blossom (puso ng saging)
2 eggplants, sliced
1 bundle string beans, cut
1 bundle pechay (bok choy)
Bagoong alamang for serving
4 cloves garlic, minced
1 large onion, diced
3 tbsp annatto oil`,
    family_history_index: null,
  },
  {
    name: 'Leche Flan',
    description:
      'The Filipino version of crème caramel — silky, egg-yolk-rich custard with a deeply caramelized sugar crust. Made in an oval tin mold called a llanera and steamed to perfection, it is the crown jewel of every Filipino celebration.',
    duration: '1.5 hours',
    location: 'Manila, Philippines',
    category: 'Dessert',
    type: 'Dessert',
    image:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop',
    ingredients: `10 egg yolks
1 can (14 oz) sweetened condensed milk
1 can (12 oz) evaporated milk
1 tsp vanilla extract
Zest of 1 lemon
1 cup granulated sugar (for caramel)`,
    family_history_index: null,
  },

  // ── Jose's recipes ──────────────────────────────────────────────────────────
  {
    name: 'Sinigang na Salmon',
    description:
      'A bright, sour tamarind-based soup with fresh salmon, daikon radish, water spinach, eggplant, and tomatoes. Light yet complex, it is the Filipino answer to a cold or a grey afternoon.',
    duration: '45 minutes',
    location: 'Batangas, Philippines',
    category: 'Soup',
    type: 'Seafood',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop',
    ingredients: `2 lbs salmon belly, cut into pieces
1 pack (44g) sinigang mix (tamarind)
2 medium tomatoes, quartered
1 medium onion, quartered
1 daikon radish (labanos), sliced
2 eggplants, cut into chunks
1 bundle kangkong (water spinach)
4 long green chili peppers
Fish sauce to taste
8 cups water`,
    family_history_index: 1,
  },
  {
    name: 'Pancit Bihon',
    description:
      'Thin rice noodles stir-fried with chicken, shrimp, vegetables, and a savory soy-calamansi sauce. A staple at every Filipino birthday and fiesta — symbolizing long life. Served with calamansi wedges.',
    duration: '35 minutes',
    location: 'Laguna, Philippines',
    category: 'Noodles',
    type: 'Noodles',
    image:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&auto=format&fit=crop',
    ingredients: `500g bihon (rice noodles)
200g chicken breast, sliced thin
100g shrimp, peeled
2 cups chicken broth
3 tbsp soy sauce
1 medium carrot, julienned
2 stalks celery, sliced
1 cup cabbage, shredded
4 cloves garlic, minced
1 onion, sliced
2 tbsp vegetable oil
Calamansi and green onion for serving`,
    family_history_index: null,
  },
  {
    name: 'Halo-Halo',
    description:
      'The ultimate Filipino summer dessert — a towering layered glass of shaved ice, sweetened beans, jellies, nata de coco, leche flan, ube halaya, and evaporated milk. Mix everything together (halo means "mix") and enjoy.',
    duration: '30 minutes',
    location: 'Nationwide, Philippines',
    category: 'Dessert',
    type: 'Dessert',
    image:
      'https://images.unsplash.com/photo-1587740896339-96a76170508d?w=800&auto=format&fit=crop',
    ingredients: `Shaved ice
½ cup evaporated milk
2 tbsp sweetened red beans
2 tbsp sweetened chickpeas (garbanzos)
2 tbsp nata de coco
2 tbsp kaong (palm fruit)
2 tbsp macapuno strips
2 tbsp sweetened plantains (minatamis na saging)
1 scoop ube ice cream
1 slice leche flan
2 tbsp ube halaya (purple yam jam)
Pinipig (toasted rice puffs) for crunch`,
    family_history_index: null,
  },

  // ── Ana's recipes ──────────────────────────────────────────────────────────
  {
    name: 'Ilocano Bagnet',
    description:
      'Double-fried crispy pork belly from Ilocos — the Filipino answer to lechon kawali. The pork is boiled until tender, air-dried, then fried twice for an impossibly crunchy, blistered skin and juicy interior. Best eaten with pinakbet or plain rice.',
    duration: '4 hours',
    location: 'Ilocos Norte, Philippines',
    category: 'Main Course',
    type: 'Pork',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
    ingredients: `2 lbs pork belly, skin-on
2 tbsp salt
1 tbsp whole black peppercorns
4 cloves garlic, crushed
3 bay leaves
Water for boiling
Vegetable oil for deep frying`,
    family_history_index: 2,
  },
  {
    name: 'Pinakbet',
    description:
      'A bold Ilocano vegetable medley — bitter melon, eggplant, squash, okra, and string beans stewed with pork and funky bagoong Ilocano (shrimp or anchovy paste). An acquired taste that becomes an obsession.',
    duration: '40 minutes',
    location: 'Ilocos Sur, Philippines',
    category: 'Vegetable',
    type: 'Vegetable',
    image:
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&auto=format&fit=crop',
    ingredients: `200g pork belly, cubed
1 bitter melon (ampalaya), seeded and sliced
2 eggplants, chunked
1 cup squash (kalabasa), cubed
1 cup okra, trimmed
1 cup string beans, cut
3 tbsp bagoong Ilocano (fermented anchovy paste)
4 cloves garlic, minced
1 thumb ginger, sliced
1 onion, diced
2 tomatoes, chopped
½ cup water`,
    family_history_index: null,
  },
  {
    name: 'Ube Halaya',
    description:
      'Velvety purple yam jam cooked slowly with coconut milk, butter, and condensed milk until thick and glossy. Served as a dessert on its own, spread on bread, or used as a filling in halo-halo and pastries. The color alone is breathtaking.',
    duration: '1 hour',
    location: 'Benguet, Philippines',
    category: 'Dessert',
    type: 'Dessert',
    image:
      'https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?w=800&auto=format&fit=crop',
    ingredients: `2 lbs purple yam (ube), cooked and grated
1 can (14 oz) sweetened condensed milk
1 can (13.5 oz) coconut milk
4 tbsp unsalted butter
¼ cup white sugar
½ tsp vanilla extract`,
    family_history_index: null,
  },
];

const SEED_INGREDIENTS = [
  {
    name: 'Fish Sauce (Patis)',
    image:
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&auto=format&fit=crop',
    substitutes:
      'Soy sauce with a pinch of salt; Worcestershire sauce (diluted); coconut aminos for a milder alternative',
  },
  {
    name: 'Calamansi',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop',
    substitutes:
      'Key lime juice; a mix of lemon and orange juice (2:1 ratio); yuzu juice',
  },
  {
    name: 'Bagoong (Shrimp Paste)',
    image:
      'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=400&auto=format&fit=crop',
    substitutes:
      'Miso paste with a dash of fish sauce; anchovy paste; Thai shrimp paste (kapi)',
  },
  {
    name: 'Ube (Purple Yam)',
    image:
      'https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?w=400&auto=format&fit=crop',
    substitutes:
      'Taro with purple food coloring; Okinawan sweet potato; regular sweet potato (flavor differs)',
  },
  {
    name: 'Pandan Leaves',
    image:
      'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400&auto=format&fit=crop',
    substitutes:
      'Vanilla extract (½ tsp per 2 leaves); pandan extract/paste; butterfly pea flower for color only',
  },
  {
    name: 'Tamarind (Sampalok)',
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop',
    substitutes:
      'Tamarind powder or paste (adjust quantity); lemon juice with a pinch of brown sugar; green mango juice',
  },
  {
    name: 'Annatto Seeds (Atsuete)',
    image:
      'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&auto=format&fit=crop',
    substitutes:
      'Sweet paprika (for color, not flavor); turmeric (yellow tone); saffron (expensive but accurate)',
  },
  {
    name: 'Coconut Milk (Gata)',
    image:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop',
    substitutes:
      'Heavy cream diluted with water; oat milk for a lighter version; almond milk (thinner result)',
  },
  {
    name: 'Banana Ketchup',
    image:
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&auto=format&fit=crop',
    substitutes:
      'Tomato ketchup with a dash of Worcestershire; sriracha mixed with ketchup and a pinch of sugar',
  },
  {
    name: 'Cane Vinegar (Sukang Iloko)',
    image:
      'https://images.unsplash.com/photo-1558642891-54be180ea339?w=400&auto=format&fit=crop',
    substitutes:
      'White cane vinegar; rice vinegar (milder); white wine vinegar; coconut vinegar',
  },
  {
    name: 'Bitter Melon (Ampalaya)',
    image:
      'https://images.unsplash.com/photo-1617692855027-33b14f061079?w=400&auto=format&fit=crop',
    substitutes:
      'Zucchini (no bitterness but similar texture); cucumber (mild); neem leaves (very bitter, use sparingly)',
  },
  {
    name: 'Longanisa (Filipino Sausage)',
    image:
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop',
    substitutes:
      'Sweet Italian sausage with a pinch of annatto; chorizo de Bilbao; any sweet pork sausage',
  },
];

const SEED_RATINGS = [
  // Chicken Adobo (recipe index 0)
  { recipeIndex: 0, rating: 5, review: 'This is exactly how my lola made it! The ratio of vinegar to soy is perfect. I added a few dried chiles for heat and it was incredible.', name: 'Rowena D.' },
  { recipeIndex: 0, rating: 5, review: 'Made this for my American husband and now he requests it every week. Easy to follow and the result is restaurant quality.', name: 'Christine P.' },
  { recipeIndex: 0, rating: 4, review: 'Very good! I used apple cider vinegar because that\'s what I had and it still came out great. Will try with cane vinegar next time.', name: 'Mark S.' },

  // Pork Kare-Kare (recipe index 1)
  { recipeIndex: 1, rating: 5, review: 'The best kare-kare I\'ve made at home. The key really is toasting the rice first — it adds such a nice depth to the sauce.', name: 'Jennifer L.' },
  { recipeIndex: 1, rating: 4, review: 'Took a long time but so worth it. My family demolished the whole pot in one sitting. Serve with LOTS of bagoong!', name: 'Roberto A.' },

  // Sinigang na Salmon (recipe index 3)
  { recipeIndex: 3, rating: 5, review: 'Sinigang is my comfort food and this recipe nailed it. The salmon belly is so rich and pairs beautifully with the sour broth.', name: 'Theresa V.' },
  { recipeIndex: 3, rating: 5, review: 'I\'ve tried many sinigang recipes and this is the best. Don\'t skip the fish sauce — it adds so much umami.', name: 'Patrick M.' },
  { recipeIndex: 3, rating: 4, review: 'Wonderful recipe. I added some daikon slices and they soaked up the broth perfectly. Will make again soon.', name: 'Elena G.' },

  // Pancit Bihon (recipe index 4)
  { recipeIndex: 4, rating: 5, review: 'Birthday pancit! Made this for my daughter\'s 7th birthday and she loved it. Easy to double the recipe for a crowd.', name: 'Maribel C.' },
  { recipeIndex: 4, rating: 4, review: 'Classic and reliable. I add a bit of oyster sauce for extra savoriness. Don\'t forget the calamansi on top!', name: 'Dennis T.' },

  // Bagnet (recipe index 6)
  { recipeIndex: 6, rating: 5, review: 'Finally a bagnet recipe that explains the double-fry method properly! The skin came out perfectly crunchy. Worth every calorie.', name: 'Geraldine F.' },
  { recipeIndex: 6, rating: 5, review: 'Ilocano pride! This tastes just like what we get at the Laoag market. The overnight drying step is non-negotiable.', name: 'Aldrich B.' },

  // Leche Flan (recipe index 2)
  { recipeIndex: 2, rating: 5, review: 'The extra egg yolks make all the difference — so much richer than other recipes. My family fights over the last piece every time.', name: 'Connie R.' },
  { recipeIndex: 2, rating: 4, review: 'Silky smooth and perfectly sweet. Make sure your caramel is amber not dark brown or it will be bitter.', name: 'Noel U.' },

  // Ube Halaya (recipe index 8)
  { recipeIndex: 8, rating: 5, review: 'The color is stunning and the taste is out of this world. I spread it on pandesal every morning now.', name: 'Aileen S.' },
  { recipeIndex: 8, rating: 5, review: 'Made this for a Filipino food potluck and it was a huge hit. Everyone asked for the recipe!', name: 'Carla M.' },
];

// ── main seeder ───────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱  Starting FIP database seed…\n');

  // 1. Create seed users via auth admin ────────────────────────────────────────
  console.log('── Users ──');
  const createdUsers = [];

  for (const userData of SEED_USERS) {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('Users')
      .select('id')
      .eq('id', (await supabase.auth.admin.listUsers()).data.users.find(
        (u) => u.email === userData.email
      )?.id || 'nonexistent')
      .maybeSingle();

    let authUserId;

    // Try to find existing auth user by email
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingAuth = listData?.users?.find((u) => u.email === userData.email);

    if (existingAuth) {
      console.log(`  ↩ User already exists: ${userData.email}`);
      authUserId = existingAuth.id;
    } else {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
      });
      if (authErr) {
        console.error(`  ✗ Auth create failed for ${userData.email}:`, authErr.message);
        continue;
      }
      authUserId = authData.user.id;
      console.log(`  ✓ Created auth user: ${userData.email}`);
    }

    // Upsert into Users table
    const { error: upsertErr } = await supabase.from('Users').upsert({
      id: authUserId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      profile_picture: userData.profile_picture,
      description: userData.description,
    });
    if (upsertErr) {
      console.error(`  ✗ Users upsert failed for ${userData.email}:`, upsertErr.message);
      continue;
    }

    createdUsers.push({ ...userData, id: authUserId });
    console.log(`  ✓ Upserted profile: ${userData.first_name} ${userData.last_name}`);
  }

  if (createdUsers.length === 0) {
    console.error('\n✗ No users created — cannot continue.');
    process.exit(1);
  }

  // 2. Family histories ─────────────────────────────────────────────────────────
  console.log('\n── Family Histories ──');
  const createdFamilyHistories = [];

  for (let i = 0; i < SEED_FAMILY_HISTORIES.length; i++) {
    const fh = SEED_FAMILY_HISTORIES[i];
    const fhId = i + 1; // explicit integer IDs starting at 1

    // Delete existing record with same id to allow re-seeding
    await supabase.from('FamilyHistory').delete().eq('id', fhId);

    const { data, error } = await supabase
      .from('FamilyHistory')
      .insert({ id: fhId, ...fh })
      .select()
      .single();
    if (error) {
      console.error('  ✗ FamilyHistory insert failed:', error.message);
      createdFamilyHistories.push(null);
    } else {
      createdFamilyHistories.push(data);
      console.log(`  ✓ Created family history: "${fh.creator}"`);
    }
  }

  // 3. Recipes ─────────────────────────────────────────────────────────────────
  console.log('\n── Recipes ──');
  const createdRecipes = [];

  // Assign users: Maria gets first 3, Jose gets next 3, Ana gets last 3
  const userAssignments = [0, 0, 0, 1, 1, 1, 2, 2, 2];

  for (let i = 0; i < SEED_RECIPES.length; i++) {
    const recipeData = SEED_RECIPES[i];
    const recipeId = i + 1; // explicit integer IDs starting at 1
    const userIndex = userAssignments[i] < createdUsers.length ? userAssignments[i] : 0;
    const owner = createdUsers[userIndex];
    const fhIndex = recipeData.family_history_index;
    const familyHistoryId =
      fhIndex !== null && createdFamilyHistories[fhIndex]
        ? createdFamilyHistories[fhIndex].id
        : null;

    // Delete existing record with same id to allow re-seeding
    await supabase.from('Recipe').delete().eq('recipe_id', recipeId);

    const { data, error } = await supabase
      .from('Recipe')
      .insert({
        recipe_id: recipeId,
        name: recipeData.name,
        description: recipeData.description,
        duration: recipeData.duration,
        location: recipeData.location,
        category: recipeData.category,
        type: recipeData.type,
        image: recipeData.image,
        ingredients: recipeData.ingredients,
        family_history_id: familyHistoryId,
        user_id: owner.id,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ✗ Recipe insert failed for "${recipeData.name}":`, error.message);
      createdRecipes.push(null);
    } else {
      createdRecipes.push(data);
      console.log(`  ✓ Created recipe: "${recipeData.name}" by ${owner.first_name}`);
    }
  }

  // 4. Ingredients ─────────────────────────────────────────────────────────────
  console.log('\n── Ingredients ──');
  for (const ing of SEED_INGREDIENTS) {
    const { error } = await supabase.from('Ingredients').insert(ing);
    if (error && !error.message.includes('duplicate')) {
      console.error(`  ✗ Ingredient insert failed for "${ing.name}":`, error.message);
    } else if (!error) {
      console.log(`  ✓ Created ingredient: "${ing.name}"`);
    } else {
      console.log(`  ↩ Ingredient already exists: "${ing.name}"`);
    }
  }

  // 5. Ratings / Reviews ────────────────────────────────────────────────────────
  // NOTE: The Ratings.user_id and SavedRecipes.user_id columns are typed as
  // BIGINT in the database, but Users.id is a UUID (text). This is a schema
  // mismatch — inserting a UUID string into a bigint column fails. These tables
  // need to be altered to use TEXT or UUID before reviews/saves will work for
  // real users. Skipping seed for these tables.
  console.log('\n── Ratings ──');
  console.log('  ⚠ Skipped — schema mismatch: Ratings.user_id is BIGINT but Users.id is UUID.');
  console.log('    Fix: ALTER TABLE "Ratings" ALTER COLUMN user_id TYPE TEXT;');
  console.log('    Fix: ALTER TABLE "SavedRecipes" ALTER COLUMN user_id TYPE TEXT;\n');
  console.log('── Saved Recipes ──');
  console.log('  ⚠ Skipped — same schema mismatch as Ratings.');

  console.log('\n🎉  Seed complete!\n');
  console.log('Seed user credentials (all use password: password123):');
  for (const u of SEED_USERS) {
    console.log(`  • ${u.email}  (${u.first_name} ${u.last_name})`);
  }
  console.log('');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
