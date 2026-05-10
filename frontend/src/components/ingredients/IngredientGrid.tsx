'use client';

import type { IngredientGlossaryItem } from '@/lib/types';
import IngredientCard from './IngredientCard';

interface Props {
  ingredients: IngredientGlossaryItem[];
  loading?: boolean;
}

export default function IngredientGrid({ ingredients, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="skeleton h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-base-300">
        <span className="text-5xl">🌿</span>
        <p className="text-h3">No ingredients found.</p>
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
