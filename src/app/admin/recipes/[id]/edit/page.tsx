import { notFound, redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipe-form";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRecipe } from "@/lib/actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditRecipePage({ params }: Props) {
  const session = await getAuthSession();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { position: "asc" } },
      steps: { orderBy: { stepNumber: "asc" } },
    },
  });
  if (!recipe) return notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-orange-900">Rezept bearbeiten</h1>
      <RecipeForm
        action={updateRecipe.bind(null, recipe.id)}
        submitLabel="Änderungen speichern"
        initial={{
          title: recipe.title,
          shortDescription: recipe.shortDescription ?? "",
          category: recipe.category,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          sugar: recipe.sugar,
          ingredients: recipe.ingredients.map((item) => ({
            id: item.id,
            amount: item.amount?.toString() ?? "",
            unit: item.unit ?? "",
            name: item.name,
          })),
          steps: recipe.steps.map((item) => ({
            id: item.id,
            instruction: item.instruction,
          })),
        }}
      />
    </div>
  );
}
