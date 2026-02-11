import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/src/components/ConfirmButton";
import { CopyLinksButton } from "@/src/components/CopyLinksButton";
import { deleteRecipeAction, markCookedTodayAction } from "@/src/lib/actions";
import { getRecipe, isDatabaseInitialized } from "@/src/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [recipe, dbInitialized] = await Promise.all([getRecipe(id), isDatabaseInitialized()]);
  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-semibold">{recipe.title}</h1>
        <Link href={`/categories/${recipe.category.id}`} className="text-sm text-slate-600 underline">{recipe.category.name}</Link>
        {recipe.notes && <p className="mt-3 whitespace-pre-wrap text-slate-700">{recipe.notes}</p>}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span>Last cooked: {recipe.lastCookedAt ? new Date(recipe.lastCookedAt).toLocaleDateString() : "Never"}</span>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Source links</h2>
        <div className="mt-3 space-y-3">
          {recipe.sources.map((source) => (
            <div key={source.id} className="rounded-md border border-slate-200 p-3">
              <a href={source.url} target="_blank" rel="noreferrer" className="break-all text-blue-700 underline">{source.url}</a>
              {source.notes && <p className="mt-1 text-sm text-slate-600">{source.notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {!dbInitialized && <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">DB not initialized. Showing stub data.</p>}

      <div className="flex flex-wrap gap-2">
        <Link href={`/recipes/${recipe.id}/edit`} className="rounded-md bg-slate-900 px-3 py-2 text-white">Edit</Link>
        <form action={markCookedTodayAction}>
          <input type="hidden" name="id" value={recipe.id} />
          <button className="bg-green-100 px-3 py-2 text-green-700">Cooked today</button>
        </form>
        <form action={deleteRecipeAction}>
          <input type="hidden" name="id" value={recipe.id} />
          <ConfirmButton confirmMessage="Delete this recipe?" className="bg-red-100 px-3 py-2 text-red-700">Delete</ConfirmButton>
        </form>
        <CopyLinksButton links={recipe.sources.map((source) => source.url)} />
      </div>
    </div>
  );
}
