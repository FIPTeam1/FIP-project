'use client';

import { useEffect, useState } from 'react';
import { recipesApi } from '@/lib/api';
import type { Recipe } from '@/lib/types';
import RecipeGrid from '@/components/recipes/RecipeGrid';

const REGIONS = ['All', 'Luzon', 'Visayas', 'Mindanao', 'Cebu', 'Manila'];
const LIMIT = 12;

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const res = await recipesApi.list({ search, region, page, limit: LIMIT });
        setRecipes(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRecipes, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, region, page]);

  const handleRegionClick = (r: string) => {
    setRegion(r === 'All' ? '' : r);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="px-6 py-8 lg:px-[100px] lg:py-[80px]">
      {/* Heading */}
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Browse Recipes</h1>

      {/* Search bar */}
      <div className="relative w-full max-w-md mb-4">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search recipes..."
          className="input input-bordered w-full pl-9"
        />
      </div>

      {/* Region filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {REGIONS.map((r) => {
          const isActive = r === 'All' ? region === '' : region === r;
          return (
            <button
              key={r}
              onClick={() => handleRegionClick(r)}
              className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-ghost'}`}
            >
              {r}
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
          <p className="text-lg font-medium text-gray-600">No recipes found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
