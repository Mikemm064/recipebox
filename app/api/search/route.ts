import { NextResponse } from "next/server";
import { globalSearch } from "@/src/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await globalSearch(q);
  return NextResponse.json(results);
}
