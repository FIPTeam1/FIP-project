'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import type { Recipe } from '@/lib/types';
import RecipeGrid from '@/components/recipes/RecipeGrid';

type Tab = 'recipes' | 'saved';

interface ProfileTabsProps {
  username: string;
  isOwnProfile: boolean;
}

const TAB_STYLE_ACTIVE =
  'pb-3 text-body font-bold text-gray-900 border-b-2 transition-colors';
const TAB_STYLE_INACTIVE =
  'pb-3 text-body font-normal text-gray-400 border-b-2 border-transparent hover:text-gray-600 transition-colors';

export default function ProfileTabs({ username, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');

  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [userRecipesLoading, setUserRecipesLoading] = useState(true);

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [savedRecipesLoading, setSavedRecipesLoading] = useState(false);
  const [savedFetched, setSavedFetched] = useState(false);

  // Fetch user's own recipes on mount / username change
  useEffect(() => {
    setUserRecipesLoading(true);
    usersApi
      .getUserRecipes(username)
      .then((res) => setUserRecipes(res.data))
      .catch(() => setUserRecipes([]))
      .finally(() => setUserRecipesLoading(false));

    // Reset saved state when username changes
    setSavedRecipes([]);
    setSavedFetched(false);
  }, [username]);

  // Lazily fetch saved recipes when that tab is activated (only for own profile)
  useEffect(() => {
    if (activeTab !== 'saved' || !isOwnProfile || savedFetched) return;

    setSavedRecipesLoading(true);
    usersApi
      .getSavedRecipes()
      .then((res) => setSavedRecipes(res.data))
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
              ? `${TAB_STYLE_ACTIVE} border-b-[#FCAF3B]`
              : TAB_STYLE_INACTIVE
          }
          onClick={() => setActiveTab('recipes')}
          style={activeTab === 'recipes' ? { borderBottomColor: '#FCAF3B' } : undefined}
        >
          My Recipes
        </button>

        {/* Only show Saved tab on own profile */}
        {isOwnProfile && (
          <button
            className={
              activeTab === 'saved'
                ? `${TAB_STYLE_ACTIVE} border-b-[#FCAF3B]`
                : TAB_STYLE_INACTIVE
            }
            onClick={() => setActiveTab('saved')}
            style={activeTab === 'saved' ? { borderBottomColor: '#FCAF3B' } : undefined}
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
      <p className="text-h3 font-medium text-gray-600">{message}</p>
      <p className="text-body text-gray-400 max-w-xs">{subMessage}</p>
    </div>
  );
}
