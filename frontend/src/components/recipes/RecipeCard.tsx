import Link from 'next/link';
import type { Recipe } from '@/lib/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.recipe_id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden border border-[#F0F0F0] hover:shadow-md transition-shadow duration-200 h-full flex flex-col">

        {/* Image */}
        <div className="h-[200px] bg-[#F0F0F0] overflow-hidden flex-shrink-0">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-[#909090]">
              🍽️
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <h3 className="text-[15px] font-semibold text-[#111827] line-clamp-2 group-hover:text-[#5555FF] transition-colors leading-snug">
            {recipe.name}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {recipe.location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#E8F4FD] text-[#2D7DD2]">
                📍 {recipe.location}
              </span>
            )}
            {recipe.duration && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#FEF3E2] text-[#D4760A]">
                ⏱ {recipe.duration}
              </span>
            )}
            {recipe.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#FDE8F0] text-[#C2185B]">
                {recipe.category}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
