import { and, desc, eq, sql } from "drizzle-orm";
import { categories, recipes, recipeSources } from "@/src/db/schema";
import { getDb } from "@/src/db/client";
import {
  getCategories as getStubCategories,
  getCategory as getStubCategory,
  getRecipe as getStubRecipe,
  getRecipesByCategory as getStubRecipesByCategory,
  searchRecipes as searchStubRecipes,
} from "@/src/lib/stubData";

function isNoSuchTableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.toLowerCase().includes("no such table");
}

async function withStubFallback<T>(dbCall: () => Promise<T>, stubCall: () => T): Promise<{ data: T; isFallback: boolean }> {
  try {
    return { data: await dbCall(), isFallback: false };
  } catch (error) {
    if (isNoSuchTableError(error)) {
      return { data: stubCall(), isFallback: true };
    }

    throw error;
  }
}

export async function globalSearch(query: string) {
  const db = getDb();

  const { data } = await withStubFallback(async () => {
    const normalized = query.trim();
    if (!normalized) {
      return [] as Array<{ id: string; title: string; categoryName: string }>;
    }

    const result = await db.run(sql`
      SELECT recipes.id, recipes.title, categories.name AS category_name
      FROM recipes_fts
      JOIN recipes ON recipes_fts.rowid = recipes.rowid
      LEFT JOIN categories ON categories.id = recipes.category_id
      WHERE recipes_fts MATCH ${normalized}
      ORDER BY bm25(recipes_fts)
      LIMIT 20
    `);

    return result.rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      categoryName: row.category_name ? String(row.category_name) : "Unknown",
    }));
  }, () => searchStubRecipes(query));

  return data;
}

export async function getSidebarCategories() {
  const db = getDb();

  const { data } = await withStubFallback(async () => {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        count: sql<number>`count(${recipes.id})`,
      })
      .from(categories)
      .leftJoin(recipes, eq(recipes.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(categories.name);

    return rows.map((row) => ({ ...row, count: Number(row.count) }));
  }, () => getStubCategories().map((category) => ({
    ...category,
    count: getStubRecipesByCategory(category.id).length,
  })));

  return data;
}

export async function getRecentRecipes() {
  const db = getDb();

  const { data } = await withStubFallback(async () => {
    const rows = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        updatedAt: recipes.updatedAt,
        categoryName: categories.name,
      })
      .from(recipes)
      .leftJoin(categories, eq(categories.id, recipes.categoryId))
      .orderBy(desc(recipes.updatedAt))
      .limit(10);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      updatedAt: new Date(Number(row.updatedAt)).toISOString(),
      categoryName: row.categoryName ?? "Unknown",
    }));
  }, () => getStubCategories()
    .flatMap((category) =>
      getStubRecipesByCategory(category.id).map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        updatedAt: recipe.updatedAt,
        categoryName: category.name,
      })),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10));

  return data;
}

export async function getCategoryWithRecipes(id: string) {
  const db = getDb();

  const { data } = await withStubFallback(async () => {
    const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!category) {
      return null;
    }

    const items = await db
      .select()
      .from(recipes)
      .where(eq(recipes.categoryId, id))
      .orderBy(desc(recipes.updatedAt));

    return {
      category,
      items: items.map((item) => ({
        ...item,
        notes: item.notes,
        updatedAt: new Date(Number(item.updatedAt)).toISOString(),
        lastCookedAt: item.lastCookedAt ? new Date(Number(item.lastCookedAt)).toISOString() : null,
      })),
    };
  }, () => {
    const category = getStubCategory(id);
    if (!category) {
      return null;
    }

    return {
      category,
      items: getStubRecipesByCategory(id),
    };
  });

  return data;
}

export async function getRecipe(id: string) {
  const db = getDb();

  const { data } = await withStubFallback(async () => {
    const rows = await db
      .select({
        id: recipes.id,
        categoryId: recipes.categoryId,
        title: recipes.title,
        notes: recipes.notes,
        updatedAt: recipes.updatedAt,
        lastCookedAt: recipes.lastCookedAt,
        categoryName: categories.name,
      })
      .from(recipes)
      .leftJoin(categories, eq(categories.id, recipes.categoryId))
      .where(eq(recipes.id, id))
      .limit(1);

    const recipe = rows[0];
    if (!recipe) {
      return null;
    }

    const sources = await db.select().from(recipeSources).where(eq(recipeSources.recipeId, recipe.id));

    return {
      id: recipe.id,
      categoryId: recipe.categoryId,
      title: recipe.title,
      notes: recipe.notes,
      updatedAt: new Date(Number(recipe.updatedAt)).toISOString(),
      lastCookedAt: recipe.lastCookedAt ? new Date(Number(recipe.lastCookedAt)).toISOString() : null,
      category: { id: recipe.categoryId, name: recipe.categoryName ?? "Unknown" },
      sources,
    };
  }, () => getStubRecipe(id));

  return data;
}

export async function getAllCategories() {
  const db = getDb();

  const { data } = await withStubFallback(async () => {
    return db.select().from(categories).orderBy(categories.name);
  }, () => getStubCategories());

  return data;
}

export async function isDatabaseInitialized() {
  const db = getDb();

  try {
    const result = await db.run(sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('categories', 'recipes', 'recipe_sources')`);
    return result.rows.length === 3;
  } catch (error) {
    if (isNoSuchTableError(error)) {
      return false;
    }

    throw error;
  }
}

export async function isDbReadyForWrites() {
  return isDatabaseInitialized();
}

export async function getRecipeByCategoryAndTitle(categoryId: string, title: string) {
  const db = getDb();

  const rows = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(and(eq(recipes.categoryId, categoryId), eq(recipes.title, title)))
    .limit(1);

  return rows[0] ?? null;
}
