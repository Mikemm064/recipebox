import { NextResponse } from "next/server";
import { searchRecipes } from "@/src/lib/stubData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  return NextResponse.json(searchRecipes(q));
}
