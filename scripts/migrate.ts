import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error("Missing TURSO_DATABASE_URL");

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function ensureMigrationsTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at INTEGER NOT NULL
    );
  `);
}

async function main() {
  await ensureMigrationsTable();

  const migrationDir = path.join(process.cwd(), "migrations");
  const files = (await fs.readdir(migrationDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const already = await client.execute({
      sql: "SELECT 1 FROM __drizzle_migrations WHERE name = ? LIMIT 1",
      args: [file],
    });

    if (already.rows.length > 0) {
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

    console.log(`Applied migration: ${file}`);
  }

  console.log("Migrations complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
