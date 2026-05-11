export interface User {
  id: string;
  first_name: string;
  last_name: string | null;
  profile_picture: string | null;
  rating: number | null;
  description: string | null;
}

export interface Recipe {
  recipe_id: number;
  image: string | null;
  name: string;
  description: string | null;
  duration: string | null;
  location: string | null;
  type: string | null;
  ingredients: string | null; // JSON or text
  family_history_id: number | null;
  category: string | null;
  user_id: string;
  // Joined on detail endpoint
  family_history?: FamilyHistory | null;
}

export interface FamilyHistory {
  id: number;
  family_photo: string | null;
  creator: string | null; // user id or name
  family_name_origin: string | null;
  story: string | null;
}

export interface Review {
  id: number;
  user_id: string;
  recipe_id: number;
  rating: number;
  review: string | null;
  name: string | null;
  created_at?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  image: string | null;
  substitutes: string | null; // JSON array or text
}

export interface SavedRecipe {
  id: number;
  user_id: string;
  recipe_id: number;
  recipe?: Recipe | null;
}

export interface AuthUser {
  id: string;
  email: string;
  // Full profile fetched from /me
  profile: User;
}

export interface ApiError {
  error: string;
}

// Form helper types
export interface IngredientRow {
  quantity: string;
  measurement: string;
  ingredient_name: string;
}

export interface InstructionRow {
  description: string;
}
