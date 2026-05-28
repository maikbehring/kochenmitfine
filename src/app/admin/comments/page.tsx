import { CommentStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { moderateComment } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminCommentsPage() {
  const session = await getAuthSession();
  if (session?.user.role !== "ADMIN") redirect("/");

  const comments = await prisma.comment.findMany({
    where: { status: "PENDING" },
    include: { recipe: true, user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-orange-900">Kommentar-Moderation</h1>
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-orange-700">
            {comment.user.username} zu {comment.recipe.title}
          </p>
          <p className="mt-2">{comment.text}</p>
          <div className="mt-3 flex gap-2">
            <form action={moderateComment.bind(null, comment.id, CommentStatus.APPROVED)}>
              <button className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white">Freigeben</button>
            </form>
            <form action={moderateComment.bind(null, comment.id, CommentStatus.REJECTED)}>
              <button className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600">Ablehnen</button>
            </form>
          </div>
        </div>
      ))}
      {comments.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-neutral-600 shadow-sm">Keine ausstehenden Kommentare.</div>
      ) : null}
    </div>
  );
}
