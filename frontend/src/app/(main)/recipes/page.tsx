'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { recipesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Recipe } from '@/lib/types';
import RecipeCard from '@/components/recipes/RecipeCard';
import RecipeGrid from '@/components/recipes/RecipeGrid';

// ── Category circles ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Appetizers',  image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&auto=format&fit=crop', filter: 'Appetizer' },
  { name: 'Entrees',     image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop', filter: 'Main Course' },
  { name: 'Sides',       image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=200&auto=format&fit=crop', filter: 'Noodles' },
  { name: 'Desserts',    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=200&auto=format&fit=crop', filter: 'Dessert' },
  { name: 'Beverages',   image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=200&auto=format&fit=crop', filter: 'Beverage' },
  { name: 'Soups',       image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&auto=format&fit=crop', filter: 'Soup' },
];

// ── Search icon ───────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Section header with "see all" ─────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-4 px-4 sm:px-8 md:px-[100px]">
      <h2 className="text-[18px] font-semibold text-[#111827]">{title}</h2>
      <Link href="/recipes" className="text-[13px] font-medium text-[#5555FF] hover:underline flex items-center gap-0.5">
        see all
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  );
}

// ── Skeleton card for loading ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shrink-0 w-[170px] sm:w-[230px] border border-[#F0F0F0] animate-pulse">
      <div className="h-[145px] bg-[#F0F0F0]" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-[#F0F0F0] rounded w-4/5" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-[#F0F0F0] rounded-full" />
          <div className="h-5 w-14 bg-[#F0F0F0] rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Horizontal recipe row ─────────────────────────────────────────────────────
function RecipeRow({ title, recipes, loading = false }: { title: string; recipes: Recipe[]; loading?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!loading && recipes.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader title={title} />
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-4 sm:px-8 md:px-[100px] scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : recipes.map((recipe) => (
              <div key={recipe.recipe_id} className="shrink-0 w-[170px] sm:w-[230px]">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
      </div>
    </section>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function RecipesPage() {
  const { user } = useAuth();
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load all recipes once
  useEffect(() => {
    recipesApi
      .list()
      .then((res) => setAllRecipes(res.data))
      .catch(() => setAllRecipes([]))
      .finally(() => setLoading(false));
  }, []);

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await recipesApi.search(search.trim());
        setSearchResults(res.data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const displayName = user?.profile?.first_name || 'Ka';
  const initials = user
    ? [(user.profile.first_name || '')[0], (user.profile.last_name || '')[0]]
        .filter(Boolean)
        .join('')
        .toUpperCase()
    : '?';

  // Derived recipe sections
  const trending = allRecipes;
  const mainDishes = allRecipes.filter(
    (r) => r.category === 'Main Course' || r.type === 'Chicken' || r.type === 'Pork' || r.type === 'Seafood'
  );
  const desserts = allRecipes.filter((r) => r.category === 'Dessert');
  const familyDishes = allRecipes.filter((r) => r.family_history_id != null);

  // Category filter view
  const categoryFiltered = activeCategory
    ? allRecipes.filter(
        (r) =>
          r.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
          r.type?.toLowerCase().includes(activeCategory.toLowerCase())
      )
    : null;

  const showSearch = search.trim().length > 0;
  const showCategoryFilter = !showSearch && activeCategory !== null;

  return (
    <div className="bg-[#FBFBFB] min-h-screen">

      {/* ── Greeting header ── */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4 sm:px-8 md:px-[100px]">
        <div
          className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-full overflow-hidden flex items-center justify-center mb-3 shrink-0"
          style={{ backgroundColor: '#FCAF3B' }}
        >
          {user?.profile?.profile_picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profile.profile_picture}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-xl leading-none">{initials}</span>
          )}
        </div>
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#111827] text-center">
          Kain na, {displayName}!
        </h1>
      </div>

      {/* ── Search bar ── */}
      <div className="px-4 sm:px-8 md:px-[100px] mb-8">
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#909090]">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveCategory(null);
            }}
            placeholder="Search for a recipe..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#F0F0F0] rounded-xl text-[14px] text-[#111827] placeholder-[#BDBDBD] focus:outline-none focus:border-[#FCAF3B] transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* ── Search results ── */}
      {showSearch && (
        <div className="px-4 sm:px-8 md:px-[100px] mb-10">
          <p className="text-[13px] text-[#909090] mb-5">
            {searching
              ? 'Searching…'
              : `${searchResults?.length ?? 0} result${searchResults?.length !== 1 ? 's' : ''} for "${search}"`}
          </p>
          <RecipeGrid recipes={searchResults ?? []} loading={searching} />
          {!searching && (searchResults?.length ?? 0) === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="text-5xl mb-4">🍽️</span>
              <p className="text-[16px] font-semibold text-[#374151]">No recipes found</p>
              <p className="text-[14px] text-[#909090] mt-1">Try a different search term.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Category filter results ── */}
      {showCategoryFilter && !showSearch && (
        <div className="px-4 sm:px-8 md:px-[100px] mb-10">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setActiveCategory(null)}
              className="text-[13px] text-[#5555FF] hover:underline flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              All recipes
            </button>
            <span className="text-[13px] text-[#909090]">
              {activeCategory} ({categoryFiltered?.length ?? 0})
            </span>
          </div>
          <RecipeGrid recipes={categoryFiltered ?? []} loading={false} />
          {(categoryFiltered?.length ?? 0) === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="text-5xl mb-4">🍽️</span>
              <p className="text-[16px] font-semibold text-[#374151]">No {activeCategory} recipes yet</p>
            </div>
          )}
        </div>
      )}

      {/* ── Home feed (no search or category filter active) ── */}
      {!showSearch && !showCategoryFilter && (
        <>
          {/* Main Categories */}
          <section className="mb-8">
            <SectionHeader title="Main Categories" />
            <div
              className="flex gap-3 sm:gap-5 overflow-x-auto pb-2 px-4 sm:px-8 md:px-[100px] scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.filter)}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className="w-[72px] h-[72px] sm:w-[104px] sm:h-[104px] rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-[#FCAF3B] transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[11px] sm:text-[14px] font-semibold text-[#374151] group-hover:text-[#FCAF3B] transition-colors">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Trending Recipes */}
          <RecipeRow title="Trending Recipes" recipes={trending} loading={loading} />

          {/* Main Dishes */}
          {(loading || mainDishes.length > 0) && (
            <RecipeRow title="Main Dishes" recipes={mainDishes} loading={loading} />
          )}

          {/* Desserts & Sweets */}
          {(loading || desserts.length > 0) && (
            <RecipeRow title="Desserts & Sweets" recipes={desserts} loading={loading} />
          )}

          {/* Family Heritage Dishes */}
          {(loading || familyDishes.length > 0) && (
            <RecipeRow title="Family Party Dishes" recipes={familyDishes} loading={loading} />
          )}

          {/* Empty state — only if fully loaded and no recipes at all */}
          {!loading && allRecipes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <span className="text-6xl mb-4">🍽️</span>
              <p className="text-[18px] font-semibold text-[#374151]">No recipes yet</p>
              <p className="text-[14px] text-[#909090] mt-1 mb-5">Be the first to share a Filipino recipe!</p>
              <Link
                href="/recipes/create"
                className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white"
                style={{ backgroundColor: '#FCAF3B' }}
              >
                Create Recipe
              </Link>
            </div>
          )}
        </>
      )}

      {/* Bottom padding */}
      <div className="h-10" />
    </div>
  );
}
