import axios, { type AxiosError } from 'axios';
import type { Recipe, User, Review, Ingredient, SavedRecipe, FamilyHistory } from './types';

// ── Friendly error messages ───────────────────────────────────────────────────
/**
 * Converts an Axios error from the backend into a human-readable string.
 * Pass a `context` to get domain-specific copy ("login" | "register").
 */
export function getFriendlyError(
  err: unknown,
  context?: 'login' | 'register'
): string {
  const axiosErr = err as AxiosError<{ error?: string }>;
  const status = axiosErr?.response?.status;
  const backendMsg = axiosErr?.response?.data?.error ?? '';

  // No response at all — network or CORS problem
  if (!status) {
    return "Can't reach the server. Check your internet connection and try again.";
  }

  if (context === 'login') {
    if (status === 400 || status === 401) {
      return 'Incorrect email or password. Please try again.';
    }
  }

  if (context === 'register') {
    if (status === 400) {
      const lower = backendMsg.toLowerCase();
      if (lower.includes('already') || lower.includes('exist') || lower.includes('registered')) {
        return 'An account with that email already exists. Try signing in instead.';
      }
      if (lower.includes('password') && lower.includes('short')) {
        return 'Password must be at least 6 characters.';
      }
      return 'Please check your details and try again.';
    }
  }

  // Generic fallbacks by status code
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status >= 500) return 'Something went wrong on our end. Please try again in a moment.';

  // Last resort: use the backend message if it's short enough to show directly
  if (backendMsg && backendMsg.length < 120) return backendMsg;

  return 'Something went wrong. Please try again.';
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// Attach auth token from localStorage if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fip_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
  }) =>
    api.post<{ success: true; user: { id: string; email: string; first_name: string; last_name: string } }>(
      '/register',
      data
    ),

  login: (data: { email: string; password: string }) =>
    api.post<{
      user: { id: string; email: string };
      access_token: string;
      refresh_token: string;
      expires_at: string;
      token_type: string;
    }>('/login', data),

  logout: () => api.post<{ success: true }>('/logout'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  me: () =>
    api.get<{ profile: User; auth: { id: string; email: string } }>('/me'),

  getUser: (id: string) => api.get<User>(`/user/${id}`),

  getUserRecipes: (id: string) => api.get<Recipe[]>(`/user/${id}/recipes`),

  getSavedRecipes: () => api.get<SavedRecipe[]>('/me/saved'),

  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    description?: string;
  }) => api.post<User>('/update-profile', data),
};

// ── Recipes ───────────────────────────────────────────────────────────────────
export const recipesApi = {
  list: (items?: number) =>
    api.get<Recipe[]>('/recipes', { params: items ? { items } : undefined }),

  search: (keyword: string) =>
    api.get<Recipe[]>('/search-recipe', { params: { keyword } }),

  get: (id: number | string) =>
    api.get<Recipe & { family_history: FamilyHistory | null }>(`/recipe/${id}`),

  create: (data: {
    image?: string;
    name: string;
    description?: string;
    duration?: string;
    location?: string;
    ingredients?: string;
    family_history_id?: number;
    category?: string;
    type?: string;
  }) => api.post<Recipe>('/create-recipe', data),

  delete: (recipe_id: number) =>
    api.post<{ success: true }>('/delete-recipe', { recipe_id }),

  save: (recipe_id: number | string) =>
    api.get<{ success: true; saved: SavedRecipe }>('/save-recipe', {
      params: { recipe_id },
    }),

  unsave: (recipe_id: number | string) =>
    api.post<{ success: true }>('/unsave-recipe', { recipe_id }),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsApi = {
  list: (recipe_id: number | string) =>
    api.get<Review[]>('/reviews', { params: { recipe_id } }),

  create: (data: {
    recipe_id: number | string;
    rating: number;
    review?: string;
    name?: string;
  }) => api.post<Review>('/review', data),

  delete: (recipe_id: number | string) =>
    api.post<{ success: true }>('/delete-review', { recipe_id }),
};

// ── Ingredients ───────────────────────────────────────────────────────────────
export const ingredientsApi = {
  list: (items?: number) =>
    api.get<Ingredient[]>('/ingredients', {
      params: items ? { items } : undefined,
    }),
};

// ── Family History ────────────────────────────────────────────────────────────
export const familyHistoryApi = {
  get: (id: number | string) => api.get<FamilyHistory>(`/family-history/${id}`),

  create: (data: {
    family_photo?: string;
    creator?: string;
    family_name_origin?: string;
    story?: string;
  }) => api.post<FamilyHistory>('/family-history', data),
};

export default api;
