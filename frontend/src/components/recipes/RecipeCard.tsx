import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { Recipe } from '@/lib/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-base-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Image */}
        <div className="aspect-[4/3] bg-base-200 overflow-hidden">
          {recipe.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <h3 className="text-h3 font-semibold text-gray-900 line-clamp-2 group-hover:text-secondary transition-colors">
            {recipe.title}
          </h3>

          <div className="flex flex-wrap gap-2 mt-auto">
            {recipe.location_of_origin && (
              <Badge type="location" value={recipe.location_of_origin} />
            )}
            {recipe.time_duration && (
              <Badge type="time" value={recipe.time_duration} />
            )}
            {recipe.servings && (
              <Badge type="serves" value={`Serves ${recipe.servings}`} />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
