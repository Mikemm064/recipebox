import { NextResponse } from "next/server";
import { getDb } from "@/src/db/client";
import { runMigrations } from "@/src/db/migrate";

export const runtime = "nodejs";

export async function POST() {
  if (!process.env.TURSO_DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Missing TURSO_DATABASE_URL" }, { status: 500 });
  }

  if (!process.env.TURSO_AUTH_TOKEN && !process.env.TURSO_DB_AUTH_TOKEN) {
    return NextResponse.json({ success: false, error: "Missing TURSO_AUTH_TOKEN (or TURSO_DB_AUTH_TOKEN fallback)" }, { status: 500 });
  }

  try {
    getDb();
    const applied = await runMigrations();
    return NextResponse.json({ success: true, applied });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Migration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
