import type { Recipe } from '@/lib/types';
import RecipeCard from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#F0F0F0] animate-pulse">
      <div className="h-[148px] bg-[#F0F0F0]" />
      <div className="px-3 py-3 space-y-2">
        <div className="h-3.5 bg-[#F0F0F0] rounded w-3/4" />
        <div className="h-3 bg-[#F0F0F0] rounded w-1/2" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 w-16 bg-[#F0F0F0] rounded-full" />
          <div className="h-5 w-14 bg-[#F0F0F0] rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function RecipeGrid({ recipes, loading }: RecipeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.recipe_id} recipe={recipe} />
      ))}
    </div>
  );
}
