import { config } from "dotenv";
import { createClient } from "@libsql/client";
import { runMigrations } from "@/src/lib/migrations";

config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error("Missing TURSO_DATABASE_URL");

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const result = await runMigrations(client);
  for (const file of result.applied) {
    console.log(`Applied migration: ${file}`);
  }

  console.log("Migrations complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
