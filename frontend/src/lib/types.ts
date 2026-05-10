export interface Profile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  average_rating?: number;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  quantity: string | null;
  measurement: string | null;
  ingredient_name: string;
  order_index: number;
}

export interface RecipeInstruction {
  id: string;
  recipe_id: string;
  step_number: number;
  description: string;
}

export interface FamilyHistory {
  id: string;
  recipe_id: string;
  creator_name: string | null;
  family_name: string | null;
  ancestral_origin: string | null;
  story: string | null;
  photo_url: string | null;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location_of_origin: string | null;
  servings: number | null;
  time_duration: string | null;
  creator_id: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  ingredients?: RecipeIngredient[];
  instructions?: RecipeInstruction[];
  family_history?: FamilyHistory | null;
  is_saved?: boolean;
  average_rating?: number;
}

export interface Comment {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
  replies?: Comment[];
}

export interface IngredientSubstitute {
  id: string;
  ingredient_id: string;
  name: string;
  price_range: string | null;
  unit: string | null;
  image_url: string | null;
}

export interface IngredientGlossaryItem {
  id: string;
  name: string;
  image_url: string | null;
  substitutes?: IngredientSubstitute[];
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface RecipeFilters {
  search?: string;
  region?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// Form types
export interface IngredientRow {
  quantity: string;
  measurement: string;
  ingredient_name: string;
}

export interface InstructionRow {
  description: string;
}

export interface CreateRecipeForm {
  title: string;
  description: string;
  location_of_origin: string;
  servings: string;
  time_duration: string;
  image_url: string;
  ingredients: IngredientRow[];
  instructions: InstructionRow[];
  family_creator_name: string;
  family_name: string;
  family_origin: string;
  family_story: string;
  family_photo_url: string;
}
