import Link from "next/link";
import { RecipeCategory } from "@prisma/client";
import { categoryLabels, categories } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{
    q?: string;
    categories?: string;
    combo?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const selectedCategories = (params.categories ?? "")
    .split(",")
    .filter((item): item is RecipeCategory => categories.includes(item as RecipeCategory));
  const combo = params.combo ?? "";

  const recipes = await prisma.recipe.findMany({
    where: {
      isPublished: true,
      ...(q ? { title: { contains: q } } : {}),
      ...(selectedCategories.length ? { category: { in: selectedCategories } } : {}),
      ...(combo
        ? {
            comboItems: {
              some: {
                combo: { name: combo, isActive: true },
              },
            },
          }
        : {}),
    },
    include: { comboItems: { include: { combo: true } } },
    orderBy: { createdAt: "desc" },
  });

  const combos = await prisma.menuCombo.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  const buildCategoryHref = (category: RecipeCategory) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (combo) params.set("combo", combo);
    if (next.length) params.set("categories", next.join(","));
    return `/?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-semibold text-orange-900">Rezepte</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Suche nach Rezeptnamen und filtere nach Kategorien oder Menüs.
        </p>
        <form className="mt-4 space-y-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nach Rezeptnamen suchen..."
            className="w-full rounded-xl border border-orange-200 px-4 py-3"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={buildCategoryHref(category)}
                className={`rounded-full border px-3 py-2 text-sm ${
                  selectedCategories.includes(category)
                    ? "border-orange-600 bg-orange-100 text-orange-900"
                    : "border-orange-200"
                }`}
              >
                {categoryLabels[category]}
              </Link>
            ))}
          </div>
          <select name="combo" defaultValue={combo} className="rounded-xl border border-orange-200 px-3 py-2">
            <option value="">Alle Menüs</option>
            {combos.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-orange-600 px-4 py-2 text-white">Filtern</button>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-orange-700">{categoryLabels[recipe.category]}</p>
            <h2 className="mt-1 text-xl font-semibold text-orange-900">{recipe.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{recipe.shortDescription}</p>
          </Link>
        ))}
        {recipes.length === 0 && (
          <div className="rounded-2xl bg-white p-5 text-neutral-600 shadow-sm">Keine Rezepte gefunden.</div>
        )}
      </section>
    </div>
  );
}
