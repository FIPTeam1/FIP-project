'use client';

import type { Recipe } from '@/lib/types';

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function parseIngredients(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
  } catch { /* not JSON */ }
  return raw.split(/\n/).map((s) => s.trim()).filter(Boolean);
}

interface RecipeDetailProps {
  recipe: Recipe;
}

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
  const ingredientList = parseIngredients(recipe.ingredients);

  return (
    <div>
      {/* ── Hero image ── */}
      <div className="w-full aspect-[16/7] rounded-2xl overflow-hidden bg-[#F0F0F0] mb-6">
        {recipe.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">🍽️</div>
        )}
      </div>

      {/* ── Badges row ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {recipe.location && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#EBF5FF] text-[#2D7DD2]">
            <PinIcon />
            {recipe.location}
          </span>
        )}
        {recipe.duration && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFF8EC] text-[#B97A1A]">
            <ClockIcon />
            {recipe.duration}
          </span>
        )}
        {recipe.category && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFF0F6] text-[#C2185B]">
            <TagIcon />
            {recipe.category}
          </span>
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

        {/* Left column: Ingredients */}
        {ingredientList.length > 0 && (
          <div className="w-full md:w-[260px] shrink-0 bg-white rounded-2xl border border-[#F0F0F0] p-5 md:sticky md:top-6">
            <h2 className="text-[15px] font-semibold text-[#111827] mb-4">
              Ingredients
            </h2>
            <ul className="space-y-2.5">
              {ingredientList.map((ing, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#374151] leading-snug">
                  <span
                    className="mt-[5px] w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ backgroundColor: '#FCAF3B' }}
                  />
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Right column: How to Cook */}
        <div className="flex-1 min-w-0 space-y-4">
          {recipe.type && recipe.type !== recipe.category && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9FAFB] rounded-lg text-[12px] text-[#6B7280]">
              <TagIcon />
              <span className="font-medium">{recipe.type}</span>
            </div>
          )}

          <div className="bg-[#FFFBF3] border border-[#FDE68A]/60 rounded-2xl p-6">
            <p className="text-[11px] font-bold text-[#B45309] uppercase tracking-widest mb-4">
              How to Cook
            </p>
            {recipe.description ? (
              <div
                className="recipe-prose"
                dangerouslySetInnerHTML={{ __html: recipe.description }}
              />
            ) : (
              <p className="text-[14px] text-[#374151] leading-relaxed italic opacity-60">
                No instructions provided yet.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
