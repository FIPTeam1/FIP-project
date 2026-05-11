'use client';

import { useEffect, useState } from 'react';
import { recipesApi } from '@/lib/api';
import type { Recipe } from '@/lib/types';
import RecipeGrid from '@/components/recipes/RecipeGrid';

const CATEGORIES = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snack', 'Soup'];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        let data: Recipe[];
        if (search.trim()) {
          const res = await recipesApi.search(search.trim());
          data = res.data;
        } else {
          const res = await recipesApi.list();
          data = res.data;
        }

        // Client-side category filter
        if (activeCategory && activeCategory !== 'All') {
          data = data.filter(
            (r) =>
              r.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
              r.type?.toLowerCase().includes(activeCategory.toLowerCase())
          );
        }

        setRecipes(data);
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRecipes, search.trim() ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  return (
    <div className="px-6 py-8 md:px-[100px] md:py-10 bg-[#FBFBFB] min-h-screen">

      {/* Page heading */}
      <h1 className="text-[32px] font-bold text-[#111827] mb-6">Recipe Library</h1>

      {/* Search bar */}
      <div className="relative w-full max-w-lg mb-5">
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
          placeholder="Search recipes..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#F0F0F0] rounded-lg text-[14px] text-[#111827] placeholder-[#909090] focus:outline-none focus:border-[#5555FF] transition-colors"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border ${
                isActive
                  ? 'bg-[#5555FF] text-white border-[#5555FF]'
                  : 'bg-white text-[#374151] border-[#F0F0F0] hover:border-[#5555FF] hover:text-[#5555FF]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Recipe grid */}
      <RecipeGrid recipes={recipes} loading={loading} />

      {/* Empty state */}
      {!loading && recipes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl mb-4">🍽️</span>
          <p className="text-[18px] font-semibold text-[#374151]">No recipes found</p>
          <p className="text-[14px] text-[#909090] mt-1">
            Try a different search or category filter.
          </p>
        </div>
      )}
    </div>
  );
}
