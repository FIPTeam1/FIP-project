/**
 * seed-ingredients-recipes.js
 * Cleans up duplicate ingredients, adds 70+ real Filipino ingredients,
 * and seeds 25+ recipes covering every category shown on the homepage.
 */
require('dotenv').config();
const supabase = require('./lib/supabase');

// ── User IDs (from DB) ───────────────────────────────────────────────────────
const MARIA  = 'a52dbf4a-e52c-4c17-b9ec-6129321af69e';
const JOSE   = '6357d555-720f-413c-add8-e71bf2e7400d';
const ANA    = '0bddafeb-2080-4f2b-b2c4-2deaa5ac8b90';
const JACOB  = 'dfdc0ea8-1040-4285-b9df-31f60398fdea';

// Helper: get next integer ID from a table
async function nextId(table, col) {
  const { data } = await supabase.from(table).select(col).order(col, { ascending: false }).limit(1).maybeSingle();
  return (data?.[col] ?? 0) + 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLEAN DUPLICATE INGREDIENTS (IDs 13–999, keep 1–12)
// ─────────────────────────────────────────────────────────────────────────────
async function cleanDuplicateIngredients() {
  console.log('Cleaning duplicate ingredients (IDs 13+)...');
  const { error } = await supabase.from('Ingredients').delete().gte('id', 13);
  if (error) console.error('  cleanup error:', error.message);
  else console.log('  Done.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. INGREDIENTS
// ─────────────────────────────────────────────────────────────────────────────
const INGREDIENT_LIST = [
  // ── Proteins ────────────────────────────────────────────────────────────────
  { name: 'Chicken',                   image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&auto=format&fit=crop' },
  { name: 'Pork Belly',                image: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&auto=format&fit=crop' },
  { name: 'Ground Pork',               image: null },
  { name: 'Pork Ribs',                 image: null },
  { name: 'Pork Shoulder (Kasim)',      image: null },
  { name: 'Pork Leg (Pata)',            image: null },
  { name: 'Beef Short Ribs',           image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&auto=format&fit=crop' },
  { name: 'Ground Beef',               image: null },
  { name: 'Beef Brisket',              image: null },
  { name: 'Shrimp (Hipon)',            image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&auto=format&fit=crop' },
  { name: 'Milkfish (Bangus)',         image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop' },
  { name: 'Tilapia',                   image: null },
  { name: 'Squid (Pusit)',             image: null },
  { name: 'Mussels (Tahong)',          image: null },
  { name: 'Clams (Halaan)',            image: null },
  { name: 'Crab (Alimango)',           image: null },
  { name: 'Dried Fish (Tuyo)',         image: null },
  { name: 'Smoked Fish (Tinapa)',      image: null },
  { name: 'Pork Liver',                image: null },
  { name: 'Chicken Liver',             image: null },
  // ── Vegetables ──────────────────────────────────────────────────────────────
  { name: 'Eggplant (Talong)',         image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&auto=format&fit=crop' },
  { name: 'Kangkong (Water Spinach)',  image: null },
  { name: 'Sitaw (String Beans)',      image: null },
  { name: 'Pechay (Bok Choy)',         image: null },
  { name: 'Cabbage',                   image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&auto=format&fit=crop' },
  { name: 'Carrots',                   image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop' },
  { name: 'Potatoes',                  image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop' },
  { name: 'Tomatoes',                  image: 'https://images.unsplash.com/photo-1558818498-28c1e002b655?w=400&auto=format&fit=crop' },
  { name: 'Okra',                      image: null },
  { name: 'Sayote (Chayote)',          image: null },
  { name: 'Malunggay (Moringa)',       image: null },
  { name: 'Gabi (Taro)',               image: null },
  { name: 'Labanos (White Radish)',    image: null },
  { name: 'Ampalaya (Bitter Melon)',   image: null },
  { name: 'Upo (Bottle Gourd)',        image: null },
  { name: 'Green Papaya',              image: null },
  // ── Aromatics ───────────────────────────────────────────────────────────────
  { name: 'Garlic',                    image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&auto=format&fit=crop' },
  { name: 'Onion',                     image: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400&auto=format&fit=crop' },
  { name: 'Ginger',                    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&auto=format&fit=crop' },
  { name: 'Green Onions (Sibuyas Dahon)', image: null },
  { name: 'Bay Leaves',                image: null },
  { name: 'Lemongrass (Tanglad)',      image: null },
  // ── Pantry Staples ──────────────────────────────────────────────────────────
  { name: 'Soy Sauce',                 image: 'https://images.unsplash.com/photo-1599735863915-86b4e4b97c3c?w=400&auto=format&fit=crop' },
  { name: 'White Vinegar',             image: null },
  { name: 'Sugar',                     image: null },
  { name: 'Brown Sugar',               image: null },
  { name: 'Salt',                      image: null },
  { name: 'Black Pepper',              image: null },
  { name: 'Cooking Oil',               image: null },
  { name: 'Tomato Sauce',              image: null },
  { name: 'Oyster Sauce',              image: null },
  { name: 'Worcestershire Sauce',      image: null },
  // ── Filipino Specialty ──────────────────────────────────────────────────────
  { name: 'Alamang (Shrimp Paste)',    image: null },
  { name: 'Coconut Cream (Kakang Gata)', image: null },
  { name: 'Siling Labuyo (Bird Chili)', image: null },
  { name: 'Siling Haba (Long Chili)',  image: null },
  { name: 'Pork Blood (Dugo)',         image: null },
  { name: 'Shrimp Broth Cubes',        image: null },
  // ── Fruits ──────────────────────────────────────────────────────────────────
  { name: 'Green Mango (Manggang Hilaw)', image: null },
  { name: 'Ripe Mango',                image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop' },
  { name: 'Saba Banana',               image: null },
  { name: 'Jackfruit (Langka)',        image: null },
  { name: 'Guava (Bayabas)',           image: null },
  { name: 'Kamias (Bilimbi)',          image: null },
  { name: 'Young Coconut (Buko)',      image: null },
  // ── Noodles & Starches ──────────────────────────────────────────────────────
  { name: 'Rice Noodles (Bihon)',      image: null },
  { name: 'Glass Noodles (Sotanghon)', image: null },
  { name: 'Egg Noodles (Pancit Canton)', image: null },
  { name: 'Cassava (Kamoteng Kahoy)', image: null },
  { name: 'Sweet Potato (Kamote)',     image: null },
  { name: 'Glutinous Rice (Malagkit)', image: null },
  { name: 'Rice Flour',                image: null },
  { name: 'All-Purpose Flour',         image: null },
  // ── Dairy & Others ──────────────────────────────────────────────────────────
  { name: 'Eggs',                      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop' },
  { name: 'Butter',                    image: null },
  { name: 'Condensed Milk',            image: null },
  { name: 'Evaporated Milk',           image: null },
  { name: 'All-Purpose Cream',         image: null },
  { name: 'Breadcrumbs',               image: null },
  { name: 'Chicharron (Pork Crackling)', image: null },
  // ── Dessert & Beverage ──────────────────────────────────────────────────────
  { name: 'Sago Pearls',               image: null },
  { name: 'Gulaman (Agar-Agar)',       image: null },
  { name: 'Kaong (Sugar Palm)',        image: null },
  { name: 'Nata de Coco',              image: null },
  { name: 'Pinipig (Toasted Rice)',    image: null },
  { name: 'Macapuno (Coconut Sport)',  image: null },
  { name: 'Leche Flan',                image: null },
  { name: 'Ube Halaya (Purple Yam Jam)', image: null },
];

async function seedIngredients() {
  console.log(`\nSeeding ${INGREDIENT_LIST.length} ingredients...`);
  let startId = await nextId('Ingredients', 'id');
  const rows = INGREDIENT_LIST.map((ing, i) => ({ id: startId + i, ...ing }));
  const { error } = await supabase.from('Ingredients').insert(rows);
  if (error) console.error('  ingredients error:', error.message);
  else console.log(`  Inserted ${rows.length} ingredients (IDs ${startId}–${startId + rows.length - 1}).`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FAMILY HISTORY entries
// ─────────────────────────────────────────────────────────────────────────────
const FAMILY_HISTORIES = [
  { creator: 'Lola Rosario', family_name_origin: 'Dela Cruz Family, Batangas', story: 'This dish has been in our family since Lola Rosario was a young bride in Batangas. She learned to make it from her mother-in-law, who insisted on using only freshly squeezed calamansi and native vinegar. Every Sunday, the whole family would gather in her small kitchen, each taking a task.', family_photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop' },
  { creator: 'Tatay Ernesto', family_name_origin: 'Villanueva Family, Pampanga', story: 'Kapampangan cooking is in our blood. Tatay Ernesto won a town fiesta cooking contest three years in a row with this recipe. He never measured anything — just cooked by feel and taste, adjusting until it was just right. We wrote it down after he passed so his grandchildren could carry it forward.', family_photo: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=600&auto=format&fit=crop' },
  { creator: 'Lola Caring', family_name_origin: 'Buenaventura Family, Cebu', story: 'Lola Caring would make this every Noche Buena. She said the secret was patience — slow cooking and never rushing the flavors. The whole barangay would smell her kitchen and know Christmas had truly arrived. Now her apo continues the tradition every December.', family_photo: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=600&auto=format&fit=crop' },
  { creator: 'Nanay Meding', family_name_origin: 'Reyes Family, Ilocos Norte', story: 'From the north, where flavors are bold and ingredients are dried under the Ilocos sun. Nanay Meding brought this recipe when she moved to Manila after marriage, and it became the dish that always reminded her family of home. Simple, honest, and deeply comforting.', family_photo: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=600&auto=format&fit=crop' },
];

async function seedFamilyHistories() {
  console.log('\nSeeding family history entries...');
  let startId = await nextId('FamilyHistory', 'id');
  const rows = FAMILY_HISTORIES.map((fh, i) => ({ id: startId + i, ...fh }));
  const { data, error } = await supabase.from('FamilyHistory').insert(rows).select('id');
  if (error) { console.error('  family history error:', error.message); return []; }
  console.log(`  Inserted ${rows.length} family history rows.`);
  return data.map(r => r.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RECIPES
// ─────────────────────────────────────────────────────────────────────────────
function makeRecipes(fhIds) {
  const [fh4, fh5, fh6, fh7] = fhIds; // new family history IDs
  return [
    // ── APPETIZERS ────────────────────────────────────────────────────────────
    {
      name: 'Lumpia Shanghai',
      category: 'Appetizer',
      type: 'Pork',
      duration: '45 minutes',
      location: 'Manila',
      description: 'Crispy Filipino-style spring rolls stuffed with seasoned ground pork, carrots, and onions. A must-have at every Filipino party and celebration.',
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Ground Pork', 'Carrots', 'Onion', 'Garlic', 'Eggs', 'Soy Sauce', 'Black Pepper', 'Lumpia Wrapper', 'Cooking Oil']),
      user_id: MARIA,
      family_history_id: null,
    },
    {
      name: 'Tokwa\'t Baboy',
      category: 'Appetizer',
      type: 'Pork',
      duration: '30 minutes',
      location: 'Luzon',
      description: 'Crispy fried tofu and pork ears served in a tangy vinegar-soy dipping sauce with chilis and onion. A classic Filipino pulutan.',
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Tofu', 'Pork Belly', 'White Vinegar', 'Soy Sauce', 'Onion', 'Siling Labuyo (Bird Chili)', 'Black Pepper', 'Cooking Oil']),
      user_id: JOSE,
      family_history_id: null,
    },
    {
      name: 'Sisig',
      category: 'Appetizer',
      type: 'Pork',
      duration: '1.5 hours',
      location: 'Pampanga',
      description: 'The sizzling Kapampangan dish made from chopped pork face and ears, flavored with calamansi and chilis. Served on a hot cast iron plate.',
      image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Pork Belly', 'Pork Liver', 'Onion', 'Calamansi', 'Siling Labuyo (Bird Chili)', 'Soy Sauce', 'Black Pepper', 'Butter', 'Eggs']),
      user_id: ANA,
      family_history_id: fh5,
    },
    // ── MAIN COURSES ─────────────────────────────────────────────────────────
    {
      name: 'Beef Caldereta',
      category: 'Main Course',
      type: 'Beef',
      duration: '1.5 hours',
      location: 'Luzon',
      description: 'A rich and savory Filipino beef stew cooked in a tomato-based sauce with potatoes, carrots, bell peppers, and liver spread. Often served at fiestas.',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Beef Short Ribs', 'Potatoes', 'Carrots', 'Tomato Sauce', 'Garlic', 'Onion', 'Soy Sauce', 'Pork Liver', 'Cooking Oil', 'Bay Leaves']),
      user_id: MARIA,
      family_history_id: fh4,
    },
    {
      name: 'Chicken Tinola',
      category: 'Main Course',
      type: 'Chicken',
      duration: '50 minutes',
      location: 'Nationwide',
      description: 'A comforting ginger-based chicken soup with green papaya or sayote and malunggay leaves. Light, healthy, and deeply Filipino.',
      image: 'https://images.unsplash.com/photo-1604909052434-8ddce70d7a89?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Chicken', 'Green Papaya', 'Malunggay (Moringa)', 'Ginger', 'Garlic', 'Onion', 'Fish Sauce (Patis)', 'Black Pepper', 'Cooking Oil']),
      user_id: JOSE,
      family_history_id: null,
    },
    {
      name: 'Bistek Tagalog',
      category: 'Main Course',
      type: 'Beef',
      duration: '45 minutes',
      location: 'Tagalog Region',
      description: 'Filipino beef steak marinated and braised in soy sauce and calamansi, topped with caramelized onion rings. A weekday staple in most Filipino homes.',
      image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Beef Short Ribs', 'Soy Sauce', 'Calamansi', 'Onion', 'Black Pepper', 'Cooking Oil', 'Sugar']),
      user_id: ANA,
      family_history_id: null,
    },
    {
      name: 'Laing',
      category: 'Main Course',
      type: 'Vegetable',
      duration: '1 hour',
      location: 'Bicol',
      description: 'A spicy Bicolano delicacy of dried taro leaves simmered in coconut milk with shrimp paste and lots of chili. Rich, creamy, and incredibly flavorful.',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Gabi (Taro)', 'Coconut Milk (Gata)', 'Coconut Cream (Kakang Gata)', 'Alamang (Shrimp Paste)', 'Siling Labuyo (Bird Chili)', 'Garlic', 'Onion', 'Shrimp (Hipon)']),
      user_id: MARIA,
      family_history_id: fh6,
    },
    {
      name: 'Crispy Pata',
      category: 'Main Course',
      type: 'Pork',
      duration: '3 hours',
      location: 'Nationwide',
      description: 'Whole pork leg deep-fried to perfect crispiness, served with a vinegar-soy dipping sauce. The ultimate Filipino party showstopper.',
      image: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Pork Leg (Pata)', 'Garlic', 'Bay Leaves', 'Black Pepper', 'Salt', 'Soy Sauce', 'White Vinegar', 'Siling Labuyo (Bird Chili)', 'Cooking Oil']),
      user_id: JOSE,
      family_history_id: fh7,
    },
    {
      name: 'Pork Mechado',
      category: 'Main Course',
      type: 'Pork',
      duration: '1.5 hours',
      location: 'Luzon',
      description: 'Tender pork chunks braised in tomato sauce with potatoes, carrots, and soy sauce. A Spanish-influenced Filipino stew that is pure comfort food.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Pork Shoulder (Kasim)', 'Tomato Sauce', 'Potatoes', 'Carrots', 'Garlic', 'Onion', 'Soy Sauce', 'Bay Leaves', 'Cooking Oil']),
      user_id: ANA,
      family_history_id: null,
    },
    {
      name: 'Adobong Pusit',
      category: 'Main Course',
      type: 'Seafood',
      duration: '30 minutes',
      location: 'Coastal Philippines',
      description: 'Squid cooked adobo-style in its own ink with vinegar, soy sauce, and garlic. Dark, briny, and bursting with ocean flavor.',
      image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Squid (Pusit)', 'Garlic', 'Onion', 'Soy Sauce', 'White Vinegar', 'Bay Leaves', 'Black Pepper', 'Cooking Oil']),
      user_id: MARIA,
      family_history_id: null,
    },
    {
      name: 'Inihaw na Bangus',
      category: 'Main Course',
      type: 'Seafood',
      duration: '45 minutes',
      location: 'Nationwide',
      description: 'Whole milkfish stuffed with tomatoes, onions, and ginger, then grilled over charcoal until beautifully charred. A simple classic.',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Milkfish (Bangus)', 'Tomatoes', 'Onion', 'Ginger', 'Fish Sauce (Patis)', 'Calamansi', 'Salt', 'Black Pepper']),
      user_id: JOSE,
      family_history_id: null,
    },
    // ── SOUPS ─────────────────────────────────────────────────────────────────
    {
      name: 'Bulalo',
      category: 'Soup',
      type: 'Beef',
      duration: '3 hours',
      location: 'Batangas',
      description: 'A hearty bone marrow and beef shank soup slow-simmered for hours until the broth is rich and the meat falls off the bone. The pride of Batangas.',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Beef Short Ribs', 'Cabbage', 'Potatoes', 'Corn', 'Pechay (Bok Choy)', 'Green Onions (Sibuyas Dahon)', 'Fish Sauce (Patis)', 'Black Pepper', 'Salt']),
      user_id: ANA,
      family_history_id: fh4,
    },
    {
      name: 'Arroz Caldo',
      category: 'Soup',
      type: 'Chicken',
      duration: '45 minutes',
      location: 'Nationwide',
      description: 'A thick and comforting Filipino rice porridge with chicken, ginger, and garlic, topped with hard-boiled egg, green onions, and crunchy chicharron.',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Chicken', 'Glutinous Rice (Malagkit)', 'Ginger', 'Garlic', 'Onion', 'Fish Sauce (Patis)', 'Eggs', 'Green Onions (Sibuyas Dahon)', 'Chicharron (Pork Crackling)', 'Cooking Oil']),
      user_id: MARIA,
      family_history_id: null,
    },
    {
      name: 'Sinigang na Baboy',
      category: 'Soup',
      type: 'Pork',
      duration: '1 hour',
      location: 'Nationwide',
      description: 'The quintessential Filipino sour soup with tender pork ribs, vegetables, and tamarind broth. Sour, savory, and soul-warming.',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Pork Ribs', 'Tamarind (Sampalok)', 'Kangkong (Water Spinach)', 'Sitaw (String Beans)', 'Okra', 'Eggplant (Talong)', 'Tomatoes', 'Onion', 'Fish Sauce (Patis)']),
      user_id: JOSE,
      family_history_id: null,
    },
    {
      name: 'Nilagang Baka',
      category: 'Soup',
      type: 'Beef',
      duration: '2 hours',
      location: 'Luzon',
      description: 'A clear and simple boiled beef soup with corn, potatoes, and leafy vegetables. Pure, clean flavors that warm the body and soul.',
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Beef Short Ribs', 'Potatoes', 'Cabbage', 'Pechay (Bok Choy)', 'Corn', 'Onion', 'Black Pepper', 'Fish Sauce (Patis)', 'Salt']),
      user_id: ANA,
      family_history_id: null,
    },
    // ── NOODLES ───────────────────────────────────────────────────────────────
    {
      name: 'Pancit Malabon',
      category: 'Noodles',
      type: 'Seafood',
      duration: '1 hour',
      location: 'Malabon, Metro Manila',
      description: 'Thick rice noodles in a rich orange shrimp sauce, topped with shrimp, squid, flaked fish, tinapa, and crushed chicharron. A seafood lover\'s dream.',
      image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Rice Noodles (Bihon)', 'Shrimp (Hipon)', 'Squid (Pusit)', 'Smoked Fish (Tinapa)', 'Annatto Seeds (Atsuete)', 'Garlic', 'Onion', 'Fish Sauce (Patis)', 'Chicharron (Pork Crackling)', 'Eggs']),
      user_id: MARIA,
      family_history_id: fh6,
    },
    {
      name: 'Pancit Palabok',
      category: 'Noodles',
      type: 'Seafood',
      duration: '1 hour',
      location: 'Luzon',
      description: 'Thin rice noodles drenched in a savory annatto-shrimp sauce and garnished with shrimp, crushed chicharron, hard-boiled eggs, and calamansi.',
      image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Rice Noodles (Bihon)', 'Shrimp (Hipon)', 'Annatto Seeds (Atsuete)', 'Garlic', 'Onion', 'Fish Sauce (Patis)', 'Chicharron (Pork Crackling)', 'Eggs', 'Calamansi', 'Green Onions (Sibuyas Dahon)']),
      user_id: JOSE,
      family_history_id: null,
    },
    {
      name: 'Sotanghon Guisado',
      category: 'Noodles',
      type: 'Chicken',
      duration: '40 minutes',
      location: 'Nationwide',
      description: 'Glass noodles stir-fried with chicken, vegetables, and a savory oyster-soy sauce. Light, translucent, and absolutely delicious.',
      image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Glass Noodles (Sotanghon)', 'Chicken', 'Cabbage', 'Carrots', 'Garlic', 'Onion', 'Soy Sauce', 'Oyster Sauce', 'Cooking Oil', 'Green Onions (Sibuyas Dahon)']),
      user_id: ANA,
      family_history_id: null,
    },
    // ── DESSERTS ──────────────────────────────────────────────────────────────
    {
      name: 'Biko',
      category: 'Dessert',
      type: 'Dessert',
      duration: '1 hour',
      location: 'Nationwide',
      description: 'Sweet sticky rice cooked in coconut milk and brown sugar, topped with latik (caramelized coconut cream curds). A beloved Filipino kakanin.',
      image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Glutinous Rice (Malagkit)', 'Coconut Milk (Gata)', 'Brown Sugar', 'Coconut Cream (Kakang Gata)', 'Salt']),
      user_id: MARIA,
      family_history_id: fh7,
    },
    {
      name: 'Maja Blanca',
      category: 'Dessert',
      type: 'Dessert',
      duration: '45 minutes',
      location: 'Nationwide',
      description: 'A smooth, creamy coconut pudding made with cornstarch, coconut milk, and corn kernels, topped with latik. A classic Filipino fiesta dessert.',
      image: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Coconut Milk (Gata)', 'Coconut Cream (Kakang Gata)', 'Condensed Milk', 'Cornstarch', 'Sugar', 'Sweet Corn']),
      user_id: JOSE,
      family_history_id: null,
    },
    {
      name: 'Bibingka',
      category: 'Dessert',
      type: 'Dessert',
      duration: '45 minutes',
      location: 'Nationwide',
      description: 'A traditional Filipino rice cake baked in clay pots lined with banana leaves, topped with salted egg, cheese, and coconut. A Christmas season staple.',
      image: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Rice Flour', 'Eggs', 'Coconut Milk (Gata)', 'Sugar', 'Butter', 'Baking Powder', 'Salt', 'Salted Egg', 'Cheese']),
      user_id: ANA,
      family_history_id: fh5,
    },
    {
      name: 'Palitaw',
      category: 'Dessert',
      type: 'Dessert',
      duration: '30 minutes',
      location: 'Nationwide',
      description: 'Flat, chewy rice cakes made from glutinous rice flour, dropped in boiling water until they float ("litaw"), then rolled in coconut and sesame seeds.',
      image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Glutinous Rice (Malagkit)', 'Sugar', 'Coconut Milk (Gata)', 'Sesame Seeds', 'Salt']),
      user_id: MARIA,
      family_history_id: null,
    },
    // ── BEVERAGES ─────────────────────────────────────────────────────────────
    {
      name: 'Sago\'t Gulaman',
      category: 'Beverage',
      type: 'Beverage',
      duration: '30 minutes',
      location: 'Nationwide',
      description: 'A refreshing Filipino drink of chewy sago pearls and gulaman (agar jelly) in sweetened brown sugar syrup. The ultimate street drink on a hot day.',
      image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Sago Pearls', 'Gulaman (Agar-Agar)', 'Brown Sugar', 'Pandan Leaves', 'Water']),
      user_id: JOSE,
      family_history_id: null,
    },
    {
      name: 'Buko Pandan Shake',
      category: 'Beverage',
      type: 'Beverage',
      duration: '15 minutes',
      location: 'Nationwide',
      description: 'A creamy and fragrant Filipino shake made with young coconut strips, pandan-flavored gulaman, and all-purpose cream. Sweet, tropical, and refreshing.',
      image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Young Coconut (Buko)', 'Pandan Leaves', 'Gulaman (Agar-Agar)', 'Condensed Milk', 'All-Purpose Cream', 'Macapuno (Coconut Sport)']),
      user_id: ANA,
      family_history_id: null,
    },
    {
      name: 'Calamansi Juice',
      category: 'Beverage',
      type: 'Beverage',
      duration: '10 minutes',
      location: 'Nationwide',
      description: 'Freshly squeezed calamansi juice sweetened with sugar and served over ice. The Filipino answer to lemonade — bright, citrusy, and invigorating.',
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&auto=format&fit=crop',
      ingredients: JSON.stringify(['Calamansi', 'Sugar', 'Water', 'Ice']),
      user_id: MARIA,
      family_history_id: null,
    },
  ];
}

async function seedRecipes(fhIds) {
  const recipes = makeRecipes(fhIds);
  console.log(`\nSeeding ${recipes.length} new recipes...`);
  let startId = await nextId('Recipe', 'recipe_id');
  const rows = recipes.map((r, i) => ({ recipe_id: startId + i, ...r }));
  const { error } = await supabase.from('Recipe').insert(rows);
  if (error) console.error('  recipes error:', error.message);
  else console.log(`  Inserted ${rows.length} recipes (IDs ${startId}–${startId + rows.length - 1}).`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await cleanDuplicateIngredients();
  await seedIngredients();
  const fhIds = await seedFamilyHistories();
  await seedRecipes(fhIds);
  console.log('\nAll done!');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
