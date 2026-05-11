'use client';

import { useEffect, useState } from 'react';
import { ingredientsApi } from '@/lib/api';
import type { Ingredient } from '@/lib/types';
import IngredientGrid from '@/components/ingredients/IngredientGrid';

export default function IngredientsPage() {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [filtered, setFiltered] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch all ingredients once
  useEffect(() => {
    setLoading(true);
    setError(null);
    ingredientsApi
      .list()
      .then((res) => {
        setAllIngredients(res.data);
        setFiltered(res.data);
      })
      .catch(() => setError('Failed to load ingredients. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Client-side debounced filter
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.trim().toLowerCase();
      if (!q) {
        setFiltered(allIngredients);
      } else {
        setFiltered(allIngredients.filter((i) => i.name.toLowerCase().includes(q)));
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [search, allIngredients]);

  return (
    <div className="px-6 py-8 md:px-[100px] md:py-10 bg-[#FBFBFB] min-h-screen">

      {/* Page heading */}
      <h1 className="text-[32px] font-bold text-[#111827] mb-6">Ingredient Glossary</h1>

      {/* Search bar */}
      <div className="relative w-full max-w-lg mb-8">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#909090]">
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
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ingredients..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#F0F0F0] rounded-lg text-[14px] text-[#111827] placeholder-[#909090] focus:outline-none focus:border-[#5555FF] transition-colors"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-[#FEE2E2] border border-[#F04C4C]/30 rounded-lg px-4 py-3 mb-6 text-[14px] text-[#F04C4C]">
          {error}
        </div>
      )}

      {/* Ingredient grid */}
      <IngredientGrid ingredients={filtered} loading={loading} />
    </div>
  );
}
