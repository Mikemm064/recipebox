import { NextResponse } from "next/server";
import { getDb } from "@/src/db/client";
import { runMigrations } from "@/src/db/migrate";

export const runtime = "nodejs";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function getErrorStack(error: unknown): string | undefined {
  if (!(error instanceof Error) || !error.stack) {
    return undefined;
  }

  return error.stack.split("\n").slice(0, 5).join("\n");
}

export async function POST() {
  try {
    getDb();
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "Missing TURSO_DATABASE_URL" || message === "Missing TURSO_AUTH_TOKEN") {
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: message, stack: getErrorStack(error) }, { status: 500 });
  }

  try {
    const applied = await runMigrations();
    return NextResponse.json({ success: true, applied }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
        stack: getErrorStack(error),
      },
      { status: 500 },
    );
  }
}
