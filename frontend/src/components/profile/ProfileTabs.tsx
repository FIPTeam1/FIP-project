'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import type { Recipe, SavedRecipe } from '@/lib/types';
import RecipeGrid from '@/components/recipes/RecipeGrid';

type Tab = 'recipes' | 'saved';

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
}

const TAB_STYLE_ACTIVE =
  'pb-3 text-[14px] font-bold text-gray-900 border-b-2 transition-colors';
const TAB_STYLE_INACTIVE =
  'pb-3 text-[14px] font-normal text-gray-400 border-b-2 border-transparent hover:text-gray-600 transition-colors';

export default function ProfileTabs({ userId, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');

  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [userRecipesLoading, setUserRecipesLoading] = useState(true);

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [savedRecipesLoading, setSavedRecipesLoading] = useState(false);
  const [savedFetched, setSavedFetched] = useState(false);

  // Fetch user's own recipes on mount / userId change
  useEffect(() => {
    setUserRecipesLoading(true);
    usersApi
      .getUserRecipes(userId)
      .then((res) => setUserRecipes(res.data))
      .catch(() => setUserRecipes([]))
      .finally(() => setUserRecipesLoading(false));

    // Reset saved state when userId changes
    setSavedRecipes([]);
    setSavedFetched(false);
  }, [userId]);

  // Lazily fetch saved recipes when that tab is activated (only for own profile)
  useEffect(() => {
    if (activeTab !== 'saved' || !isOwnProfile || savedFetched) return;

    setSavedRecipesLoading(true);
    usersApi
      .getSavedRecipes()
      .then((res) => {
        // Extract the recipe object from each SavedRecipe row
        const recipes = res.data
          .map((sr: SavedRecipe) => sr.recipe)
          .filter((r): r is Recipe => r != null);
        setSavedRecipes(recipes);
      })
      .catch(() => setSavedRecipes([]))
      .finally(() => {
        setSavedRecipesLoading(false);
        setSavedFetched(true);
      });
  }, [activeTab, isOwnProfile, savedFetched]);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-8 border-b border-base-200 mb-6">
        <button
          className={
            activeTab === 'recipes'
              ? `${TAB_STYLE_ACTIVE} border-b-[#6A9CB5]`
              : TAB_STYLE_INACTIVE
          }
          onClick={() => setActiveTab('recipes')}
          style={activeTab === 'recipes' ? { borderBottomColor: '#6A9CB5' } : undefined}
        >
          My Recipes
        </button>

        {/* Only show Saved tab on own profile */}
        {isOwnProfile && (
          <button
            className={
              activeTab === 'saved'
                ? `${TAB_STYLE_ACTIVE} border-b-[#6A9CB5]`
                : TAB_STYLE_INACTIVE
            }
            onClick={() => setActiveTab('saved')}
            style={activeTab === 'saved' ? { borderBottomColor: '#6A9CB5' } : undefined}
          >
            Saved Recipes
          </button>
        )}
      </div>

      {/* My Recipes panel */}
      {activeTab === 'recipes' && (
        <div>
          {!userRecipesLoading && userRecipes.length === 0 ? (
            <EmptyState
              message="No recipes yet"
              subMessage="Recipes shared by this user will appear here."
            />
          ) : (
            <RecipeGrid recipes={userRecipes} loading={userRecipesLoading} />
          )}
        </div>
      )}

      {/* Saved Recipes panel */}
      {activeTab === 'saved' && isOwnProfile && (
        <div>
          {!savedRecipesLoading && savedRecipes.length === 0 ? (
            <EmptyState
              message="No saved recipes yet"
              subMessage="Recipes you save will appear here."
            />
          ) : (
            <RecipeGrid recipes={savedRecipes} loading={savedRecipesLoading} />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  message,
  subMessage,
}: {
  message: string;
  subMessage: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <span className="text-5xl">🥘</span>
      <p className="text-[16px] font-medium text-gray-600">{message}</p>
      <p className="text-[14px] text-gray-400 max-w-xs">{subMessage}</p>
    </div>
  );
}
