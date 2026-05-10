'use client';

import { useEffect, useState, useCallback } from 'react';
import { ingredientsApi } from '@/lib/api';
import type { IngredientGlossaryItem } from '@/lib/types';
import IngredientGrid from '@/components/ingredients/IngredientGrid';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IngredientGlossaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchIngredients = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ingredientsApi.list(query || undefined);
      setIngredients(res.data.data);
    } catch {
      setError('Failed to load ingredients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients(debouncedSearch);
  }, [debouncedSearch, fetchIngredients]);

  return (
    <div className="px-6 md:px-[100px] py-10 min-h-screen bg-base-100">
      {/* Page heading */}
      <h1 className="text-title text-base-content mb-6">Ingredient Glossary</h1>

      {/* Search bar */}
      <div className="mb-8">
        <label htmlFor="ingredient-search" className="sr-only">
          Search ingredients
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-base-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </span>
          <input
            id="ingredient-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients..."
            className="input input-bordered w-full pl-11 bg-white border-base-200 focus:border-primary focus:outline-none text-body"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Ingredient grid */}
      <IngredientGrid ingredients={ingredients} loading={loading} />
    </div>
  );
}
