'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { recipesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Recipe } from '@/lib/types';
import RecipeDetail from '@/components/recipes/RecipeDetail';
import FamilyHistory from '@/components/recipes/FamilyHistory';
import CommentSection from '@/components/recipes/CommentSection';

type Tab = 'recipe' | 'family';

function getInitials(recipe: Recipe): string {
  const first = recipe.creator?.first_name ?? '';
  const last = recipe.creator?.last_name ?? '';
  if (first || last) return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  return (recipe.creator?.username ?? '?').slice(0, 2).toUpperCase();
}

function SkeletonLoader() {
  return (
    <div className="px-[100px] py-8 space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-base-300" />
      <div className="h-8 w-64 rounded bg-base-300" />
      <div className="h-4 w-48 rounded bg-base-300" />
      <div className="w-full aspect-[16/7] rounded-xl bg-base-300" />
      <div className="flex gap-3">
        <div className="h-6 w-24 rounded-full bg-base-300" />
        <div className="h-6 w-20 rounded-full bg-base-300" />
        <div className="h-6 w-20 rounded-full bg-base-300" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-base-300" />
        <div className="h-3 w-5/6 rounded bg-base-300" />
        <div className="h-3 w-4/6 rounded bg-base-300" />
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('recipe');
  const [isSaved, setIsSaved] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await recipesApi.get(id);
        setRecipe(res.data);
        setIsSaved(res.data.is_saved ?? false);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr?.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!user || !recipe) return;
    setSavingInProgress(true);
    try {
      if (isSaved) {
        await recipesApi.unsave(recipe.id);
        setIsSaved(false);
      } else {
        await recipesApi.save(recipe.id);
        setIsSaved(true);
      }
    } catch {
      // ignore
    } finally {
      setSavingInProgress(false);
    }
  };

  if (loading) return <SkeletonLoader />;

  if (notFound || !recipe) {
    return (
      <div className="px-[100px] py-16 flex flex-col items-center gap-4">
        <span className="text-6xl">🍽️</span>
        <h1 className="text-h1 font-semibold text-base-content">Recipe not found</h1>
        <Link
          href="/recipes"
          className="text-body font-medium uppercase tracking-wide"
          style={{ color: '#5555FF' }}
        >
          ← Back to Recipes
        </Link>
      </div>
    );
  }

  const initials = getInitials(recipe);
  const authorName =
    recipe.creator?.username ??
    [recipe.creator?.first_name, recipe.creator?.last_name].filter(Boolean).join(' ') ??
    'Unknown';

  return (
    <div className="px-[100px] py-8 space-y-6 bg-[#FBFBFB] min-h-screen">
      {/* Breadcrumb */}
      <Link
        href="/recipes"
        className="inline-block text-xs font-semibold uppercase tracking-widest"
        style={{ color: '#5555FF' }}
      >
        ← Back to Recipes
      </Link>

      {/* Title */}
      <h1 className="text-title font-bold text-base-content leading-tight">
        {recipe.title}
      </h1>

      {/* Author row + Save button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-body text-base-content/60">Recipe by</span>
          {/* Avatar circle */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: '#FCAF3B' }}
          >
            {initials}
          </div>
          <span className="text-body font-medium text-base-content">{authorName}</span>
        </div>

        {/* Save Recipe button */}
        {user && (
          <button
            onClick={handleSaveToggle}
            disabled={savingInProgress}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: '#5555FF' }}
          >
            {savingInProgress
              ? '…'
              : isSaved
              ? '✓ Saved'
              : 'Save Recipe'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-base-300 flex gap-8">
        {(['recipe', 'family'] as const).map((tab) => {
          const label = tab === 'recipe' ? 'Recipe Instructions' : 'Family History';
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-[#FCAF3B] text-base-content'
                  : 'text-base-content/50 hover:text-base-content'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'recipe' ? (
        <RecipeDetail recipe={recipe} />
      ) : (
        <FamilyHistory familyHistory={recipe.family_history} />
      )}

      {/* Comments */}
      <div className="pt-4 border-t border-base-300">
        <CommentSection recipeId={recipe.id} />
      </div>
    </div>
  );
}
