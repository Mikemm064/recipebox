import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/src/db/schema";

function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("Missing TURSO_DATABASE_URL");
  }

  if (!authToken) {
    throw new Error("Missing TURSO_AUTH_TOKEN");
  }

  return createClient({
    url,
    authToken,
  });
}

export function getDbClient(): Client {
  return createDbClient();
}

export function getDb(): LibSQLDatabase<typeof schema> {
  return drizzle(createDbClient(), { schema });
}
