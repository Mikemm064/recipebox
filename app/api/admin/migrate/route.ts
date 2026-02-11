import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";
import { runMigrations } from "@/src/lib/migrations";

export async function POST(request: Request) {
  const adminKey = request.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.APP_PASSWORD) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    return NextResponse.json({ success: false, error: "Missing TURSO_DATABASE_URL" }, { status: 500 });
  }

  try {
    const client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const result = await runMigrations(client);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Migration failed",
      },
      { status: 500 },
    );
  }
}
