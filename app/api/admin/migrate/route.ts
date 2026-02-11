import { NextResponse } from "next/server";
import { runMigrations } from "@/src/db/migrate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const adminKey = request.headers.get("x-admin-key");
  if (!process.env.APP_PASSWORD || adminKey !== process.env.APP_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applied = await runMigrations();
    return NextResponse.json({ ok: true, applied });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Migration failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
