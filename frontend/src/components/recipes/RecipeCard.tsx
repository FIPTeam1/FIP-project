import Link from 'next/link';
import type { Recipe } from '@/lib/types';

// ── Badge icons ────────────────────────────────────────────────────────────────
function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.recipe_id}`} className="block group h-full">
      <div className="bg-white rounded-2xl overflow-hidden border border-[#F0F0F0] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">

        {/* Image */}
        <div className="h-[148px] bg-[#F5F5F5] overflow-hidden flex-shrink-0">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
          )}
        </div>

        {/* Content */}
        <div className="px-3 py-3 flex flex-col gap-2 flex-1">
          <h3 className="text-[13px] font-semibold text-[#111827] line-clamp-2 leading-snug group-hover:text-[#FCAF3B] transition-colors">
            {recipe.name}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {recipe.location && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF5FF] text-[#2D7DD2]">
                <PinIcon />
                {recipe.location.split(',')[0]}
              </span>
            )}
            {recipe.duration && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF8EC] text-[#B97A1A]">
                <ClockIcon />
                {recipe.duration}
              </span>
            )}
            {recipe.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF0F6] text-[#C2185B]">
                <UsersIcon />
                {recipe.category}
              </span>
            )}
          </div>
        </div>

      </div>
    </Link>
  );
}
