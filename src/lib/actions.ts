"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/src/db/client";
import { categories, recipes, recipeSources } from "@/src/db/schema";
import { clearAuthCookie } from "@/src/lib/auth";
import { categorySchema, recipeSchema } from "@/src/lib/validation";

function withError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
  throw new Error("Unreachable after redirect");
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookie();
  redirect("/login");
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    withError("/", parsed.error.issues[0]?.message ?? "Invalid category");
  }

  const now = new Date();
  await db.insert(categories).values({
    id: crypto.randomUUID(),
    name: parsed.data.name,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/");
}

export async function renameCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!id) {
    withError("/", "Invalid category");
  }
  if (!parsed.success) {
    withError(`/categories/${id}`, parsed.error.issues[0]?.message ?? "Invalid category");
  }

  await db.update(categories).set({ name: parsed.data.name, updatedAt: new Date() }).where(eq(categories.id, id));
  revalidatePath("/");
  revalidatePath(`/categories/${id}`);
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    withError("/", "Missing id");
  }
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/");
  redirect("/");
}

function parseRecipePayload(formData: FormData) {
  const sourcesRaw = String(formData.get("sources") ?? "[]");
  let parsedSources: Array<{ url: string; notes?: string }>;

  try {
    parsedSources = JSON.parse(sourcesRaw) as Array<{ url: string; notes?: string }>;
  } catch {
    return { success: false as const, error: { issues: [{ message: "Invalid source data" }] } };
  }

  return recipeSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    rating: formData.get("rating"),
    sources: parsedSources,
  });
}

export async function createRecipeAction(formData: FormData): Promise<void> {
  const parsed = parseRecipePayload(formData);
  if (!parsed.success) {
    withError("/recipes/new", parsed.error.issues[0]?.message ?? "Invalid recipe");
  }
  const now = new Date();
  const id = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(recipes).values({
      id,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      rating: typeof parsed.data.rating === "number" ? parsed.data.rating : null,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(recipeSources).values(
      parsed.data.sources.map((source) => ({
        id: crypto.randomUUID(),
        recipeId: id,
        url: source.url,
        notes: source.notes || null,
        createdAt: now,
        updatedAt: now,
      })),
    );
  });

  revalidatePath("/");
  revalidatePath(`/categories/${parsed.data.categoryId}`);
  redirect(`/recipes/${id}`);
}

export async function updateRecipeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    withError("/", "Missing recipe id");
  }

  const parsed = parseRecipePayload(formData);
  if (!parsed.success) {
    withError(`/recipes/${id}/edit`, parsed.error.issues[0]?.message ?? "Invalid recipe");
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(recipes).set({
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      rating: typeof parsed.data.rating === "number" ? parsed.data.rating : null,
      updatedAt: now,
    }).where(eq(recipes.id, id));

    await tx.delete(recipeSources).where(eq(recipeSources.recipeId, id));
    await tx.insert(recipeSources).values(
      parsed.data.sources.map((source) => ({
        id: crypto.randomUUID(),
        recipeId: id,
        url: source.url,
        notes: source.notes || null,
        createdAt: now,
        updatedAt: now,
      })),
    );
  });

  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
  revalidatePath(`/categories/${parsed.data.categoryId}`);
  redirect(`/recipes/${id}`);
}

export async function deleteRecipeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!id) {
    withError("/", "Missing recipe id");
  }
  await db.delete(recipes).where(eq(recipes.id, id));
  revalidatePath("/");
  if (categoryId) revalidatePath(`/categories/${categoryId}`);
  redirect("/");
}

export async function cookedTodayAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    withError("/", "Missing recipe id");
  }
  await db.update(recipes).set({ lastCookedAt: new Date(), updatedAt: new Date() }).where(eq(recipes.id, id));
  revalidatePath(`/recipes/${id}`);
  revalidatePath("/");
}
