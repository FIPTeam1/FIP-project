'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { recipesApi, usersApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Recipe, User } from '@/lib/types';
import RecipeDetail from '@/components/recipes/RecipeDetail';
import FamilyHistory from '@/components/recipes/FamilyHistory';
import ReviewSection from '@/components/recipes/ReviewSection';

type Tab = 'recipe' | 'family';

function getInitials(user: User | null): string {
  const first = user?.first_name?.[0] ?? '';
  const last = user?.last_name?.[0] ?? '';
  return (first + last).toUpperCase() || '?';
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SkeletonLoader() {
  return (
    <div className="px-4 sm:px-8 md:px-[100px] py-6 md:py-8 space-y-6 animate-pulse bg-[#FBFBFB] min-h-screen">
      <div className="h-3 w-28 rounded bg-[#F0F0F0]" />
      <div className="h-8 w-72 rounded bg-[#F0F0F0]" />
      <div className="h-4 w-48 rounded bg-[#F0F0F0]" />
      <div className="h-10 w-full rounded bg-[#F0F0F0]" />
      <div className="w-full aspect-[16/7] rounded-2xl bg-[#F0F0F0]" />
      <div className="flex gap-3">
        <div className="h-6 w-24 rounded-full bg-[#F0F0F0]" />
        <div className="h-6 w-20 rounded-full bg-[#F0F0F0]" />
        <div className="h-6 w-20 rounded-full bg-[#F0F0F0]" />
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
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
        if (res.data.user_id) {
          try {
            const userRes = await usersApi.getUser(res.data.user_id);
            setAuthor(userRes.data);
          } catch { /* author optional */ }
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr?.response?.status === 404) setNotFound(true);
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
        await recipesApi.unsave(recipe.recipe_id);
        setIsSaved(false);
      } else {
        await recipesApi.save(recipe.recipe_id);
        setIsSaved(true);
      }
    } catch { /* ignore */ }
    finally { setSavingInProgress(false); }
  };

  if (loading) return <SkeletonLoader />;

  if (notFound || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#FBFBFB]">
        <span className="text-6xl">🍽️</span>
        <h1 className="text-[22px] font-semibold text-[#111827]">Recipe not found</h1>
        <Link href="/recipes" className="text-[13px] font-semibold text-[#6A9CB5] uppercase tracking-wider hover:underline">
          ← Back to Recipes
        </Link>
      </div>
    );
  }

  const initials = getInitials(author);
  const authorName = author
    ? [author.first_name, author.last_name].filter(Boolean).join(' ')
    : 'Unknown';

  return (
    <div className="bg-[#FBFBFB] min-h-screen">
      <div className="px-4 sm:px-8 md:px-[100px] py-6 md:py-8">

        {/* ── Breadcrumb ── */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#6A9CB5] hover:opacity-70 transition-opacity mb-6"
        >
          <BackArrow />
          Back to Recipes
        </Link>

        {/* ── Title ── */}
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#111827] leading-tight mb-4">
          {recipe.name}
        </h1>

        {/* ── Author + Save ── */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#909090]">Recipe by</span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: '#6A9CB5' }}
            >
              {initials}
            </div>
            <span className="text-[14px] font-semibold text-[#111827]">{authorName}</span>
          </div>

          {user && (
            <button
              onClick={handleSaveToggle}
              disabled={savingInProgress}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all border ${
                isSaved
                  ? 'bg-[#6A9CB5] text-white border-[#6A9CB5]'
                  : 'bg-white text-[#6A9CB5] border-[#6A9CB5] hover:bg-[#6A9CB5] hover:text-white'
              } disabled:opacity-50`}
            >
              <SaveIcon />
              {savingInProgress ? '…' : isSaved ? 'Saved' : 'Save Recipe'}
            </button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-[#F0F0F0] mb-6">
          {(['recipe', 'family'] as const).map((tab) => {
            const label = tab === 'recipe' ? 'Recipe Instructions' : 'Family History';
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-6 py-3 text-[12px] sm:text-[13px] font-semibold transition-colors border-b-2 -mb-px ${
                  isActive
                    ? 'border-[#6A9CB5] text-[#111827]'
                    : 'border-transparent text-[#909090] hover:text-[#111827]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        {activeTab === 'recipe' ? (
          <>
            <RecipeDetail recipe={recipe} />
            <div className="mt-8 pt-8 border-t border-[#F0F0F0]">
              <ReviewSection recipeId={recipe.recipe_id} />
            </div>
          </>
        ) : (
          <FamilyHistory familyHistory={recipe.family_history} />
        )}

      </div>
    </div>
  );
}
