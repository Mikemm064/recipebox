import fs from "node:fs/promises";
import path from "node:path";
import type { Client } from "@libsql/client";

async function ensureMigrationsTable(client: Client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at INTEGER NOT NULL
    );
  `);
}

export async function runMigrations(client: Client): Promise<{ applied: string[]; skipped: string[] }> {
  await ensureMigrationsTable(client);

  const migrationDir = path.join(process.cwd(), "migrations");
  const files = (await fs.readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();

  const applied: string[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const already = await client.execute({
      sql: "SELECT 1 FROM __drizzle_migrations WHERE name = ? LIMIT 1",
      args: [file],
    });

    if (already.rows.length > 0) {
      skipped.push(file);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationDir, file), "utf8");
    await client.batch(
      sql
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter(Boolean)
        .map((statement) => ({ sql: statement, args: [] })),
      "write",
    );

    await client.execute({
      sql: "INSERT INTO __drizzle_migrations (name, executed_at) VALUES (?, ?)",
      args: [file, Date.now()],
    });

    applied.push(file);
  }

  return { applied, skipped };
}
