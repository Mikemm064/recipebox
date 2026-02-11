import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryRecipeList } from "@/src/components/CategoryRecipeList";
import { DbDisabledButton } from "@/src/components/DbDisabledButton";
import { getCategoryWithRecipes } from "@/src/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCategoryWithRecipes(id);
  if (!data) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{data.category.name}</h1>
        <Link href={`/recipes/new?categoryId=${data.category.id}`} className="rounded-md bg-slate-900 px-3 py-2 text-white">Add Dish</Link>
      </div>

      <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">DB not connected yet</p>

      <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-3">
        <input value={data.category.name} readOnly aria-label="Category name" />
        <DbDisabledButton label="Rename" className="bg-slate-200" />
        <DbDisabledButton label="Delete Category" className="bg-red-100 text-red-700" />
      </div>

      <CategoryRecipeList items={data.items.map((item) => ({ id: item.id, title: item.title, notes: item.notes }))} />
    </div>
  );
}
