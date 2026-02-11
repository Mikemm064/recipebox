"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAuthCookie } from "@/src/lib/auth";
import { getDb } from "@/src/db/client";
import { categories, recipes, recipeSources } from "@/src/db/schema";
import { recipeSchema } from "@/src/lib/validation";

function now() {
  return Date.now();
}

function normalizeSources(formData: FormData) {
  const raw = formData.get("sourcesJson");
  if (typeof raw !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Array<{ url: string; notes?: string }>;
    return parsed.map((source) => ({
      url: source.url,
      notes: source.notes ?? "",
    }));
  } catch {
    return [];
  }
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookie();
  redirect("/login");
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return;
  }

  const db = getDb();
  const timestamp = now();

  await db.insert(categories).values({
    id: crypto.randomUUID(),
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  revalidatePath("/");
}

export async function renameCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) {
    return;
  }

  const db = getDb();
  await db.update(categories).set({ name, updatedAt: now() }).where(eq(categories.id, id));

  revalidatePath(`/categories/${id}`);
  revalidatePath("/");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const db = getDb();
  await db.delete(categories).where(eq(categories.id, id));

  revalidatePath("/");
  redirect("/");
}

export async function createRecipeAction(formData: FormData): Promise<void> {
  const categoryId = String(formData.get("categoryId") ?? "");
  const title = String(formData.get("title") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const sources = normalizeSources(formData);

  const parsed = recipeSchema.safeParse({ categoryId, title, notes, sources });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid recipe input");
  }

  const db = getDb();
  const recipeId = crypto.randomUUID();
  const timestamp = now();

  await db.transaction(async (tx) => {
    await tx.insert(recipes).values({
      id: recipeId,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      lastCookedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await tx.insert(recipeSources).values(parsed.data.sources.map((source) => ({
      id: crypto.randomUUID(),
      recipeId,
      url: source.url,
      notes: source.notes || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })));
  });

  revalidatePath("/");
  redirect(`/recipes/${recipeId}`);
}

export async function updateRecipeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const title = String(formData.get("title") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const sources = normalizeSources(formData);

  const parsed = recipeSchema.safeParse({ categoryId, title, notes, sources });
  if (!parsed.success || !id) {
    throw new Error(parsed.success ? "Recipe id is required" : parsed.error.issues[0]?.message ?? "Invalid recipe input");
  }

  const db = getDb();
  const timestamp = now();

  await db.transaction(async (tx) => {
    await tx.update(recipes).set({
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      updatedAt: timestamp,
    }).where(eq(recipes.id, id));

    await tx.delete(recipeSources).where(eq(recipeSources.recipeId, id));

    await tx.insert(recipeSources).values(parsed.data.sources.map((source) => ({
      id: crypto.randomUUID(),
      recipeId: id,
      url: source.url,
      notes: source.notes || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })));
  });

  revalidatePath(`/recipes/${id}`);
  revalidatePath(`/recipes/${id}/edit`);
  redirect(`/recipes/${id}`);
}

export async function markCookedTodayAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const db = getDb();
  const timestamp = now();

  await db.update(recipes).set({
    lastCookedAt: timestamp,
    updatedAt: timestamp,
  }).where(eq(recipes.id, id));

  revalidatePath(`/recipes/${id}`);
}

export async function deleteRecipeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const db = getDb();
  await db.delete(recipes).where(eq(recipes.id, id));

  revalidatePath("/");
  redirect("/");
}

export async function deleteRecipeSourceAction(formData: FormData): Promise<void> {
  const recipeId = String(formData.get("recipeId") ?? "");
  const sourceId = String(formData.get("sourceId") ?? "");
  if (!recipeId || !sourceId) {
    return;
  }

  const db = getDb();
  await db.delete(recipeSources).where(and(eq(recipeSources.id, sourceId), eq(recipeSources.recipeId, recipeId)));

  revalidatePath(`/recipes/${recipeId}`);
}
