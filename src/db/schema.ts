import { sqliteTable } from "drizzle-orm/sqlite-core";

// --------------------
// categories
// --------------------
export const categories = sqliteTable("categories", (t) => ({
  id: t.text("id").primaryKey(),
  name: t.text("name").notNull().unique(),
  sortOrder: t.integer("sort_order").notNull().default(0),
  createdAt: t.integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: t.integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}));

// --------------------
// recipes (dish)
// --------------------
export const recipes = sqliteTable("recipes", (t) => ({
  id: t.text("id").primaryKey(),
  categoryId: t
    .text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  title: t.text("title").notNull(),
  notes: t.text("notes"),
  lastCookedAt: t.integer("last_cooked_at", { mode: "timestamp_ms" }),
  createdAt: t.integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: t.integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}));

// --------------------
// recipe_sources
// --------------------
export const recipeSources = sqliteTable("recipe_sources", (t) => ({
  id: t.text("id").primaryKey(),
  recipeId: t
    .text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  url: t.text("url").notNull(),
  title: t.text("title"),
  notes: t.text("notes"),
  createdAt: t.integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: t.integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}));
