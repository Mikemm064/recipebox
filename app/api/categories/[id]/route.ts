import { NextResponse } from "next/server";
import { getCategory, getRecipesByCategory } from "@/src/lib/stubData";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = getCategory(id);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    category,
    items: getRecipesByCategory(id),
  });
}
