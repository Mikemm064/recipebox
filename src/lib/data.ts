import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db/client";
import { categories, recipes, recipeSources } from "@/src/db/schema";

export async function globalSearch(query: string) {
  const normalized = query.trim();
  if (!normalized) return [];

  const result = await db.run(sql`
    SELECT recipes.id as id, recipes.title as title, categories.name as category_name
    FROM recipes_fts
    JOIN recipes ON recipes.rowid = recipes_fts.rowid
    JOIN categories ON categories.id = recipes.category_id
    WHERE recipes_fts MATCH ${normalized + "*"}
    ORDER BY bm25(recipes_fts), recipes.updated_at DESC
    LIMIT 20
  `);

  return result.rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    categoryName: String(row.category_name),
  }));
}

export async function getSidebarCategories() {
  return db.select({
    id: categories.id,
    name: categories.name,
    count: count(recipes.id),
  }).from(categories).leftJoin(recipes, eq(recipes.categoryId, categories.id)).groupBy(categories.id).orderBy(categories.sortOrder, categories.name);
}

export async function getRecentRecipes() {
  return db.select({
    id: recipes.id,
    title: recipes.title,
    updatedAt: recipes.updatedAt,
    categoryName: categories.name,
  }).from(recipes).innerJoin(categories, eq(recipes.categoryId, categories.id)).orderBy(desc(recipes.updatedAt)).limit(10);
}

export async function getCategoryWithRecipes(id: string) {
  const category = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  if (!category) return null;

  const items = await db.query.recipes.findMany({
    where: eq(recipes.categoryId, id),
    orderBy: [desc(recipes.updatedAt)],
  });

  return { category, items };
}

export async function getRecipe(id: string) {
  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
  });
  if (!recipe) return null;

  const [category] = await db.select({
    id: categories.id,
    name: categories.name,
  }).from(categories).where(eq(categories.id, recipe.categoryId)).limit(1);

  const sources = await db.query.recipeSources.findMany({
    where: eq(recipeSources.recipeId, id),
    orderBy: [desc(recipeSources.createdAt)],
  });

  return {
    ...recipe,
    category: category ?? { id: recipe.categoryId, name: "Unknown" },
    sources,
  };
}

export async function getAllCategories() {
  return db.query.categories.findMany({ orderBy: [categories.sortOrder, categories.name] });
}
