'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recipesApi, familyHistoryApi } from '@/lib/api';

export default function CreateRecipeForm() {
  const router = useRouter();

  // Basic info
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  // Ingredients: collected as rows then JSON.stringified
  const [ingredientRows, setIngredientRows] = useState<string[]>(['', '', '']);

  // Family history
  const [familyPhoto, setFamilyPhoto] = useState('');
  const [familyCreator, setFamilyCreator] = useState('');
  const [familyNameOrigin, setFamilyNameOrigin] = useState('');
  const [familyStory, setFamilyStory] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Ingredient row helpers ─────────────────────────────────────────────────

  function updateIngredientRow(index: number, value: string) {
    setIngredientRows((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addIngredientRow() {
    setIngredientRows((prev) => [...prev, '']);
  }

  function removeIngredientRow(index: number) {
    setIngredientRows((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Build ingredients JSON string
      const filteredIngredients = ingredientRows.map((r) => r.trim()).filter(Boolean);
      const ingredientsJson =
        filteredIngredients.length > 0 ? JSON.stringify(filteredIngredients) : undefined;

      // Optionally create family history first
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
    <div className="min-h-screen bg-[#FBFBFB] px-[100px] py-10">
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
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. 45 minutes"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label text-[16px] font-medium">Category</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Main Course"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label text-[16px] font-medium">Type</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Meat, Seafood"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Section 2: Ingredients ── */}
        <section className="flex flex-col gap-5">
          <h2 className="text-[22px] font-semibold">Ingredients</h2>
          <div className="divider my-0" />

          <p className="text-[14px] text-base-content/60">
            Add each ingredient on its own line (e.g. &quot;2 cups rice&quot;, &quot;1 tbsp soy sauce&quot;).
          </p>

          {ingredientRows.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder={`Ingredient ${i + 1}`}
                value={row}
                onChange={(e) => updateIngredientRow(i, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error px-2"
                onClick={() => removeIngredientRow(i)}
                aria-label="Remove ingredient"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline btn-secondary self-start px-[30px] py-[10px] text-[14px] font-semibold"
            onClick={addIngredientRow}
          >
            + Add Ingredient
          </button>
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
