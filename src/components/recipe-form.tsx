"use client";

import { RecipeCategory } from "@prisma/client";
import { useMemo, useState } from "react";
import { categoryLabels, categories } from "@/lib/constants";

type Ingredient = { id: string; amount: string; unit: string; name: string };
type Step = { id: string; instruction: string };

type Props = {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    title: string;
    shortDescription: string;
    category: RecipeCategory;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    ingredients: Ingredient[];
    steps: Step[];
  };
  submitLabel: string;
};

const createId = () => Math.random().toString(36).slice(2, 9);

export function RecipeForm({ action, initial, submitLabel }: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients.length
      ? initial.ingredients
      : [{ id: createId(), amount: "", unit: "", name: "" }],
  );
  const [steps, setSteps] = useState<Step[]>(
    initial?.steps.length ? initial.steps : [{ id: createId(), instruction: "" }],
  );

  const ingredientsJson = useMemo(() => JSON.stringify(ingredients), [ingredients]);
  const stepsJson = useMemo(() => JSON.stringify(steps), [steps]);

  return (
    <form action={action} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Titel *</span>
          <input
            name="title"
            required
            defaultValue={initial?.title ?? ""}
            className="w-full rounded-xl border border-orange-200 px-3 py-2"
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Kurzbeschreibung</span>
          <textarea
            name="shortDescription"
            defaultValue={initial?.shortDescription ?? ""}
            className="w-full rounded-xl border border-orange-200 px-3 py-2"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Kategorie</span>
          <select
            name="category"
            defaultValue={initial?.category ?? "MAIN"}
            className="w-full rounded-xl border border-orange-200 px-3 py-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {["calories", "protein", "carbs", "fat", "sugar"].map((field) => (
          <label key={field} className="space-y-1">
            <span className="text-sm font-medium capitalize">{field}</span>
            <input
              type="number"
              min={0}
              step="0.1"
              name={field}
              defaultValue={initial?.[field as keyof NonNullable<Props["initial"]>] as number}
              className="w-full rounded-xl border border-orange-200 px-3 py-2"
            />
          </label>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold text-orange-900">Zutaten</h3>
        {ingredients.map((ingredient, index) => (
          <div key={ingredient.id} className="grid gap-2 md:grid-cols-12">
            <input
              value={ingredient.amount}
              onChange={(event) =>
                setIngredients((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, amount: event.target.value } : item,
                  ),
                )
              }
              placeholder="Menge"
              className="rounded-xl border border-orange-200 px-3 py-2 md:col-span-2"
            />
            <input
              value={ingredient.unit}
              onChange={(event) =>
                setIngredients((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, unit: event.target.value } : item,
                  ),
                )
              }
              placeholder="Einheit"
              className="rounded-xl border border-orange-200 px-3 py-2 md:col-span-3"
            />
            <input
              value={ingredient.name}
              onChange={(event) =>
                setIngredients((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, name: event.target.value } : item,
                  ),
                )
              }
              placeholder="Zutat"
              className="rounded-xl border border-orange-200 px-3 py-2 md:col-span-6"
            />
            <button
              type="button"
              onClick={() => setIngredients((prev) => prev.filter((item) => item.id !== ingredient.id))}
              className="rounded-xl border border-red-200 px-3 py-2 text-red-600 md:col-span-1"
            >
              X
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setIngredients((prev) => [...prev, { id: createId(), amount: "", unit: "", name: "" }])}
          className="rounded-xl bg-orange-100 px-3 py-2 text-orange-800"
        >
          + Zutat
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-orange-900">Zubereitungsschritte</h3>
        {steps.map((step, index) => (
          <div key={step.id} className="space-y-2 rounded-xl border border-orange-100 p-3">
            <textarea
              value={step.instruction}
              onChange={(event) =>
                setSteps((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, instruction: event.target.value } : item,
                  ),
                )
              }
              placeholder={`Schritt ${index + 1}`}
              className="w-full rounded-xl border border-orange-200 px-3 py-2"
            />
            <input name={`stepImage-${step.id}`} type="file" accept="image/*" className="text-sm" />
            <button
              type="button"
              onClick={() => setSteps((prev) => prev.filter((item) => item.id !== step.id))}
              className="rounded-xl border border-red-200 px-3 py-2 text-red-600"
            >
              Schritt entfernen
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSteps((prev) => [...prev, { id: createId(), instruction: "" }])}
          className="rounded-xl bg-orange-100 px-3 py-2 text-orange-800"
        >
          + Schritt
        </button>
      </section>

      <input type="hidden" name="ingredientsJson" value={ingredientsJson} />
      <input type="hidden" name="stepsJson" value={stepsJson} />
      <button className="rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700">
        {submitLabel}
      </button>
    </form>
  );
}
