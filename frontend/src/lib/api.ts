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

/** All backend endpoints return { data: T, error: string | null } */
export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

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
  }) => api.post<ApiResponse<{ message: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ token: string; user: { id: string; email: string; profile: Profile } }>>(
      '/auth/login',
      data
    ),

  logout: () => api.post<ApiResponse<{ message: string }>>('/auth/logout'),
};

// ── Recipes ───────────────────────────────────────────────────────────────────
export const recipesApi = {
  list: (filters?: RecipeFilters) =>
    api.get<PaginatedResponse<Recipe>>('/recipes', { params: filters }),

  get: (id: string) => api.get<ApiResponse<Recipe>>(`/recipes/${id}`),

  create: (data: Partial<CreateRecipeForm>) =>
    api.post<ApiResponse<Recipe>>('/recipes', data),

  update: (id: string, data: Partial<CreateRecipeForm>) =>
    api.put<ApiResponse<Recipe>>(`/recipes/${id}`, data),

  delete: (id: string) => api.delete(`/recipes/${id}`),

  save: (id: string) => api.post(`/recipes/${id}/save`),

  unsave: (id: string) => api.delete(`/recipes/${id}/save`),

  getComments: (id: string) => api.get<ApiResponse<Comment[]>>(`/recipes/${id}/comments`),

  addComment: (id: string, content: string, parent_comment_id?: string) =>
    api.post<ApiResponse<Comment>>(`/recipes/${id}/comments`, { content, parent_comment_id }),
};

// ── Comments ──────────────────────────────────────────────────────────────────
export const commentsApi = {
  update: (id: string, content: string) =>
    api.put<ApiResponse<Comment>>(`/comments/${id}`, { content }),

  delete: (id: string) => api.delete(`/comments/${id}`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: (username: string) => api.get<ApiResponse<Profile>>(`/users/${username}`),

  getUserRecipes: (username: string) => api.get<ApiResponse<Recipe[]>>(`/users/${username}/recipes`),

  getSavedRecipes: () => api.get<ApiResponse<Recipe[]>>('/users/me/saved'),

  updateProfile: (data: Partial<Profile>) => api.put<ApiResponse<Profile>>('/users/me', data),
};

// ── Ingredients ───────────────────────────────────────────────────────────────
export const ingredientsApi = {
  list: (search?: string) =>
    api.get<ApiResponse<IngredientGlossaryItem[]>>('/ingredients', { params: { search } }),
};

export default api;
