import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryRecipeList } from "@/src/components/CategoryRecipeList";
import { ConfirmButton } from "@/src/components/ConfirmButton";
import { deleteCategoryAction, renameCategoryAction } from "@/src/lib/actions";
import { getCategoryWithRecipes } from "@/src/lib/data";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const data = await getCategoryWithRecipes(id);
  if (!data) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{data.category.name}</h1>
        <Link href={`/recipes/new?categoryId=${data.category.id}`} className="rounded-md bg-slate-900 px-3 py-2 text-white">Add Dish</Link>
      </div>

      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-3">
        <form action={renameCategoryAction} className="flex gap-2">
          <input type="hidden" name="id" value={data.category.id} />
          <input name="name" defaultValue={data.category.name} required />
          <button className="bg-slate-200">Rename</button>
        </form>
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={data.category.id} />
          <ConfirmButton className="bg-red-100 text-red-700" message="Delete this category and all its dishes?">
            Delete Category
          </ConfirmButton>
        </form>
      </div>

      <CategoryRecipeList items={data.items.map((item) => ({ id: item.id, title: item.title, notes: item.notes }))} />
    </div>
  );
}
