import Image from "next/image";
import { notFound } from "next/navigation";
import { createComment } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";
import { categoryLabels } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function RecipeDetail({ params }: Props) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { position: "asc" } },
      steps: { orderBy: { stepNumber: "asc" } },
      comments: {
        where: { status: "APPROVED" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!recipe) return notFound();
  const session = await getAuthSession();

  return (
    <div className="space-y-6">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wider text-orange-700">{categoryLabels[recipe.category]}</p>
        <h1 className="mt-1 text-3xl font-semibold text-orange-900">{recipe.title}</h1>
        <p className="mt-2 text-neutral-700">{recipe.shortDescription}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-5 text-sm">
          <div>Kalorien: {recipe.calories}</div>
          <div>Eiweiß: {recipe.protein}</div>
          <div>Kohlenhydrate: {recipe.carbs}</div>
          <div>Fett: {recipe.fat}</div>
          <div>Zucker: {recipe.sugar}</div>
        </div>
      </article>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-orange-900">Zutaten</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          {recipe.ingredients.map((item) => (
            <li key={item.id}>
              {[item.amount, item.unit, item.name].filter(Boolean).join(" ")}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-orange-900">Zubereitung</h2>
        <div className="mt-4 space-y-4">
          {recipe.steps.map((step) => (
            <div key={step.id} className="rounded-xl border border-orange-100 p-4">
              <p className="font-medium text-orange-800">Schritt {step.stepNumber}</p>
              <p className="mt-1 whitespace-pre-line">{step.instruction}</p>
              {step.imageUrl ? (
                <Image src={step.imageUrl} alt={`Schritt ${step.stepNumber}`} width={800} height={500} className="mt-3 rounded-xl" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-orange-900">Kommentare</h2>
        {session?.user ? (
          <form action={createComment.bind(null, recipe.id)} className="mt-3 space-y-2">
            <textarea
              name="text"
              required
              minLength={2}
              maxLength={1000}
              placeholder="Schreibe deinen Kommentar..."
              className="w-full rounded-xl border border-orange-200 px-3 py-2"
            />
            <button className="rounded-xl bg-orange-600 px-4 py-2 text-white">Kommentar senden</button>
            <p className="text-xs text-neutral-500">Kommentare werden vor der Veröffentlichung moderiert.</p>
          </form>
        ) : (
          <p className="mt-2 text-sm text-neutral-600">Bitte einloggen, um zu kommentieren.</p>
        )}

        <div className="mt-4 space-y-3">
          {recipe.comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-orange-100 p-3">
              <p className="text-sm font-semibold text-orange-800">{comment.user.username}</p>
              <p className="mt-1 text-sm">{comment.text}</p>
            </div>
          ))}
          {recipe.comments.length === 0 ? (
            <p className="text-sm text-neutral-500">Noch keine freigegebenen Kommentare.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
