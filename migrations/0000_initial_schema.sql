CREATE TABLE `categories` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);
--> statement-breakpoint
CREATE TABLE `recipes` (
  `id` text PRIMARY KEY NOT NULL,
  `category_id` text NOT NULL,
  `title` text NOT NULL,
  `notes` text,
  `last_cooked_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recipe_sources` (
  `id` text PRIMARY KEY NOT NULL,
  `recipe_id` text NOT NULL,
  `url` text NOT NULL,
  `title` text,
  `notes` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `recipe_sources_recipe_id_idx` ON `recipe_sources` (`recipe_id`);
--> statement-breakpoint
CREATE VIRTUAL TABLE recipes_fts USING fts5(
  title,
  notes,
  content='recipes',
  content_rowid='rowid'
);
--> statement-breakpoint
CREATE TRIGGER recipes_ai AFTER INSERT ON recipes BEGIN
  INSERT INTO recipes_fts(rowid, title, notes)
  VALUES (new.rowid, new.title, coalesce(new.notes, ''));
END;
--> statement-breakpoint
CREATE TRIGGER recipes_ad AFTER DELETE ON recipes BEGIN
  INSERT INTO recipes_fts(recipes_fts, rowid, title, notes)
  VALUES('delete', old.rowid, old.title, coalesce(old.notes, ''));
END;
--> statement-breakpoint
CREATE TRIGGER recipes_au AFTER UPDATE ON recipes BEGIN
  INSERT INTO recipes_fts(recipes_fts, rowid, title, notes)
  VALUES('delete', old.rowid, old.title, coalesce(old.notes, ''));
  INSERT INTO recipes_fts(rowid, title, notes)
  VALUES (new.rowid, new.title, coalesce(new.notes, ''));
END;
--> statement-breakpoint
INSERT INTO recipes_fts(rowid, title, notes)
SELECT rowid, title, coalesce(notes, '') FROM recipes;
