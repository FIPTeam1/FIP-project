'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { recipesApi, familyHistoryApi, ingredientsApi } from '@/lib/api';
import type { Ingredient } from '@/lib/types';

// ── Ingredient Selector ────────────────────────────────────────────────────────

interface IngredientTag {
  name: string;
  isNew: boolean; // true = will be created on submit
}

interface IngredientSelectorProps {
  allIngredients: Ingredient[];
  selected: IngredientTag[];
  onChange: (tags: IngredientTag[]) => void;
}

function IngredientSelector({ allIngredients, selected, onChange }: IngredientSelectorProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  // Filter ingredients that match the query and aren't already selected
  const selectedNames = new Set(selected.map((t) => t.name.toLowerCase()));
  const matches = trimmed
    ? allIngredients.filter(
        (ing) =>
          ing.name.toLowerCase().includes(trimmed.toLowerCase()) &&
          !selectedNames.has(ing.name.toLowerCase())
      )
    : allIngredients.filter((ing) => !selectedNames.has(ing.name.toLowerCase())).slice(0, 8);

  const exactMatch = allIngredients.some(
    (ing) => ing.name.toLowerCase() === trimmed.toLowerCase()
  );
  const alreadySelected = selectedNames.has(trimmed.toLowerCase());
  const showCreateOption = trimmed.length > 0 && !exactMatch && !alreadySelected;

  function addTag(name: string, isNew: boolean) {
    onChange([...selected, { name, isNew }]);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function removeTag(index: number) {
    onChange(selected.filter((_, i) => i !== index));
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current !== e.target
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium ${
                tag.isNew
                  ? 'bg-[#FFF8EC] text-[#FCAF3B] border border-[#FCAF3B]/30'
                  : 'bg-[#F0F4FF] text-[#5555FF] border border-[#5555FF]/20'
              }`}
            >
              {tag.isNew && (
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-60">new</span>
              )}
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity text-[11px] leading-none"
                aria-label={`Remove ${tag.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input + dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="input input-bordered w-full"
          placeholder="Search ingredients or type a new one…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (matches.length > 0) {
                addTag(matches[0].name, false);
              } else if (showCreateOption) {
                addTag(trimmed, true);
              }
            }
            if (e.key === 'Escape') setOpen(false);
          }}
        />

        {open && (matches.length > 0 || showCreateOption) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto"
          >
            {matches.slice(0, 8).map((ing) => (
              <button
                key={ing.id}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F9FAFB] transition-colors text-[13px]"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(ing.name, false);
                }}
              >
                {ing.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ing.image}
                    alt={ing.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#F0F4FF] flex items-center justify-center shrink-0 text-[10px]">
                    🥗
                  </span>
                )}
                <span className="font-medium text-[#111827]">{ing.name}</span>
              </button>
            ))}

            {showCreateOption && (
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#FFF8EC] transition-colors text-[13px] border-t border-[#F0F0F0]"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(trimmed, true);
                }}
              >
                <span className="w-6 h-6 rounded-full bg-[#FFF8EC] flex items-center justify-center shrink-0 text-[12px]">
                  +
                </span>
                <span>
                  Add new ingredient: <strong>&quot;{trimmed}&quot;</strong>
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-[12px] text-base-content/50">
        Select from existing ingredients or type a new one and press Enter / click to add.{' '}
        <span className="text-[#FCAF3B]">New</span> ingredients will be added to the glossary.
      </p>
    </div>
  );
}

// ── Enum options ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Main Course',
  'Appetizer',
  'Soup',
  'Noodles',
  'Dessert',
  'Beverage',
  'Vegetable',
  'Rice',
  'Breakfast',
  'Snack',
] as const;

const TYPES = [
  'Chicken',
  'Pork',
  'Beef',
  'Seafood',
  'Vegetable',
  'Noodles',
  'Dessert',
  'Beverage',
  'Egg',
  'Tofu',
  'Rice',
] as const;

const DURATIONS = [
  '10 minutes',
  '15 minutes',
  '20 minutes',
  '30 minutes',
  '45 minutes',
  '1 hour',
  '1.5 hours',
  '2 hours',
  '2.5 hours',
  '3 hours',
  '4 hours',
  '5+ hours',
] as const;

// ── Main Form ─────────────────────────────────────────────────────────────────

