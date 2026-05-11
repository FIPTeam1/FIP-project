'use client';

import type { Recipe } from '@/lib/types';
import Badge from '@/components/ui/Badge';

interface RecipeDetailProps {
  recipe: Recipe;
}

function parseIngredients(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    // Not JSON — split by comma or newline
    return raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [raw];
}

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
  const ingredientList = parseIngredients(recipe.ingredients);

  return (
    <div className="space-y-6">
      {/* Hero image */}
      <div className="w-full aspect-[16/7] rounded-xl overflow-hidden bg-base-200 flex items-center justify-center">
        {recipe.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl">🍽️</span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {recipe.location && (
          <Badge type="location" value={recipe.location} />
        )}
        {recipe.duration && (
          <Badge type="time" value={recipe.duration} />
        )}
        {recipe.category && (
          <Badge type="serves" value={recipe.category} />
        )}
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-[14px] text-base-content/80 leading-relaxed">
          {recipe.description}
        </p>
      )}

      {/* Ingredients */}
      {ingredientList.length > 0 && (
        <div>
          <h2 className="text-[22px] font-semibold text-base-content mb-3">
            Ingredients
          </h2>
          <ul className="space-y-2">
            {ingredientList.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px]">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#FCAF3B] flex-shrink-0" />
                <span className="text-base-content">{ing}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Type / extra info */}
      {recipe.type && (
        <div>
          <h2 className="text-[22px] font-semibold text-base-content mb-1">Type</h2>
          <p className="text-[14px] text-base-content/80">{recipe.type}</p>
        </div>
      )}
    </div>
  );
}
