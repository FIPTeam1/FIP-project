'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recipesApi } from '@/lib/api';
import type { IngredientRow, InstructionRow } from '@/lib/types';

const MEASUREMENTS = [
  'cup', 'tbsp', 'tsp', 'g', 'kg', 'oz', 'lb', 'ml', 'L',
  'piece', 'clove', 'bunch', 'slice', 'can', 'pack', 'whole',
];

function emptyIngredient(): IngredientRow {
  return { quantity: '', measurement: '', ingredient_name: '' };
}

function emptyInstruction(): InstructionRow {
  return { description: '' };
}

export default function CreateRecipeForm() {
  const router = useRouter();

  // Basic info
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [servings, setServings] = useState('');
  const [timeDuration, setTimeDuration] = useState('');

  // Ingredients
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    emptyIngredient(),
    emptyIngredient(),
    emptyIngredient(),
  ]);

  // Instructions
  const [instructions, setInstructions] = useState<InstructionRow[]>([
    emptyInstruction(),
    emptyInstruction(),
  ]);

  // Family history
  const [familyPhotoUrl, setFamilyPhotoUrl] = useState('');
  const [familyCreatorName, setFamilyCreatorName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [familyOrigin, setFamilyOrigin] = useState('');
  const [familyStory, setFamilyStory] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Ingredient helpers ────────────────────────────────────────────────────────

  function updateIngredient(index: number, field: keyof IngredientRow, value: string) {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, emptyIngredient()]);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Instruction helpers ───────────────────────────────────────────────────────

  function updateInstruction(index: number, value: string) {
    setInstructions((prev) => {
      const next = [...prev];
      next[index] = { description: value };
      return next;
    });
  }

  function addInstruction() {
    setInstructions((prev) => [...prev, emptyInstruction()]);
  }

  function removeInstruction(index: number) {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        title,
        description: description || undefined,
        image_url: imageUrl || undefined,
        location_of_origin: location || undefined,
        servings: servings || undefined,
        time_duration: timeDuration || undefined,
        ingredients: ingredients
          .filter((ing) => ing.ingredient_name.trim())
          .map((ing, i) => ({
            quantity: ing.quantity || undefined,
            measurement: ing.measurement || undefined,
            ingredient_name: ing.ingredient_name,
            order_index: i,
          })),
        instructions: instructions
          .filter((ins) => ins.description.trim())
          .map((ins, i) => ({
            step_number: i + 1,
            description: ins.description,
          })),
        family_creator_name: familyCreatorName || undefined,
        family_name: familyName || undefined,
        family_origin: familyOrigin || undefined,
        family_story: familyStory || undefined,
        family_photo_url: familyPhotoUrl || undefined,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await recipesApi.create(payload as any);
      router.push(`/recipes/${res.data.id}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FBFBFB] px-[100px] py-10">
      <h1 className="text-title mb-8">Create New Recipe</h1>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">

        {/* ── Section 1: Recipe Information ── */}
        <section className="flex flex-col gap-5">
          <h2 className="text-h1">Add Recipe Information</h2>
          <div className="divider my-0" />

          <div className="form-control gap-1">
            <label className="label text-h3">Recipe Image URL</label>
            <input
              type="url"
              className="input input-bordered w-full"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="form-control gap-1">
            <label className="label text-h3">
              Recipe Name <span className="text-error ml-1">*</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. Adobong Manok"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control gap-1">
            <label className="label text-h3">Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              placeholder="Describe your recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control gap-1">
              <label className="label text-h3">Location of Origin</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Manila, Philippines"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label text-h3">Servings</label>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="e.g. 4"
                min={1}
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label text-h3">Time Duration</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. 45 minutes"
                value={timeDuration}
                onChange={(e) => setTimeDuration(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Section 2: Ingredients ── */}
        <section className="flex flex-col gap-5">
          <h2 className="text-h1">Add Ingredients</h2>
          <div className="divider my-0" />

          {/* Header row */}
          <div className="grid items-center gap-3" style={{ gridTemplateColumns: '80px 150px 1fr 36px' }}>
            <span className="text-h3 text-base-content/60">Quantity</span>
            <span className="text-h3 text-base-content/60">Measurement</span>
            <span className="text-h3 text-base-content/60">Ingredient Name</span>
            <span />
          </div>

          {ingredients.map((ing, i) => (
            <div
              key={i}
              className="grid items-center gap-3"
              style={{ gridTemplateColumns: '80px 150px 1fr 36px' }}
            >
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="2"
                value={ing.quantity}
                onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
              />
              <select
                className="select select-bordered w-full"
                value={ing.measurement}
                onChange={(e) => updateIngredient(i, 'measurement', e.target.value)}
              >
                <option value="">—</option>
                {MEASUREMENTS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. garlic"
                value={ing.ingredient_name}
                onChange={(e) => updateIngredient(i, 'ingredient_name', e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error px-2"
                onClick={() => removeIngredient(i)}
                aria-label="Remove ingredient"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline btn-secondary self-start px-[30px] py-[10px] text-btn"
            onClick={addIngredient}
          >
            + Add Ingredient
          </button>
        </section>

        {/* ── Section 3: Instructions ── */}
        <section className="flex flex-col gap-5">
          <h2 className="text-h1">Add Instructions</h2>
          <div className="divider my-0" />

          {instructions.map((ins, i) => (
            <div key={i} className="flex items-start gap-4">
              {/* Step badge */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#FCAF3B] flex items-center justify-center font-semibold text-white text-sm mt-1">
                {i + 1}
              </div>

              <textarea
                className="textarea textarea-bordered flex-1"
                rows={2}
                placeholder={`Describe step ${i + 1}...`}
                value={ins.description}
                onChange={(e) => updateInstruction(i, e.target.value)}
              />

              <button
                type="button"
                className="btn btn-ghost btn-sm text-error px-2 mt-1"
                onClick={() => removeInstruction(i)}
                aria-label="Remove step"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline btn-secondary self-start px-[30px] py-[10px] text-btn"
            onClick={addInstruction}
          >
            + Add Step
          </button>
        </section>

        {/* ── Section 4: Family History ── */}
        <section className="flex flex-col gap-5">
          <h2 className="text-h1">Add Family History <span className="text-base-content/40 text-h3 ml-2">(optional)</span></h2>
          <div className="divider my-0" />

          <div className="form-control gap-1">
            <label className="label text-h3">Family Photo URL</label>
            <input
              type="url"
              className="input input-bordered w-full"
              placeholder="https://example.com/family-photo.jpg"
              value={familyPhotoUrl}
              onChange={(e) => setFamilyPhotoUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control gap-1">
              <label className="label text-h3">Creator Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Lola Maria"
                value={familyCreatorName}
                onChange={(e) => setFamilyCreatorName(e.target.value)}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label text-h3">Family Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Santos Family"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label text-h3">Ancestral Origin</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Pampanga, Philippines"
                value={familyOrigin}
                onChange={(e) => setFamilyOrigin(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control gap-1">
            <label className="label text-h3">Story</label>
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
            className="btn btn-outline btn-ghost px-[30px] py-[10px] text-btn"
            onClick={() => router.push('/recipes')}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn px-[30px] py-[10px] text-btn bg-[#5555FF] text-white border-none hover:bg-[#4444EE] disabled:opacity-60"
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
