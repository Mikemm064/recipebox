import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/src/db/schema";

let clientSingleton: Client | null = null;
let dbSingleton: LibSQLDatabase<typeof schema> | null = null;

function getConnectionConfig() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_DB_AUTH_TOKEN;

  if (!url) {
    throw new Error("Missing TURSO_DATABASE_URL");
  }

  if (!authToken) {
    throw new Error("Missing TURSO_AUTH_TOKEN (or TURSO_DB_AUTH_TOKEN fallback)");
  }

  return {
    url,
    authToken,
  };
}

export function getDbClient(): Client {
  if (!clientSingleton) {
    clientSingleton = createClient(getConnectionConfig());
  }

  return clientSingleton;
}

export function getDb(): LibSQLDatabase<typeof schema> {
  if (!dbSingleton) {
    dbSingleton = drizzle(getDbClient(), { schema });
  }

  return dbSingleton;
}
