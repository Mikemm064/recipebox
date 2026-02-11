import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryRecipeList } from "@/src/components/CategoryRecipeList";
import { ConfirmButton } from "@/src/components/ConfirmButton";
import { deleteCategoryAction, renameCategoryAction } from "@/src/lib/actions";
import { getCategoryWithRecipes, isDatabaseInitialized } from "@/src/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, dbInitialized] = await Promise.all([getCategoryWithRecipes(id), isDatabaseInitialized()]);
  if (!data) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{data.category.name}</h1>
        <Link href={`/recipes/new?categoryId=${data.category.id}`} className="rounded-md bg-slate-900 px-3 py-2 text-white">Add Dish</Link>
      </div>

      {!dbInitialized && <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">DB not initialized. Showing stub data.</p>}

      <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-3">
        <form action={renameCategoryAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={data.category.id} />
          <input name="name" defaultValue={data.category.name} aria-label="Category name" />
          <button className="bg-slate-200">Rename</button>
        </form>

        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={data.category.id} />
          <ConfirmButton confirmMessage="Delete this category and all dishes?" className="bg-red-100 text-red-700">
            Delete Category
          </ConfirmButton>
        </form>
      </div>

      <CategoryRecipeList items={data.items.map((item) => ({ id: item.id, title: item.title, notes: item.notes }))} />
    </div>
  );
}
