import axios from 'axios';
import type {
  Recipe,
  Profile,
  Comment,
  IngredientGlossaryItem,
  PaginatedResponse,
  RecipeFilters,
  CreateRecipeForm,
} from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
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
    username: string;
    first_name: string;
    last_name: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: { id: string; email: string; profile: Profile } }>(
      '/auth/login',
      data
    ),

  logout: () => api.post('/auth/logout'),
};

// ── Recipes ───────────────────────────────────────────────────────────────────
export const recipesApi = {
  list: (filters?: RecipeFilters) =>
    api.get<PaginatedResponse<Recipe>>('/recipes', { params: filters }),

  get: (id: string) => api.get<Recipe>(`/recipes/${id}`),

  create: (data: Partial<CreateRecipeForm>) =>
    api.post<Recipe>('/recipes', data),

  update: (id: string, data: Partial<CreateRecipeForm>) =>
    api.put<Recipe>(`/recipes/${id}`, data),

  delete: (id: string) => api.delete(`/recipes/${id}`),

  save: (id: string) => api.post(`/recipes/${id}/save`),

  unsave: (id: string) => api.delete(`/recipes/${id}/save`),

  getComments: (id: string) => api.get<Comment[]>(`/recipes/${id}/comments`),

  addComment: (id: string, content: string, parent_comment_id?: string) =>
    api.post<Comment>(`/recipes/${id}/comments`, { content, parent_comment_id }),
};

// ── Comments ──────────────────────────────────────────────────────────────────
export const commentsApi = {
  update: (id: string, content: string) =>
    api.put<Comment>(`/comments/${id}`, { content }),

  delete: (id: string) => api.delete(`/comments/${id}`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: (username: string) => api.get<Profile>(`/users/${username}`),

  getUserRecipes: (username: string) => api.get<Recipe[]>(`/users/${username}/recipes`),

  getSavedRecipes: () => api.get<Recipe[]>('/users/me/saved'),

  updateProfile: (data: Partial<Profile>) => api.put<Profile>('/users/me', data),
};

// ── Ingredients ───────────────────────────────────────────────────────────────
export const ingredientsApi = {
  list: (search?: string) =>
    api.get<IngredientGlossaryItem[]>('/ingredients', { params: { search } }),
};

export default api;