export default function CreateRecipeForm() {
  const router = useRouter();

  // All DB ingredients (fetched once on mount)
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  // Basic info
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  // Ingredients as tags
  const [ingredientTags, setIngredientTags] = useState<IngredientTag[]>([]);

  // Family history
  const [familyPhoto, setFamilyPhoto] = useState('');
  const [familyCreator, setFamilyCreator] = useState('');
  const [familyNameOrigin, setFamilyNameOrigin] = useState('');
  const [familyStory, setFamilyStory] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ingredients on mount
  useEffect(() => {
    ingredientsApi.list().then((res) => setAllIngredients(res.data)).catch(() => {});
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // 1. Create any new ingredients that don't exist yet
      const resolvedNames: string[] = [];
      for (const tag of ingredientTags) {
        if (tag.isNew) {
          try {
            await ingredientsApi.create({ name: tag.name });
          } catch (err: unknown) {
            // 409 = already exists (race condition) — that's fine, keep the name
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status !== 409) throw err;
          }
        }
        resolvedNames.push(tag.name);
      }

      const ingredientsJson =
        resolvedNames.length > 0 ? JSON.stringify(resolvedNames) : undefined;

      // 2. Optionally create family history
      let familyHistoryId: number | undefined;
      const hasFamilyHistory = familyCreator || familyNameOrigin || familyStory || familyPhoto;
      if (hasFamilyHistory) {
        const fhRes = await familyHistoryApi.create({
          family_photo: familyPhoto || undefined,
          creator: familyCreator || undefined,
          family_name_origin: familyNameOrigin || undefined,
          story: familyStory || undefined,
        });
        familyHistoryId = fhRes.data.id;
      }

      // 3. Create the recipe
      const res = await recipesApi.create({
        image: image || undefined,
        name,
        description: description || undefined,
        duration: duration || undefined,
        location: location || undefined,
        ingredients: ingredientsJson,
        category: category || undefined,
        type: type || undefined,
        family_history_id: familyHistoryId,
      });

      router.push(`/recipes/${res.data.recipe_id}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FBFBFB] px-4 sm:px-8 md:px-[100px] py-6 md:py-10">
      <h1 className="text-[32px] font-bold mb-8">Create New Recipe</h1>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">

        {/* ── Section 1: Recipe Information ── */}
        <section className="flex flex-col gap-5">
          <h2 className="text-[22px] font-semibold">Recipe Information</h2>
          <div className="divider my-0" />

          <div className="form-control gap-1">
            <label className="label text-[16px] font-medium">Recipe Image URL</label>
            <input
              type="url"
              className="input input-bordered w-full"
              placeholder="https://example.com/image.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div className="form-control gap-1">
            <label className="label text-[16px] font-medium">
              Recipe Name <span className="text-error ml-1">*</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. Adobong Manok"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control gap-1">
            <label className="label text-[16px] font-medium">Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              placeholder="Describe your recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="form-control gap-1">
              <label className="label text-[16px] font-medium">Location</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Manila"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label text-[16px] font-medium">Duration</label>
              <select
                className="select select-bordered w-full"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">Select duration…</option>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-control gap-1">
              <label className="label text-[16px] font-medium">Category</label>
              <select
                className="select select-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-control gap-1">
              <label className="label text-[16px] font-medium">Type</label>
              <select
                className="select select-bordered w-full"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select type…</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Section 2: Ingredients ── */}
        <section className="flex flex-col gap-5">
          <h2 className="text-[22px] font-semibold">Ingredients</h2>
          <div className="divider my-0" />

          <IngredientSelector
            allIngredients={allIngredients}
            selected={ingredientTags}
            onChange={setIngredientTags}
          />
        </section>

        {/* ── Section 3: Family History (optional) ── */}
        <section className="flex flex-col gap-5">
          <h2 className="text-[22px] font-semibold">
            Family History{' '}
            <span className="text-base-content/40 text-[16px] font-medium ml-2">(optional)</span>
          </h2>
          <div className="divider my-0" />

          <div className="form-control gap-1">
            <label className="label text-[16px] font-medium">Family Photo URL</label>
            <input
              type="url"
              className="input input-bordered w-full"
              placeholder="https://example.com/family-photo.jpg"
              value={familyPhoto}
              onChange={(e) => setFamilyPhoto(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control gap-1">
              <label className="label text-[16px] font-medium">Creator</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Lola Maria"
                value={familyCreator}
                onChange={(e) => setFamilyCreator(e.target.value)}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label text-[16px] font-medium">Family Name / Origin</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Santos Family, Pampanga"
                value={familyNameOrigin}
                onChange={(e) => setFamilyNameOrigin(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control gap-1">
            <label className="label text-[16px] font-medium">Story</label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={6}
              placeholder="Share the history behind this recipe..."
              value={familyStory}
              onChange={(e) => setFamilyStory(e.target.value)}
            />
          </div>
        </section>

        {/* ── Footer buttons ── */}
        <div className="flex items-center gap-4 pb-10">
          <button
            type="button"
            className="btn btn-outline btn-ghost px-[30px] py-[10px] text-[14px] font-semibold"
            onClick={() => router.push('/recipes')}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn px-[30px] py-[10px] text-[14px] font-semibold bg-[#5555FF] text-white border-none hover:bg-[#4444EE] disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Submitting…
              </span>
            ) : (
              'Submit Recipe'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
