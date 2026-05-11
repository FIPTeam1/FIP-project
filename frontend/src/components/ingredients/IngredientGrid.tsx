'use client';

import type { Ingredient } from '@/lib/types';
import IngredientCard from './IngredientCard';

interface Props {
  ingredients: Ingredient[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#F0F0F0]" />
      <div className="p-4">
        <div className="h-4 bg-[#F0F0F0] rounded w-2/3" />
      </div>
    </div>
  );
}

export default function IngredientGrid({ ingredients, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-5xl">🌿</span>
        <p className="text-[16px] font-medium text-[#909090]">No ingredients found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {ingredients.map((item) => (
        <IngredientCard key={item.id} item={item} />
      ))}
    </div>
  );
}
