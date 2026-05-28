import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteRecipe } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";
import { categoryLabels } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getAuthSession();
  if (session?.user.role !== "ADMIN") redirect("/");

  const recipes = await prisma.recipe.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-orange-900">Admin: Rezepte</h1>
        <Link href="/admin/recipes/new" className="rounded-xl bg-orange-600 px-4 py-2 text-white">
          Neues Rezept
        </Link>
      </div>
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div>
              <p className="text-xs text-orange-700">{categoryLabels[recipe.category]}</p>
              <h2 className="font-semibold">{recipe.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/recipes/${recipe.id}/edit`} className="rounded-lg border border-orange-200 px-3 py-2">
                Bearbeiten
              </Link>
              <form action={deleteRecipe.bind(null, recipe.id)}>
                <button className="rounded-lg border border-red-200 px-3 py-2 text-red-600">Löschen</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
