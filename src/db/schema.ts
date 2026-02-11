import { index, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", (t) => ({
  id: t.text("id").primaryKey(),
  name: t.text("name").notNull(),
  createdAt: t.integer("created_at").notNull(),
  updatedAt: t.integer("updated_at").notNull(),
}), (t) => [uniqueIndex("categories_name_unique").on(t.name)]);

export const recipes = sqliteTable("recipes", (t) => ({
  id: t.text("id").primaryKey(),
  categoryId: t.text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  title: t.text("title").notNull(),
  notes: t.text("notes"),
  lastCookedAt: t.integer("last_cooked_at"),
  createdAt: t.integer("created_at").notNull(),
  updatedAt: t.integer("updated_at").notNull(),
}), (t) => [index("recipes_category_id_idx").on(t.categoryId)]);

export const recipeSources = sqliteTable("recipe_sources", (t) => ({
  id: t.text("id").primaryKey(),
  recipeId: t.text("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  url: t.text("url").notNull(),
  notes: t.text("notes"),
  createdAt: t.integer("created_at").notNull(),
  updatedAt: t.integer("updated_at").notNull(),
}), (t) => [index("recipe_sources_recipe_id_idx").on(t.recipeId)]);
