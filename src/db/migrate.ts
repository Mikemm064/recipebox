import { promises as fs } from "node:fs";
import path from "node:path";
import { getDbClient } from "@/src/db/client";

function splitSqlStatements(sql: string): string[] {
  if (sql.includes("--> statement-breakpoint")) {
    return sql
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);
  }

  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => `${statement};`);
}

export async function runMigrations(): Promise<string[]> {
  const client = getDbClient();

  await client.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL
    )
  `);

  const migrationsDir = path.join(process.cwd(), "migrations");
  const entries = await fs.readdir(migrationsDir);
  const migrationFiles = entries.filter((entry) => entry.endsWith(".sql")).sort();

  const appliedRows = await client.execute("SELECT name FROM __drizzle_migrations");
  const applied = new Set((appliedRows.rows ?? []).map((row) => String(row.name)));

  const newlyApplied: string[] = [];

  for (const fileName of migrationFiles) {
    if (applied.has(fileName)) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, fileName), "utf8");
    const statements = splitSqlStatements(sql);

    for (const statement of statements) {
      await client.execute(statement);
    }

    await client.execute({
      sql: "INSERT INTO __drizzle_migrations (name, applied_at) VALUES (?, ?)",
      args: [fileName, Date.now()],
    });

    newlyApplied.push(fileName);
  }

  return newlyApplied;
}
