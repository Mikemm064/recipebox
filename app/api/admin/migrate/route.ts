import { NextResponse } from "next/server";
import { getDb } from "@/src/db/client";
import { runMigrations } from "@/src/db/migrate";

export const runtime = "nodejs";

export async function POST() {
  try {
    getDb();
    const applied = await runMigrations();
    return NextResponse.json({ success: true, applied }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Migration failed";

    if (message === "Missing TURSO_DATABASE_URL" || message === "Missing TURSO_AUTH_TOKEN") {
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }

    const stack = error instanceof Error && error.stack
      ? error.stack.split("\n").slice(0, 5).join("\n")
      : undefined;

    return NextResponse.json({ success: false, error: message, stack }, { status: 500 });
  }
}
