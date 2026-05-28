import { redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipe-form";
import { createRecipe } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";

export default async function NewRecipePage() {
  const session = await getAuthSession();
  if (session?.user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-orange-900">Neues Rezept</h1>
      <RecipeForm action={createRecipe} submitLabel="Rezept speichern" />
    </div>
  );
}
