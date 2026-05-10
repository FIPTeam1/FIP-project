'use client';

import type { Recipe } from '@/lib/types';
import Badge from '@/components/ui/Badge';

interface RecipeDetailProps {
  recipe: Recipe;
}

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
  const sortedIngredients = [...(recipe.ingredients ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );
  const sortedInstructions = [...(recipe.instructions ?? [])].sort(
    (a, b) => a.step_number - b.step_number
  );

  return (
    <div className="space-y-6">
      {/* Hero image */}
      <div className="w-full aspect-[16/7] rounded-xl overflow-hidden bg-base-200 flex items-center justify-center">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl">🍽️</span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {recipe.location_of_origin && (
          <Badge type="location" value={recipe.location_of_origin} />
        )}
        {recipe.time_duration && (
          <Badge type="time" value={recipe.time_duration} />
        )}
        {recipe.servings != null && (
          <Badge type="serves" value={`${recipe.servings} servings`} />
        )}
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-body text-base-content/80 leading-relaxed">
          {recipe.description}
        </p>
      )}

      {/* Ingredients */}
      {sortedIngredients.length > 0 && (
        <div>
          <h2 className="text-h1 font-semibold text-base-content mb-3">
            Ingredients
          </h2>
          <ul className="space-y-2">
            {sortedIngredients.map((ing) => (
              <li key={ing.id} className="flex items-start gap-2 text-body">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#FCAF3B] flex-shrink-0" />
                <span className="text-base-content">
                  {[ing.quantity, ing.measurement, ing.ingredient_name]
                    .filter(Boolean)
                    .join(' ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions */}
      {sortedInstructions.length > 0 && (
        <div>
          <h2 className="text-h1 font-semibold text-base-content mb-3">
            Instructions
          </h2>
          <ol className="space-y-4">
            {sortedInstructions.map((step) => (
              <li key={step.id} className="flex gap-4">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: '#FCAF3B' }}
                >
                  {step.step_number}
                </span>
                <p className="text-body text-base-content/90 leading-relaxed pt-0.5">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
