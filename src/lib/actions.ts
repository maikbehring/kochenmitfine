"use server";

import { CommentStatus, RecipeCategory } from "@prisma/client";
import { hash } from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload, slugify } from "@/lib/utils";

type IngredientInput = {
  id: string;
  amount?: string;
  unit?: string;
  name: string;
};

type StepInput = {
  id: string;
  instruction: string;
};

function parseNumber(value: FormDataEntryValue | null) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
}

async function ensureAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nicht berechtigt");
  }
  return session.user;
}

export async function registerUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password || password.length < 8 || !username) {
    throw new Error("Ungültige Eingabe");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("E-Mail bereits vergeben");
  }
  const passwordHash = await hash(password, 10);
  await prisma.user.create({
    data: { email, username, password: passwordHash, role: "READER" },
  });
  redirect("/login");
}

export async function createRecipe(formData: FormData) {
  const user = await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const category = String(formData.get("category") ?? "MAIN") as RecipeCategory;

  if (!title) throw new Error("Titel ist erforderlich");

  const ingredients = JSON.parse(String(formData.get("ingredientsJson") ?? "[]")) as IngredientInput[];
  const steps = JSON.parse(String(formData.get("stepsJson") ?? "[]")) as StepInput[];
  const safeSteps = steps.filter((step) => step.instruction.trim());

  const recipe = await prisma.recipe.create({
    data: {
      title,
      slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`,
      shortDescription: shortDescription || null,
      category,
      calories: parseNumber(formData.get("calories")),
      protein: parseNumber(formData.get("protein")),
      carbs: parseNumber(formData.get("carbs")),
      fat: parseNumber(formData.get("fat")),
      sugar: parseNumber(formData.get("sugar")),
      createdById: user.id,
      ingredients: {
        create: ingredients
          .filter((item) => item.name.trim())
          .map((item, index) => ({
            name: item.name.trim(),
            unit: item.unit?.trim() || null,
            amount: item.amount ? Number(item.amount) : null,
            position: index + 1,
          })),
      },
      steps: {
        create: safeSteps.map((step, index) => ({
          stepNumber: index + 1,
          instruction: step.instruction.trim(),
        })),
      },
    },
    include: { steps: true },
  });

  for (const step of safeSteps) {
    const file = formData.get(`stepImage-${step.id}`);
    if (file instanceof File && file.size > 0) {
      const imageUrl = await saveUpload(file);
      const idx = safeSteps.findIndex((s) => s.id === step.id);
      await prisma.recipeStep.update({
        where: { id: recipe.steps[idx].id },
        data: { imageUrl },
      });
    }
  }

  revalidatePath("/");
  redirect("/admin");
}

export async function updateRecipe(recipeId: string, formData: FormData) {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Titel ist erforderlich");
  const category = String(formData.get("category") ?? "MAIN") as RecipeCategory;
  const ingredients = JSON.parse(String(formData.get("ingredientsJson") ?? "[]")) as IngredientInput[];
  const steps = JSON.parse(String(formData.get("stepsJson") ?? "[]")) as StepInput[];
  const safeSteps = steps.filter((step) => step.instruction.trim());

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      title,
      shortDescription: String(formData.get("shortDescription") ?? "").trim() || null,
      category,
      calories: parseNumber(formData.get("calories")),
      protein: parseNumber(formData.get("protein")),
      carbs: parseNumber(formData.get("carbs")),
      fat: parseNumber(formData.get("fat")),
      sugar: parseNumber(formData.get("sugar")),
    },
  });

  await prisma.recipeIngredient.deleteMany({ where: { recipeId } });
  await prisma.recipeStep.deleteMany({ where: { recipeId } });

  const created = await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      ingredients: {
        create: ingredients
          .filter((item) => item.name.trim())
          .map((item, index) => ({
            name: item.name.trim(),
            unit: item.unit?.trim() || null,
            amount: item.amount ? Number(item.amount) : null,
            position: index + 1,
          })),
      },
      steps: {
        create: safeSteps.map((step, index) => ({
          stepNumber: index + 1,
          instruction: step.instruction.trim(),
        })),
      },
    },
    include: { steps: true },
  });

  for (const step of safeSteps) {
    const file = formData.get(`stepImage-${step.id}`);
    if (file instanceof File && file.size > 0) {
      const imageUrl = await saveUpload(file);
      const idx = safeSteps.findIndex((s) => s.id === step.id);
      await prisma.recipeStep.update({
        where: { id: created.steps[idx].id },
        data: { imageUrl },
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/recipes/${recipeId}`);
  redirect("/admin");
}

export async function deleteRecipe(recipeId: string) {
  await ensureAdmin();
  await prisma.recipe.delete({ where: { id: recipeId } });
  revalidatePath("/");
  redirect("/admin");
}

export async function createComment(recipeId: string, formData: FormData) {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error("Nur angemeldete Nutzer");
  }
  const text = String(formData.get("text") ?? "").trim();
  if (!text) throw new Error("Kommentar darf nicht leer sein");

  await prisma.comment.create({
    data: { recipeId, userId: session.user.id, text, status: CommentStatus.PENDING },
  });
  revalidatePath(`/recipes/${recipeId}`);
}

export async function moderateComment(commentId: string, status: CommentStatus) {
  const user = await ensureAdmin();
  await prisma.comment.update({
    where: { id: commentId },
    data: { status, moderatedById: user.id, moderatedAt: new Date() },
  });
  revalidatePath("/admin/comments");
  revalidatePath("/");
}
