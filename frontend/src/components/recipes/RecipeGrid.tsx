import type { Recipe } from '@/lib/types';
import RecipeCard from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden animate-pulse">
      <div className="h-[200px] bg-[#F0F0F0]" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-[#F0F0F0] rounded w-3/4" />
        <div className="h-4 bg-[#F0F0F0] rounded w-1/2" />
        <div className="flex gap-2 mt-1">
          <div className="h-6 w-20 bg-[#F0F0F0] rounded-full" />
          <div className="h-6 w-16 bg-[#F0F0F0] rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function RecipeGrid({ recipes, loading }: RecipeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.recipe_id} recipe={recipe} />
      ))}
    </div>
  );
}
