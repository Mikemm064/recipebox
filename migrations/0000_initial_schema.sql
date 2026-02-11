CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique ON categories (name);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  last_cooked_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS recipes_category_id_idx ON recipes (category_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS recipe_sources (
  id TEXT PRIMARY KEY NOT NULL,
  recipe_id TEXT NOT NULL,
  url TEXT NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS recipe_sources_recipe_id_idx ON recipe_sources (recipe_id);
--> statement-breakpoint
CREATE VIRTUAL TABLE IF NOT EXISTS recipes_fts USING fts5(
  title,
  notes,
  content='recipes',
  content_rowid='rowid'
);
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS recipes_ai AFTER INSERT ON recipes BEGIN
  INSERT INTO recipes_fts(rowid, title, notes)
  VALUES (new.rowid, new.title, coalesce(new.notes, ''));
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS recipes_ad AFTER DELETE ON recipes BEGIN
  INSERT INTO recipes_fts(recipes_fts, rowid, title, notes)
  VALUES('delete', old.rowid, old.title, coalesce(old.notes, ''));
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS recipes_au AFTER UPDATE ON recipes BEGIN
  INSERT INTO recipes_fts(recipes_fts, rowid, title, notes)
  VALUES('delete', old.rowid, old.title, coalesce(old.notes, ''));
  INSERT INTO recipes_fts(rowid, title, notes)
  VALUES (new.rowid, new.title, coalesce(new.notes, ''));
END;
--> statement-breakpoint
INSERT INTO recipes_fts(rowid, title, notes)
SELECT rowid, title, coalesce(notes, '') FROM recipes;
